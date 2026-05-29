import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { apiFetch } from '../utils/api';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { useHistory } from 'react-router-dom';
import './admin.css';

export default function Additem() {
  const history = useHistory();
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !description.trim() || !amount) {
      setError('Name, description, and price are required.');
      return;
    }

    const payload = {
      id: id ? Number(id) : 0,
      name: name.trim(),
      description: description.trim(),
      amount: Number(amount),
    };

    setIsSubmitting(true);
    apiFetch('/menu_create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (res.ok) {
          history.push('/menu');
          return;
        }
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Could not add item.');
        setIsSubmitting(false);
      })
      .catch(() => {
        setError('Network error. Is the backend running?');
        setIsSubmitting(false);
      });
  };

  return (
    <AdminLayout title="Restaurant Admin">
      <h1 className="admin-page-title">Add Menu Item</h1>
      <Paper style={{ padding: 24, maxWidth: 520 }}>
        <form onSubmit={onSubmit}>
          <TextField
            label="Item ID (optional — leave blank for auto)"
            value={id}
            onChange={(e) => setId(e.target.value.replace(/\D/g, ''))}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Price (Rs.)"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
            variant="outlined"
            fullWidth
            margin="normal"
            required
          />
          {error ? <p style={{ color: '#c62828' }}>{error}</p> : null}
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={isSubmitting}
            style={{ marginTop: 16 }}
          >
            {isSubmitting ? 'Saving...' : 'Add Item'}
          </Button>
        </form>
      </Paper>
    </AdminLayout>
  );
}
