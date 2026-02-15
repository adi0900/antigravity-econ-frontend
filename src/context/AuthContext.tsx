import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, authApi, getStoredUser, isAuthenticated, clearAuth } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
        
        // Verify token with backend
        const response = await authApi.getMe();
        if (response.success && response.data) {
          setUser(response.data.user);
          localStorage.setItem('antigravity_user', JSON.stringify(response.data.user));
        } else {
          // Token invalid, clear auth
          clearAuth();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const response = await authApi.login(email);
    
    if (response.success && response.data) {
      setUser(response.data.user);
      return { success: true };
    }
    
    return { success: false, error: response.error };
  };

  const register = async (name: string, email: string): Promise<{ success: boolean; error?: string }> => {
    const response = await authApi.register(name, email);
    
    if (response.success && response.data) {
      setUser(response.data.user);
      return { success: true };
    }
    
    return { success: false, error: response.error };
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const response = await authApi.getMe();
    if (response.success && response.data) {
      setUser(response.data.user);
      localStorage.setItem('antigravity_user', JSON.stringify(response.data.user));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
