import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Técnico';
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  phone: string;
  email: string;
  password: string;
}

// Mock users for demo
const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'admin@telconova.co',
    password: 'Admin123!',
    name: 'Juan Andrés Medina',
    role: 'Admin',
    phone: '+57 300 123 4567'
  },
  {
    id: '2',
    email: 'tecnico@telconova.co',
    password: 'Tec12345!',
    name: 'Karolina Higuieta Marulanda',
    role: 'Técnico',
    phone: '+57 301 987 6543'
  }
];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('telconova_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('telconova_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const API_URL = import.meta.env.VITE_API_URL;
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();

      if (res.ok && data.accessToken) {
        localStorage.setItem('telconova_token', data.accessToken);

        const user: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        };
        setUser(user);
        localStorage.setItem('telconova_user', JSON.stringify(user));

        return { success: true };

      } else {
        return { success: false, message: data.message || 'Credenciales inválidas' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  };



  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === data.email);
    if (existingUser) {
      return { success: false, message: 'El usuario ya existe' };
    }

    // Save new user to localStorage for demo
    const users = JSON.parse(localStorage.getItem('telconova_registered_users') || '[]');
    const newUser = {
      id: Date.now().toString(),
      ...data,
      role: 'Técnico' as const
    };
    users.push(newUser);
    localStorage.setItem('telconova_registered_users', JSON.stringify(users));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('telconova_user');
  };

  const verifyCode = (code: string): boolean => {
    // Mock verification - accepts "123456"
    return code === '123456';
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    verifyCode,
    isAuthenticated: !!user
  };
}