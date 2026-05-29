export function parseFoodItems(food) {
  if (!food) {
    return [];
  }
  if (Array.isArray(food)) {
    return food;
  }
  if (typeof food === 'string') {
    try {
      const parsed = JSON.parse(food);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function formatOrderDate(value) {
  if (!value) {
    return '-';
  }
  try {
    return new Date(value).toLocaleString();
  } catch (e) {
    return String(value);
  }
}

export function paymentMethodLabel(method) {
  if (method === 'online') {
    return 'Online';
  }
  if (method === 'cash') {
    return 'Cash';
  }
  return '-';
}

export function paymentStatusLabel(status) {
  if (status === 'paid') {
    return 'Paid';
  }
  return 'Unpaid';
}
