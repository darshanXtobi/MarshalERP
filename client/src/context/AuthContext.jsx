import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || localStorage.getItem('EPS-TOKEN') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.get('/auth/me');
        setUser({
          ...data.profile,
          userType: data.userType,
        });
      } catch (err) {
        console.error('Session restoration failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const staffLogin = async (username, password) => {
    const res = await api.post('/auth/staff-login', { username, password });
    localStorage.setItem('token', res.token);
    localStorage.setItem('EPS-TOKEN', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const studentLogin = async (prn, password) => {
    const res = await api.post('/auth/student-login', { prn, password });
    localStorage.setItem('token', res.token);
    localStorage.setItem('EPS-TOKEN', res.token);
    localStorage.setItem('eps-learnerid', res.student.id);
    localStorage.setItem('eps-loginid', res.student.prn);
    setToken(res.token);
    setUser({
      ...res.student,
      userType: 'student',
      role: 'student'
    });
    return res.student;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('EPS-TOKEN');
    localStorage.removeItem('eps-learnerid');
    localStorage.removeItem('eps-loginid');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, staffLogin, studentLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
