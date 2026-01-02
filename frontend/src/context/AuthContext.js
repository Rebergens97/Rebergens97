import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${API_URL}/api`;

console.log('[AuthContext] API URL:', API);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('drepanhope_token');
    console.log('[AuthContext] Initial token from localStorage:', stored ? 'exists' : 'null');
    return stored;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] Token changed:', token ? 'exists' : 'null');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('[AuthContext] Set Authorization header');
      fetchUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    const meUrl = `${API}/auth/me`;
    console.log('[AuthContext] Fetching user from:', meUrl);
    try {
      const response = await axios.get(meUrl);
      console.log('[AuthContext] User fetched:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('[AuthContext] Failed to fetch user:', error.response?.status, error.message);
      // Only logout on 401 (unauthorized), not on network errors
      if (error.response?.status === 401) {
        logout();
      } else {
        // Keep token but clear user on other errors
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const loginUrl = `${API}/auth/login`;
    console.log('[AuthContext] Login request to:', loginUrl);
    
    const response = await axios.post(loginUrl, { email, password });
    console.log('[AuthContext] Login response:', response.data);
    
    const { token: newToken, user: userData } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('drepanhope_token', newToken);
    console.log('[AuthContext] Token stored in localStorage');
    
    // Set Authorization header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    console.log('[AuthContext] Authorization header set');
    
    setToken(newToken);
    setUser(userData);
    
    return userData;
  };

  const logout = () => {
    console.log('[AuthContext] Logging out');
    localStorage.removeItem('drepanhope_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    const changeUrl = `${API}/auth/change-password`;
    console.log('[AuthContext] Change password request to:', changeUrl);
    
    await axios.post(changeUrl, {
      current_password: currentPassword,
      new_password: newPassword
    });
    
    console.log('[AuthContext] Password changed successfully');
    setUser(prev => ({ ...prev, force_password_change: false }));
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    changePassword,
    hasRole,
    isAuthenticated: !!user,
    apiUrl: API // Expose for debugging
  };

  console.log('[AuthContext] Current state:', { 
    isAuthenticated: !!user, 
    loading, 
    userEmail: user?.email,
    forcePasswordChange: user?.force_password_change 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
