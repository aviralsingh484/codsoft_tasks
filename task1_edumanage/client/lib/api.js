const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// small helper to call the backend with the saved login token
export async function api(path, method = 'GET', body) {
  const res = await fetch(API + '/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (res.status === 401 && path !== '/login') {
    localStorage.clear();
    window.location = '/';
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { timeZone: 'UTC' });
