import React, { createContext, useState, useEffect } from 'react';

export const AuthenContext = createContext();

export const AuthenProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  const authenticatedFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const currentToken = token || localStorage.getItem('token');
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  };

  return (
    <AuthenContext.Provider value={{ user, token, login, logout, loading, authenticatedFetch }}>
      {children}
    </AuthenContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthenContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthenProvider');
  }
  return context;
};
