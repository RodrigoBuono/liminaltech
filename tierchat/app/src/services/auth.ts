// ============================================================
// SERVICIO DE AUTENTICACIÓN
// ============================================================
// Funciones para registro, login, y manejo de sesión.
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { AuthResponse, User } from '../utils/types';

// Registrar una cuenta nueva
export async function register(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResponse> {
  const response = await api.post('/auth/register', {
    email,
    password,
    displayName,
  });

  // Guardar token y datos del usuario
  await AsyncStorage.setItem('token', response.data.token);
  await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
}

// Iniciar sesión
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post('/auth/login', { email, password });

  await AsyncStorage.setItem('token', response.data.token);
  await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
}

// Cerrar sesión
export async function logout(): Promise<void> {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
}

// Obtener el usuario guardado localmente
export async function getStoredUser(): Promise<User | null> {
  const userJson = await AsyncStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

// Obtener el token guardado
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('token');
}

// Obtener perfil actualizado del servidor
export async function getProfile(): Promise<User> {
  const response = await api.get('/auth/me');
  await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
  return response.data.user;
}
