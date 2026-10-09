import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  // restore session on first load
  useEffect(() => {
    const savedToken = localStorage.getItem('dinedesk_token');
    if (!savedToken) {
      setReady(true);
      return;
    }
    api('/auth/me', { token: savedToken })
      .then((data) => {
        setUser(data.user);
        setToken(savedToken);
      })
      .catch(() => localStorage.removeItem('dinedesk_token'))
      .finally(() => setReady(true));
  }, []);

  function saveSession(data) {
    localStorage.setItem('dinedesk_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function login(email, password) {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    return saveSession(data);
  }

  async function register(form) {
    const data = await api('/auth/register', { method: 'POST', body: form });
    return saveSession(data);
  }

  function logout() {
    localStorage.removeItem('dinedesk_token');
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
