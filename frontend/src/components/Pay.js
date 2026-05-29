import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { getCustomerSessionToken } from './auth';
import './customer.css';

const useStyles = makeStyles({
  card: {
    minWidth: 275,
    maxWidth: 700,
    margin: 'auto',
    marginTop: 120,
    borderRadius: '1rem',
    border: '2px solid black',
  },
});

export default function Pay() {
  const classes = useStyles();
  const [order, setOrder] = useState({});
  const [paymentMode, setPaymentMode] = useState('online');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const foodItems = useMemo(() => {
    if (!order || !order.food) return [];
    if (Array.isArray(order.food)) return order.food;
    if (typeof order.food === 'string') {
      try {
        const parsed = JSON.parse(order.food);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }, [order]);

  useEffect(() => {
    const sessid = getCustomerSessionToken();
    fetch('/getpayment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionid: sessid }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.customer_details) {
          setOrder(data.customer_details);
          if (data.customer_details.payment_status === 'paid') {
            window.location.replace('/checkout');
          }
        }
      });
  }, []);

  const submitPayment = () => {
    setFormError('');

    const sessid = getCustomerSessionToken();
    setIsSubmitting(true);

    fetch('/order_payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionid: sessid,
        orderid: order.orderid,
        payment_method: paymentMode,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          if (paymentMode === 'cash') {
            sessionStorage.setItem('cash_payment_pending', '1');
          } else {
            sessionStorage.removeItem('cash_payment_pending');
          }
          window.location.replace('/checkout');
          return;
        }
        setFormError(data.error || 'Payment could not be completed.');
        setIsSubmitting(false);
      })
      .catch(() => {
        setFormError('Network error. Please try again.');
        setIsSubmitting(false);
      });
  };

  const handleCancel = () => {
    const sessid = getCustomerSessionToken();
    fetch('/order_cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionid: sessid, orderid: order.orderid }),
    }).then((res) => {
      if (res.ok) {
        alert('Order cancelled');
        window.location.replace('/place_order');
      }
    });
  };

  return (
    <div className="bg3">
      <Card className={classes.card}>
        <CardContent>
          <button
            style={{
              display: 'block',
              margin: 'auto',
              backgroundColor: 'red',
              color: 'white',
              fontSize: '16px',
              marginBottom: '20px',
              height: '40px',
              width: 200,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
            onClick={handleCancel}
          >
            Cancel Order
          </button>

          <Typography variant="h5" component="h2">
            {order.name}
          </Typography>
          <Typography variant="body2" component="p">
            Order Id: {order.orderid}
            <br />
            Table No: {order.tableno}
            <br />
            <strong>Total: Rs.{order.amount}</strong>
          </Typography>

          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <Typography variant="h6">Ordered Items</Typography>
            {foodItems.length ? (
              foodItems.map((item, index) => (
                <Typography key={`${item.name}-${index}`} variant="body2">
                  {item.name} x {item.quantity || 1} — Rs.
                  {(item.price || item.amount || 0) * (item.quantity || 1)}
                </Typography>
              ))
            ) : (
              <Typography variant="body2">No items found.</Typography>
            )}
          </div>

          <Typography variant="h6" style={{ marginBottom: 12 }}>
            Payment method
          </Typography>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <Button
              variant={paymentMode === 'online' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setPaymentMode('online')}
            >
              Pay Online
            </Button>
            <Button
              variant={paymentMode === 'cash' ? 'contained' : 'outlined'}
              style={
                paymentMode === 'cash'
                  ? { backgroundColor: '#6a1b9a', color: 'white' }
                  : { borderColor: '#6a1b9a', color: '#6a1b9a' }
              }
              onClick={() => setPaymentMode('cash')}
            >
              Pay Cash at Counter
            </Button>
          </div>

          {paymentMode === 'online' ? (
            <div>
              <TextField
                label="Card Holder Name (optional)"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                variant="outlined"
                margin="normal"
                fullWidth
              />
              <TextField
                label="Card Number (optional)"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                variant="outlined"
                margin="normal"
                fullWidth
                inputProps={{ maxLength: 19 }}
              />
            </div>
          ) : (
            <Typography variant="body2" style={{ background: '#f3e5f5', padding: 12, borderRadius: 8 }}>
              You chose cash. Confirm below and pay at the counter. Staff will mark it as collected.
            </Typography>
          )}

          {formError ? <p style={{ color: '#c62828', marginTop: 12 }}>{formError}</p> : null}
        </CardContent>
        <CardActions>
          <button
            style={{
              display: 'block',
              width: '100%',
              backgroundColor: paymentMode === 'online' ? '#2e7d32' : '#6a1b9a',
              color: 'white',
              padding: '15px 32px',
              fontSize: '16px',
              cursor: isSubmitting ? 'wait' : 'pointer',
              marginBottom: '20px',
              border: 'none',
            }}
            onClick={submitPayment}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Processing...'
              : paymentMode === 'online'
              ? 'Pay Online'
              : 'Confirm Cash Payment'}
          </button>
        </CardActions>
      </Card>
    </div>
  );
}
