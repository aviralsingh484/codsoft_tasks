// Small helper for calling the Express server
export const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = 'Bearer ' + token;

  let payload;
  if (form) {
    payload = form; // FormData (used for file uploads)
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const res = await fetch(apiUrl + '/api' + path, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));

  // token expired or missing -> go back to login
  if (res.status === 401 && !path.startsWith('/auth/')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
