import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../models';
import { authService } from '../services';

const AUTH_STORAGE_KEY = '@market-app:auth-user';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar usuário do localStorage na inicialização
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Converter data de string para Date
            parsedUser.createdAt = new Date(parsedUser.createdAt);
            setUser(parsedUser);
            // Sincronizar com authService
            authService.setCurrentUser(parsedUser);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    loadUser();
  }, []);

  // Salvar usuário no localStorage sempre que mudar
  useEffect(() => {
    if (!isInitialized) return;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar usuário no localStorage:', error);
    }
  }, [user, isInitialized]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const newUser = await authService.register(name, email, password);
      setUser(newUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isCustomer = () => {
    return user?.role === 'CUSTOMER';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isCustomer,
      }}
    >
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
