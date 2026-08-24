import { createContext, useContext, useState } from 'react';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('genstudio_user');
    return raw ? JSON.parse(raw) : null;
  });

  function persist(user, token) {
    localStorage.setItem('genstudio_token', token);
    localStorage.setItem('genstudio_user', JSON.stringify(user));
    setUser(user);
  }

  async function login(email, password) {
    const { user, token } = await authApi.login(email, password);
    persist(user, token);
  }

  async function register(name, email, password) {
    const { user, token } = await authApi.register(name, email, password);
    persist(user, token);
  }

  function logout() {
    localStorage.removeItem('genstudio_token');
    localStorage.removeItem('genstudio_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
