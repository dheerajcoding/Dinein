import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { apiFetch } from '../utils/api';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { formatOrderDate, paymentMethodLabel } from '../utils/orderUtils';
import './admin.css';

export default function Payments() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = useCallback(() => {
    apiFetch('/order')
      .then((res) => res.json())
      .then((data) => setOrders(data.order_items || []));
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.payment_status === 'paid');
    const onlineTotal = paid
      .filter((o) => o.payment_method === 'online')
      .reduce((sum, o) => sum + Number(o.amount || 0), 0);
    const cashTotal = paid
      .filter((o) => o.payment_method === 'cash')
      .reduce((sum, o) => sum + Number(o.amount || 0), 0);
    const unpaidCount = orders.filter((o) => o.payment_status !== 'paid').length;
    const pendingCashCount = orders.filter(
      (o) => o.payment_status !== 'paid' && o.payment_method === 'cash'
    ).length;

    return { onlineTotal, cashTotal, unpaidCount, paidCount: paid.length, pendingCashCount };
  }, [orders]);

  const paidOrders = orders.filter((o) => o.payment_status === 'paid');

  return (
    <AdminLayout title="Restaurant Admin">
      <h1 className="admin-page-title">Payments</h1>
      <p className="admin-page-subtitle">Summary of collected payments by method.</p>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <h3>Online collected</h3>
          <p>Rs.{stats.onlineTotal}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Cash collected</h3>
          <p>Rs.{stats.cashTotal}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Paid orders</h3>
          <p>{stats.paidCount}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Unpaid orders</h3>
          <p>{stats.unpaidCount}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Cash pending at counter</h3>
          <p>{stats.pendingCashCount}</p>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Table</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paidOrders.length ? (
              paidOrders.map((order) => (
                <TableRow key={order.orderid}>
                  <TableCell>{order.orderid}</TableCell>
                  <TableCell>{order.tableno != null ? order.tableno : '-'}</TableCell>
                  <TableCell>Rs.{order.amount}</TableCell>
                  <TableCell>
                    <span className={`payment-badge ${order.payment_method || ''}`}>
                      {paymentMethodLabel(order.payment_method)}
                    </span>
                  </TableCell>
                  <TableCell>{formatOrderDate(order.datetime)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No paid orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </AdminLayout>
  );
}
