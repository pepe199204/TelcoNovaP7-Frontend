import { useState, useEffect } from 'react';

export interface User {
  id: number;       
  nombre: string;
  email: string;
  rol: string;      // puede ser "OPERARIO", "ADMIN", etc.
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  numero_iden: string
  password: string;
}

// Mock users for demo
// const MOCK_USERS: Array<User & { password: string }> = [
//   {
//     id: '1',
//     email: 'admin@telconova.co',
//     password: 'Admin123!',
//     name: 'Juan Andrés Medina',
//     role: 'Admin',
//     phone: '+57 300 123 4567'
//   },
//   {
//     id: '2',
//     email: 'tecnico@telconova.co',
//     password: 'Tec12345!',
//     name: 'Karolina Higuieta Marulanda',
//     role: 'Técnico',
//     phone: '+57 301 987 6543'
//   }
// ];

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

      const data: { user: User; accessToken: string } = await res.json();
      console.log(data)

      if (res.ok && data.accessToken) {
        localStorage.setItem('telconova_token', data.accessToken);
        setUser(data.user);   // se usa tal cual
        localStorage.setItem('telconova_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, message: 'Credenciales inválidas' };
      }
    } catch {
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  };



const register = async (data: RegisterData) => {
  const API_URL = import.meta.env.VITE_API_URL;
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const user: User = await res.json();
    setUser(user);
    localStorage.setItem('telconova_user', JSON.stringify(user));
    return { success: true };
  } catch {
    return { success: false, message: 'Error de conexión con el servidor' };
  }
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