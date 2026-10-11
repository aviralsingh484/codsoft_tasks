import { useEffect, useState } from 'react';

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (err) {
    return null;
  }
}

export function saveLogin(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Returns the logged in user (null on the first render)
export function useUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    setUser(getUser());
  }, []);
  return user;
}
