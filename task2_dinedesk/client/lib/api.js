const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// thin wrapper around fetch - throws an Error with the server's message on failure
export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    // empty body, ignore
  }

  if (!res.ok) {
    throw new Error((data && data.message) || 'Something went wrong');
  }
  return data;
}
