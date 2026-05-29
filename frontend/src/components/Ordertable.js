import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import {
  formatOrderDate,
  parseFoodItems,
  paymentMethodLabel,
  paymentStatusLabel,
} from '../utils/orderUtils';
import './admin.css';

const useStyles = makeStyles({
  table: { minWidth: 900 },
});

function FoodList({ food }) {
  const items = parseFoodItems(food);
  if (!items.length) {
    return <span>-</span>;
  }
  return (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {items.map((item, i) => {
        const unitPrice =
          item.price !== undefined && item.price !== null
            ? item.price
            : item.amount !== undefined && item.amount !== null
            ? item.amount
            : 0;
        const lineTotal = (item.quantity || 1) * unitPrice;
        return (
          <li key={`${item.name}-${i}`}>
            {item.name} x{item.quantity || 1}: Rs.{lineTotal}
          </li>
        );
      })}
    </ul>
  );
}

function PaymentCell({ order }) {
  const isPaid = order.payment_status === 'paid';
  return (
    <div>
      <span className={`payment-badge ${isPaid ? 'paid' : 'unpaid'}`}>
        {paymentStatusLabel(order.payment_status)}
      </span>
      {order.payment_method ? (
        <div style={{ marginTop: 6 }}>
          <span className={`payment-badge ${order.payment_method}`}>
            {paymentMethodLabel(order.payment_method)}
            {!isPaid && order.payment_method === 'cash' ? ' (at counter)' : ''}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function StatusActions({ order, onStatusUpdate, onMarkPayment, onCancel, onRemove }) {
  const status = order.status || '';

  return (
    <div className="admin-actions">
      {status === 'Food is being prepared' ? (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => onStatusUpdate(order, 'Food is ready')}
        >
          Mark Ready
        </Button>
      ) : null}

      {status === 'Food is ready' ? (
        <Button
          variant="contained"
          style={{ backgroundColor: '#2e7d32', color: 'white' }}
          size="small"
          onClick={() => onStatusUpdate(order, 'Order completed')}
        >
          Complete Order
        </Button>
      ) : null}

      {status === 'Order completed' ? (
        <span className="status-badge">Completed</span>
      ) : null}

      {order.payment_status !== 'paid' ? (
        <React.Fragment>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => onMarkPayment(order, 'online')}
          >
            Mark Online Paid
          </Button>
          <Button
            variant="outlined"
            style={{ borderColor: '#6a1b9a', color: '#6a1b9a' }}
            size="small"
            onClick={() => onMarkPayment(order, 'cash')}
          >
            Mark Cash Paid
          </Button>
        </React.Fragment>
      ) : null}

      <Button variant="contained" style={{ backgroundColor: '#f9a825' }} size="small" onClick={() => onCancel(order)}>
        Cancel
      </Button>
      <Button variant="contained" color="secondary" size="small" onClick={() => onRemove(order)}>
        Delete
      </Button>
    </div>
  );
}

export default function Ordertable(props) {
  const classes = useStyles();
  const { data, onStatusUpdate, onMarkPayment, onCancel, onRemove } = props;

  if (!data.length) {
    return (
      <div className="admin-empty-state">
        <div className="admin-empty-state-icon">🚽</div>
        <p>No orders yet — new orders will appear here automatically.</p>
      </div>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Food</TableCell>
            <TableCell>Table</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((order) => (
            <TableRow key={order.orderid}>
              <TableCell>{order.orderid}</TableCell>
              <TableCell>{order.customer_name || '-'}</TableCell>
              <TableCell>
                <span className="status-badge">{order.status}</span>
              </TableCell>
              <TableCell>
                <FoodList food={order.food} />
              </TableCell>
              <TableCell>{order.tableno != null ? order.tableno : '-'}</TableCell>
              <TableCell>Rs.{order.amount}</TableCell>
              <TableCell>
                <PaymentCell order={order} />
              </TableCell>
              <TableCell>{formatOrderDate(order.datetime)}</TableCell>
              <TableCell>
                <StatusActions
                  order={order}
                  onStatusUpdate={onStatusUpdate}
                  onMarkPayment={onMarkPayment}
                  onCancel={onCancel}
                  onRemove={onRemove}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
