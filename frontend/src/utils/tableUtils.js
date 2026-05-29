import { apiFetch } from './api';

/**
 * Parse table number from QR text, URL, or manual input.
 */
export function parseTableNumber(scanValue) {
  if (scanValue === null || scanValue === undefined) {
    return '';
  }

  const raw = String(scanValue).trim();
  if (!raw) {
    return '';
  }

  if (/^[0-9]+$/.test(raw)) {
    return raw;
  }

  try {
    const parsedUrl = new URL(raw);
    const tableFromQuery =
      parsedUrl.searchParams.get('table') ||
      parsedUrl.searchParams.get('tableno');
    if (tableFromQuery && /^[0-9]+$/.test(String(tableFromQuery).trim())) {
      return String(tableFromQuery).trim();
    }
  } catch (e) {
    // Not a URL — fall through to pattern matching.
  }

  const labeledMatch = raw.match(/(?:table|tableno)[^0-9]*([0-9]+)/i);
  if (labeledMatch) {
    return labeledMatch[1];
  }

  const numberMatch = raw.match(/([0-9]+)/);
  return numberMatch ? numberMatch[1] : '';
}

export function getTableFromSearch(search) {
  if (!search) {
    return '';
  }
  const params = new URLSearchParams(search);
  const table = params.get('table') || params.get('tableno');
  return table ? parseTableNumber(table) : '';
}

export function getStoredTableNumber() {
  return sessionStorage.getItem('customer_table') || '';
}

export function setStoredTableNumber(tableNumber) {
  if (tableNumber) {
    sessionStorage.setItem('customer_table', String(tableNumber));
  }
}

/**
 * Save table for the current customer session (scan or manual).
 */
export function saveCustomerTable(sessionToken, tableValue) {
  const tableno = parseTableNumber(tableValue);

  if (!tableno) {
    return Promise.reject(new Error('Please enter a valid table number (digits only).'));
  }

  if (!sessionToken || sessionToken === 'undefined' || sessionToken === 'null') {
    return Promise.reject(new Error('Please enter your details first.'));
  }

  return apiFetch('/add_table', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionid: sessionToken,
      tableno,
    }),
  })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Unable to save table number. Please try again.');
      }
      setStoredTableNumber(tableno);
      return tableno;
    });
}
