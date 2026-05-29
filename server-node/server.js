require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

// ─── Config ──────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'change-me';
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'dinein';
const PORT = parseInt(process.env.PORT || '5000', 10);

if (!MONGODB_URI) {
  console.error('ERROR: Set MONGODB_URI in your .env file');
  process.exit(1);
}

// ─── App ─────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ─── DB ──────────────────────────────────────────────────────────────────────
let db;

async function connectDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  db = client.db(MONGODB_DB_NAME);

  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('customers').createIndex({ sessionid: 1 }, { unique: true });
  await db.collection('foods').createIndex({ id: 1 }, { unique: true });
  await db.collection('foods').createIndex({ name: 1 }, { unique: true });
  await db.collection('orders').createIndex({ orderid: 1 }, { unique: true });
  await db.collection('orders').createIndex({ sessionid: 1, date_ordered: -1 });

  console.log(`Connected to MongoDB database: ${MONGODB_DB_NAME}`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function nextSequence(name) {
  const doc = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return doc.seq;
}

function createToken(identity) {
  return jwt.sign({ sub: identity }, JWT_SECRET, { expiresIn: '30d' });
}

function jsonError(res, message, status = 400) {
  return res.status(status).json({ error: message });
}

function parseIntVal(value, fieldName) {
  const n = parseInt(value, 10);
  if (isNaN(n)) throw new Error(`${fieldName} must be a number`);
  return n;
}

function normalizeTableNumber(tableno) {
  if (tableno == null || tableno === '') throw new Error('Table number is required');
  const s = String(tableno).trim();
  if (!/^\d+$/.test(s)) throw new Error('Table number must contain digits only');
  const n = parseInt(s, 10);
  if (n <= 0) throw new Error('Table number must be greater than 0');
  return n;
}

function serializeFood(doc) {
  return { id: doc.id, name: doc.name, description: doc.description, amount: doc.amount };
}

function serializeOrder(doc) {
  return {
    orderid: doc.orderid,
    status: doc.status,
    food: doc.food,
    tableno: doc.tableno,
    amount: doc.amount,
    datetime: doc.date_ordered,
    sessionid: doc.sessionid,
    customer_name: doc.customer_name || '',
    payment_status: doc.payment_status || 'unpaid',
    payment_method: doc.payment_method,
    paid_at: doc.paid_at,
  };
}

function serializeCustomer(doc) {
  return {
    customer_id: doc.customer_id,
    customer_name: doc.customer_name,
    customer_email: doc.customer_email,
    mobileno: doc.mobileno,
    no_of_guests: doc.no_of_guests,
    sessionid: doc.sessionid,
    tableno: doc.tableno,
  };
}

function parseFoodItems(food) {
  if (Array.isArray(food)) return food;
  if (typeof food === 'string') {
    try {
      const parsed = JSON.parse(food);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function calculateFoodTotal(items) {
  let total = 0;
  for (const item of items) {
    const price = parseInt(item.price != null ? item.price : item.amount ?? 0, 10);
    const qty = parseInt(item.quantity ?? 1, 10);
    if (isNaN(price) || isNaN(qty) || price < 0 || qty <= 0) {
      throw new Error('Invalid food item format');
    }
    total += price * qty;
  }
  return total;
}

async function markOrderPaid(res, orderId, paymentMethod) {
  if (!['online', 'cash'].includes(paymentMethod)) {
    return jsonError(res, 'payment_method must be online or cash');
  }
  const updated = await db.collection('orders').findOneAndUpdate(
    { orderid: orderId, payment_status: { $ne: 'paid' } },
    { $set: { payment_status: 'paid', payment_method: paymentMethod, paid_at: new Date(), updated_at: new Date() } },
    { returnDocument: 'after' }
  );
  if (!updated) {
    const existing = await db.collection('orders').findOne({ orderid: orderId });
    if (!existing) return jsonError(res, 'Order not found', 404);
    if (existing.payment_status === 'paid') {
      return res.json({ message: 'Order already paid', payment_method: existing.payment_method });
    }
    return jsonError(res, 'Could not update payment');
  }
  return res.json({ message: 'Payment recorded', payment_method: paymentMethod });
}

async function assignTableToCustomer(res, sessionid, tableno) {
  if (!sessionid) return jsonError(res, 'sessionid is required');
  let normalized;
  try {
    normalized = normalizeTableNumber(tableno);
  } catch (e) {
    return jsonError(res, e.message);
  }
  const result = await db.collection('customers').updateOne(
    { sessionid },
    { $set: { tableno: normalized, updated_at: new Date() } }
  );
  if (result.matchedCount === 0) return jsonError(res, 'Customer not found', 404);
  return res.json({ tableno: normalized, message: 'Table assigned' });
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Hotel app API is running with MongoDB Atlas.' });
});

// Register
app.post('/register', async (req, res) => {
  try {
    const body = req.body || {};
    const firstname = String(body.firstname || '').trim();
    const lastname = String(body.lastname || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!firstname || !lastname || !email || !password) {
      return jsonError(res, 'Missing registration fields');
    }
    if (await db.collection('users').findOne({ email })) {
      return jsonError(res, 'Email address already taken');
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.collection('users').insertOne({
      id: await nextSequence('users'),
      firstname,
      lastname,
      email,
      password: hashed,
      created_at: new Date(),
    });

    const access_token = createToken(email);
    const refresh_token = createToken(email);
    return res.json({ email, access_token, refresh_token });
  } catch (e) {
    if (e.code === 11000) return jsonError(res, 'Email address already taken');
    return jsonError(res, e.message, 500);
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    const user = await db.collection('users').findOne({ email });
    if (!user) return jsonError(res, 'User not in DB. Register as a new user');

    // Support both bcrypt hashes (new) and plain-text passwords (migrated from Python)
    let valid = false;
    if (user.password && user.password.startsWith('$2')) {
      valid = await bcrypt.compare(password, user.password);
    } else {
      // Plain-text from old Python backend — compare then upgrade
      valid = user.password === password;
      if (valid) {
        const hashed = await bcrypt.hash(password, 10);
        await db.collection('users').updateOne({ email }, { $set: { password: hashed } });
      }
    }

    if (!valid) return jsonError(res, 'Wrong credentials');

    const access_token = createToken(email);
    const refresh_token = createToken(email);
    return res.json({ email: user.email, access_token, refresh_token });
  } catch (e) {
    return jsonError(res, e.message, 500);
  }
});

// Menu — create
app.post('/menu_create', async (req, res) => {
  try {
    const body = req.body || {};
    let foodId;
    if (body.id == null || body.id === '') {
      foodId = await nextSequence('foods');
    } else {
      foodId = parseIntVal(body.id, 'id');
    }
    const name = String(body.name || '').trim();
    const description = String(body.description || '').trim();
    if (!name || !description || body.amount == null || body.amount === '') {
      return jsonError(res, 'Missing menu item fields');
    }
    const amount = parseIntVal(body.amount, 'amount');
    await db.collection('foods').insertOne({ id: foodId, name, description, amount, created_at: new Date() });
    return res.send('Done');
  } catch (e) {
    if (e.code === 11000) return jsonError(res, 'Menu item id or name already exists');
    return jsonError(res, e.message);
  }
});

// Menu — update
app.post('/menu_update/:idx', async (req, res) => {
  try {
    const foodId = parseIntVal(req.params.idx, 'idx');
    const body = req.body || {};
    const amount = parseIntVal(body.amount, 'amount');
    const result = await db.collection('foods').updateOne(
      { id: foodId },
      { $set: { name: String(body.name || '').trim(), description: String(body.description || '').trim(), amount, updated_at: new Date() } }
    );
    if (result.matchedCount === 0) return jsonError(res, 'Food item not found', 404);
    return res.send('Done');
  } catch (e) {
    return jsonError(res, e.message);
  }
});

// Menu — delete
app.post('/menu_delete', async (req, res) => {
  try {
    const body = req.body;
    const target = Array.isArray(body) ? (body[0] || {}) : (body || {});
    const foodId = parseIntVal(target.id, 'id');
    const result = await db.collection('foods').deleteOne({ id: foodId });
    if (result.deletedCount === 0) return jsonError(res, 'Food item not found', 404);
    return res.send('Done');
  } catch (e) {
    return jsonError(res, e.message);
  }
});

// Menu — list
app.get('/menu', async (req, res) => {
  try {
    const items = await db.collection('foods').find().sort({ id: 1 }).toArray();
    return res.json({ food_items: items.map(serializeFood) });
  } catch (e) {
    return jsonError(res, e.message, 500);
  }
});

// Customer details — register (POST) or lookup (GET)
app.post('/customer_details', async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const { mobile, guests } = body;

    if (!name || !email || mobile == null || mobile === '' || guests == null || guests === '') {
      return jsonError(res, 'Missing customer fields');
    }

    const accessToken = createToken(email);
    const refreshToken = createToken(email);

    if (await db.collection('customers').findOne({ sessionid: accessToken })) {
      return jsonError(res, 'Session already taking place on another window');
    }

    await db.collection('customers').insertOne({
      customer_id: await nextSequence('customers'),
      customer_name: name,
      customer_email: email,
      mobileno: parseIntVal(mobile, 'mobile'),
      no_of_guests: parseIntVal(guests, 'guests'),
      sessionid: accessToken,
      tableno: null,
      created_at: new Date(),
    });

    return res.json({ email, customer_access_token: accessToken, customer_refresh_token: refreshToken });
  } catch (e) {
    return jsonError(res, e.message);
  }
});

app.get('/customer_details', async (req, res) => {
  try {
    const sessid = req.query.sessionid;
    if (!sessid) return jsonError(res, 'sessionid is required');
    const customer = await db.collection('customers').findOne({ sessionid: sessid });
    if (!customer) return jsonError(res, 'Customer not found', 404);
    const orders = await db.collection('orders').find({ sessionid: sessid }).sort({ date_ordered: -1 }).limit(1).toArray();
    return res.json({ customer_details: orders[0] ? serializeOrder(orders[0]) : serializeCustomer(customer) });
  } catch (e) {
    return jsonError(res, e.message, 500);
  }
});

// Add table (JSON body)
app.post('/add_table', async (req, res) => {
  try {
    const { sessionid, tableno } = req.body || {};
    return await assignTableToCustomer(res, sessionid, tableno);
  } catch (e) {
    return jsonError(res, e.message, 500);
  }
});

// Add table (path param — legacy support)
app.post('/add_table/:sessionid', async (req, res) => {
  try {
    const sessionid = req.params.sessionid;
    const body = req.body;
    const tableno = typeof body === 'object' && body.tableno != null ? body.tableno : body;
    return await assignTableToCustomer(res, sessionid, tableno);
  } catch (e) {
    return jsonError(res, e.message, 500);
  }
});

// Get payment info for customer
app.post('/getpayment', async (req, res) => {
  try {
    const { sessionid } = req.body || {};
    if (!sessionid) return jsonError(res, 'sessionid is required');

    const customer = await db.collection('customers').findOne({ sessionid });
    if (!customer) return jsonError(res, 'Customer not found', 404);

    const orders = await db.collection('orders').find({ sessionid }).sort({ date_ordered: -1 }).limit(1).toArray();
    if (!orders[0]) return jsonError(res, 'No order found for this session', 404);

    const order = orders[0];
    let food = order.food;
    if (typeof food === 'string') {
      try { food = JSON.parse(food); } catch {}
    }

    return res.json({
      customer_details: {
        id: customer.customer_id,
        name: customer.customer_name,
        food: JSON.stringify(food),
        tableno: customer.tableno,
        amount: order.amount,
        orderid: order.orderid,
        payment_status: order.payment_status || 'unpaid',
        payment_method: order.payment_method,
      },
    });
  } catch (e) {
    return jsonError(res, e.message, 500);
  }
});

// Customer payment
app.post('/order_payment', async (req, res) => {
  try {
    const body = req.body || {};
    const sessid = body.sessionid;
    const paymentMethod = String(body.payment_method || '').trim().toLowerCase();
    if (!sessid) return jsonError(res, 'sessionid is required');
    if (!['online', 'cash'].includes(paymentMethod)) {
      return jsonError(res, 'payment_method must be online or cash');
    }
    const orderId = parseIntVal(body.orderid, 'orderid');
    const order = await db.collection('orders').findOne({ sessionid: sessid, orderid: orderId });
    if (!order) return jsonError(res, 'Order not found', 404);

    if (paymentMethod === 'online') {
      return await markOrderPaid(res, orderId, 'online');
    }

    await db.collection('orders').updateOne(
      { orderid: orderId },
      { $set: { payment_method: 'cash', payment_status: 'unpaid', updated_at: new Date() } }
    );
    return res.json({ message: 'Cash payment selected. Please pay at the counter.', payment_method: 'cash', payment_status: 'unpaid' });
  } catch (e) {
    return jsonError(res, e.message);
  }
});

// Admin — mark payment
app.post('/admin/payment', async (req, res) => {
  try {
    const body = req.body || {};
    const paymentMethod = String(body.payment_method || '').trim().toLowerCase();
    const orderId = parseIntVal(body.orderid, 'orderid');
    return await markOrderPaid(res, orderId, paymentMethod);
  } catch (e) {
    return jsonError(res, e.message);
  }
});

// Orders — list (GET) or place (POST)
app.get('/order', async (req, res) => {
  try {
    const items = await db.collection('orders').find().sort({ date_ordered: -1 }).toArray();
    return res.json({ order_items: items.map(serializeOrder) });
  } catch (e) {
    return jsonError(res, e.message, 500);
  }
});

app.post('/order', async (req, res) => {
  try {
    const body = req.body || {};
    const sessid = body.sessionid;
    if (!sessid) return jsonError(res, 'sessionid is required');

    const customer = await db.collection('customers').findOne({ sessionid: sessid });
    if (!customer) return jsonError(res, 'Customer not found', 404);

    const foodItems = parseFoodItems(body.food);
    if (!foodItems.length) return jsonError(res, 'At least one food item is required');

    const clientTotal = parseIntVal(body.grandtotal, 'grandtotal');
    const computedTotal = calculateFoodTotal(foodItems);
    if (clientTotal !== computedTotal) {
      return jsonError(res, 'Order total mismatch. Please refresh cart and try again.');
    }

    await db.collection('orders').insertOne({
      orderid: await nextSequence('orders'),
      status: 'Food is being prepared',
      food: typeof body.food === 'string' ? body.food : JSON.stringify(foodItems),
      amount: computedTotal,
      date_ordered: new Date(),
      tableno: customer.tableno,
      sessionid: sessid,
      customer_name: customer.customer_name,
      payment_status: 'unpaid',
      payment_method: null,
      paid_at: null,
    });

    return res.send('Done');
  } catch (e) {
    return jsonError(res, e.message);
  }
});

// Cancel order
app.post('/order_cancel', async (req, res) => {
  try {
    const { sessionid, orderid } = req.body || {};
    if (!sessionid || orderid == null || orderid === '') {
      return jsonError(res, 'sessionid and orderid are required');
    }
    const orderId = parseIntVal(orderid, 'orderid');
    const result = await db.collection('orders').deleteOne({ sessionid, orderid: orderId });
    if (result.deletedCount === 0) return jsonError(res, 'Order not found', 404);
    return res.send('Done');
  } catch (e) {
    return jsonError(res, e.message);
  }
});

// Delete order
app.post('/order_delete', async (req, res) => {
  try {
    const body = req.body;
    const target = Array.isArray(body) ? (body[0] || {}) : (body || {});
    const orderId = parseIntVal(target.orderid, 'orderid');
    const result = await db.collection('orders').deleteOne({ orderid: orderId });
    if (result.deletedCount === 0) return jsonError(res, 'Order not found', 404);
    return res.send('Done');
  } catch (e) {
    return jsonError(res, e.message);
  }
});

// Update order status
app.post('/update_status/:idx', async (req, res) => {
  try {
    const orderId = parseIntVal(req.params.idx, 'idx');
    const status = String((req.body || {}).status || '').trim();
    if (!status) return jsonError(res, 'status is required');
    const result = await db.collection('orders').updateOne(
      { orderid: orderId },
      { $set: { status, updated_at: new Date() } }
    );
    if (result.matchedCount === 0) return jsonError(res, 'Order not found', 404);
    return res.send('Done');
  } catch (e) {
    return jsonError(res, e.message);
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Self-ping every 14 minutes to prevent Render free tier from sleeping
      const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
      setInterval(() => {
        fetch(`${SELF_URL}/`)
          .then(() => console.log('Keep-alive ping sent'))
          .catch(() => {});
      }, 14 * 60 * 1000);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
