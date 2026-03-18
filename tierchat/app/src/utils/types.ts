// ============================================================
// TIPOS DE TYPESCRIPT
// ============================================================
// Definimos las "formas" de los datos que usa la app.
// TypeScript nos avisa si usamos los datos mal.
// ============================================================

import { TierId } from './constants';

// Un usuario de la app
export interface User {
  id: string;
  email: string;
  displayName: string;
  tier: TierId | null;
  subscriptionActive: boolean;
  subscriptionExpiresAt: string | null;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

// Un mensaje (privado o de grupo)
export interface Message {
  id: string;
  sender: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  content: string;
  messageType: 'text' | 'image' | 'system';
  read: boolean;
  createdAt: string;
}

// Una conversación (vista previa)
export interface Conversation {
  user: {
    _id: string;
    displayName: string;
    avatarUrl: string | null;
    isOnline: boolean;
    lastSeen: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

// Un grupo
export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdBy: string;
  lastMessage: {
    content: string;
    sentAt: string;
  } | null;
  isMember: boolean;
  avatarUrl: string | null;
}

// Un miembro de tu tier
export interface TierMember {
  _id: string;
  displayName: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeen: string;
}

// Respuesta de la API de autenticación
export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

// Tipos de navegación (para las pantallas)
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  TierSelection: undefined;
  MainTabs: undefined;
  Chat: { userId: string; userName: string };
  GroupChat: { groupId: string; groupName: string };
  CreateGroup: undefined;
  Profile: undefined;
};
