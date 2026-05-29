import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { apiFetch } from '../utils/api';
import Ordertable from './Ordertable';
import './admin.css';

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    apiFetch('/order')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.order_items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = (order, status) => {
    apiFetch(`/update_status/${order.orderid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then((res) => {
      if (res.ok) {
        fetchOrders();
      } else {
        alert('Could not update order status.');
      }
    });
  };

  const handleMarkPayment = (order, paymentMethod) => {
    apiFetch('/admin/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderid: order.orderid,
        payment_method: paymentMethod,
      }),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        fetchOrders();
      } else {
        alert(data.error || 'Could not record payment.');
      }
    });
  };

  const handleCancel = (order) => {
    if (!window.confirm(`Cancel order #${order.orderid}?`)) {
      return;
    }
    apiFetch('/order_cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionid: order.sessionid, orderid: order.orderid }),
    }).then((res) => {
      if (res.ok) {
        fetchOrders();
      }
    });
  };

  const handleRemove = (order) => {
    if (!window.confirm(`Delete order #${order.orderid}?`)) {
      return;
    }
    fetch('/order_delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ orderid: order.orderid }]),
    }).then((res) => {
      if (res.ok) {
        fetchOrders();
      }
    });
  };

  return (
    <AdminLayout title="Restaurant Admin">
      <h1 className="admin-page-title">Live Orders</h1>
      <p className="admin-page-subtitle">
        Track preparation status and mark payments as Online or Cash when collected.
      </p>
      {loading ? <p>Loading orders...</p> : null}
      <Ordertable
        data={orders}
        onStatusUpdate={handleStatusUpdate}
        onMarkPayment={handleMarkPayment}
        onCancel={handleCancel}
        onRemove={handleRemove}
      />
    </AdminLayout>
  );
}
