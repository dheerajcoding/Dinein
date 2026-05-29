const BASE_URL = process.env.REACT_APP_API_URL || '';

export function apiFetch(path, options) {
  return fetch(`${BASE_URL}${path}`, options);
}
