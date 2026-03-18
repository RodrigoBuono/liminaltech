// ============================================================
// CONTEXTO DE AUTENTICACIÓN
// ============================================================
// Maneja el estado de login en toda la app.
// Cualquier pantalla puede saber si hay un usuario logueado.
// ============================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../utils/types';
import * as authService from '../services/auth';

// Definir qué datos y funciones provee el contexto
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// PROVIDER - Envuelve toda la app
// ============================================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al abrir la app, verificar si ya hay un usuario logueado
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const storedUser = await authService.getStoredUser();
      const token = await authService.getToken();

      if (storedUser && token) {
        // Intentar refrescar los datos del usuario
        try {
          const freshUser = await authService.getProfile();
          setUser(freshUser);
        } catch {
          // Si falla (ej: sin internet), usar los datos guardados
          setUser(storedUser);
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await authService.login(email, password);
    setUser(response.user);
  }

  async function register(email: string, password: string, displayName: string) {
    const response = await authService.register(email, password, displayName);
    setUser(response.user);
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  async function refreshUser() {
    const freshUser = await authService.getProfile();
    setUser(freshUser);
  }

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

// ============================================================
// HOOK - Para usar el contexto fácilmente
// ============================================================
// En cualquier pantalla: const { user, login, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
