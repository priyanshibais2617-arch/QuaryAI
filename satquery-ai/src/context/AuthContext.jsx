import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { setAuthToken } from '../services/apiClient';

const AuthContext = createContext();

const isRealBackendEnabled = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_USE_REAL_BACKEND === 'true';
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_USE_REAL_BACKEND === 'true';
  }
  return false;
};

const DEFAULT_MOCK_USER = {
  id: 'usr-9021',
  name: 'Abhi',
  fullName: 'Abhimanyu Patel',
  email: 'abhi@remote-sensing.org',
  role: 'Lead Remote Sensing Analyst',
  organization: 'Earth Observation Research Lab',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const formatSupabaseUser = (sbUser, session) => {
  if (!sbUser) return null;
  const meta = sbUser.user_metadata || {};
  const fullName = meta.full_name || meta.name || sbUser.email?.split('@')[0] || 'Remote Sensing Analyst';
  const name = fullName.split(' ')[0];

  return {
    id: sbUser.id,
    supabaseUserId: sbUser.id,
    name,
    fullName,
    email: sbUser.email,
    role: meta.role || 'Lead Remote Sensing Analyst',
    organization: meta.organization || 'Earth Observation Research Lab',
    avatar: meta.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    token: session?.access_token || null,
  };
};

export function AuthProvider({ children }) {
  const realBackend = isRealBackendEnabled() && isSupabaseConfigured;

  // State
  const [user, setUser] = useState(() => {
    if (realBackend) {
      const saved = localStorage.getItem('satquery-user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {
          return null;
        }
      }
      return null;
    }

    // Default mock mode: only restore if user previously logged in
    const saved = localStorage.getItem('satquery-user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!user);
  const [loading, setLoading] = useState(() => realBackend);

  // Supabase session listener (only active when real backend and supabase are configured)
  useEffect(() => {
    if (!realBackend || !supabase) {
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const mapped = formatSupabaseUser(session.user, session);
        setUser(mapped);
        setIsAuthenticated(true);
        setAuthToken(session.access_token);
        localStorage.setItem('satquery-user', JSON.stringify(mapped));
      } else {
        setAuthToken(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const mapped = formatSupabaseUser(session.user, session);
        setUser(mapped);
        setIsAuthenticated(true);
        setAuthToken(session.access_token);
        localStorage.setItem('satquery-user', JSON.stringify(mapped));
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null);
        localStorage.removeItem('satquery-user');
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [realBackend]);

  // Sync mock state to local storage when in mock mode
  useEffect(() => {
    if (realBackend) return;
    if (user) {
      localStorage.setItem('satquery-user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('satquery-user');
      setIsAuthenticated(false);
    }
  }, [user, realBackend]);

  const login = async (email, password) => {
    if (realBackend && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const mapped = formatSupabaseUser(data.user, data.session);
      setUser(mapped);
      setAuthToken(data.session?.access_token || null);
      return mapped;
    }

    // Mock validation
    const namePart = email.split('@')[0];
    const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const loggedInUser = {
      ...DEFAULT_MOCK_USER,
      name: capitalized || 'Abhi',
      fullName: capitalized ? `${capitalized} Analyst` : 'Abhimanyu Patel',
      email: email || 'abhi@remote-sensing.org',
    };
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async ({ fullName, email, password }) => {
    if (realBackend && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'Lead Remote Sensing Analyst',
          },
        },
      });
      if (error) throw error;
      const mapped = formatSupabaseUser(data.user, data.session);
      if (mapped) {
        setUser(mapped);
        setAuthToken(data.session?.access_token || null);
      }
      return mapped || data.user;
    }

    const namePart = fullName ? fullName.split(' ')[0] : 'Analyst';
    const newUser = {
      ...DEFAULT_MOCK_USER,
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: namePart,
      fullName: fullName || 'New Analyst',
      email: email || 'analyst@satquery.ai',
    };
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    if (realBackend && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('satquery-user');
  };

  const updateUser = async (updates) => {
    if (realBackend && supabase) {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });
      if (!error && data?.user) {
        setUser(prev => ({ ...prev, ...updates }));
      }
      return;
    }
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
