import React from 'react';
import AdminLayout from './AdminLayout';
import Food from './Food';
import './admin.css';

export default function Menumanagement() {
  return (
    <AdminLayout title="Restaurant Admin">
      <h1 className="admin-page-title">Menu Items</h1>
      <p className="admin-page-subtitle">View and manage your restaurant menu.</p>
      <Food />
    </AdminLayout>
  );
}
