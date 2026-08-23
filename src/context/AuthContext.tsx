import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../lib/api.js';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  switchUserRole: (userId: string) => void;
  hasPermission: (requiredRole: UserRole) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAuthMe()
      .then(res => {
        setCurrentUser(res.user);
        setAllUsers(res.allUsers);
      })
      .catch(err => {
        console.error('Failed to load user auth context:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

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
        switchUserRole,
        hasPermission,
        isLoading
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
