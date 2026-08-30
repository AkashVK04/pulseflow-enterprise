import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../lib/api.js';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  switchUserRole: (userId: string) => void;
  hasPermission: (requiredRole: UserRole) => boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    api.getAuthMe()
      .then(res => {
        setCurrentUser(res.user);
        if (res.allUsers) setAllUsers(res.allUsers);
      })
      .catch(err => {
        console.warn('Authentication token invalid or expired. Clearing session:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setCurrentUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await api.loginWithJWT(email, password);
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    setCurrentUser(res.user);
    
    // Fetch all workspace users for context/switchers if available
    try {
      const meRes = await api.getAuthMe();
      if (meRes.allUsers) setAllUsers(meRes.allUsers);
    } catch {
      // Ignore secondary user list failure if login succeeded
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
  };

  const switchUserRole = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const roleHierarchy: Record<UserRole, number> = {
    'Super Admin': 5,
    'Workspace Admin': 4,
    'Project Manager': 3,
    'Senior Engineer': 2,
    'Staff Contributor': 1,
    'Guest': 0
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!currentUser) return false;
    return roleHierarchy[currentUser.role] >= roleHierarchy[requiredRole];
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        login,
        logout,
        switchUserRole,
        hasPermission,
        isLoading,
        isAuthenticated: !!currentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
