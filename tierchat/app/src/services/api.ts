// ============================================================
// SERVICIO DE API
// ============================================================
// Maneja todas las llamadas HTTP al backend.
// Usa axios para hacer las peticiones.
// ============================================================

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/constants';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// INTERCEPTOR: agregar token a cada petición
// ============================================================
// Antes de cada petición, agrega el token de autenticación
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// INTERCEPTOR: manejar errores de respuesta
// ============================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si el token expiró, cerrar sesión
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
