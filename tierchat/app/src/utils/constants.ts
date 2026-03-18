// ============================================================
// CONSTANTES DE LA APP
// ============================================================
// Acá definimos todos los valores que se usan en toda la app:
// colores, URLs, configuración de tiers, etc.
// ============================================================

// URL del backend (cambiá esto cuando hagas deploy)
export const API_URL = 'http://localhost:3000/api';
export const SOCKET_URL = 'http://localhost:3000';

// Colores de la app
export const COLORS = {
  // Fondo principal (oscuro)
  background: '#0f0f23',
  // Fondo de tarjetas y elementos
  surface: '#1a1a2e',
  // Color principal (rojo/rosa)
  primary: '#e94560',
  // Color secundario (azul)
  secondary: '#16213e',
  // Texto principal (blanco)
  text: '#ffffff',
  // Texto secundario (gris)
  textSecondary: '#a0a0b8',
  // Bordes
  border: '#2a2a4a',
  // Verde para "online"
  online: '#4ade80',
  // Gris para "offline"
  offline: '#6b7280',
  // Fondo de mensajes enviados
  messageSent: '#e94560',
  // Fondo de mensajes recibidos
  messageReceived: '#1a1a2e',
  // Error
  error: '#ef4444',
  // Éxito
  success: '#22c55e',
};

// Configuración de los tiers
export const TIERS = {
  bronce: {
    id: 'bronce',
    name: 'Bronce',
    price: 1,
    emoji: '🥉',
    color: '#cd7f32',
    description: 'Acceso básico al chat por $1/mes',
  },
  plata: {
    id: 'plata',
    name: 'Plata',
    price: 10,
    emoji: '🥈',
    color: '#c0c0c0',
    description: 'Chat con miembros Plata por $10/mes',
  },
  oro: {
    id: 'oro',
    name: 'Oro',
    price: 100,
    emoji: '🥇',
    color: '#ffd700',
    description: 'Chat exclusivo Oro por $100/mes',
  },
  diamante: {
    id: 'diamante',
    name: 'Diamante',
    price: 1000,
    emoji: '💎',
    color: '#00bfff',
    description: 'Círculo Diamante por $1,000/mes',
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    price: 10000,
    emoji: '👑',
    color: '#ff6b35',
    description: 'El círculo más exclusivo por $10,000/mes',
  },
} as const;

export type TierId = keyof typeof TIERS;
