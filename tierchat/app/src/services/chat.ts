// ============================================================
// SERVICIO DE CHAT
// ============================================================
// Funciones para enviar/recibir mensajes y manejar grupos.
// ============================================================

import api from './api';
import { Message, Conversation, TierMember, Group } from '../utils/types';

// Obtener miembros de mi tier
export async function getMembers(): Promise<{
  tier: string;
  totalMembers: number;
  members: TierMember[];
}> {
  const response = await api.get('/chat/members');
  return response.data;
}

// Obtener conversaciones (lista de chats)
export async function getConversations(): Promise<Conversation[]> {
  const response = await api.get('/chat/conversations');
  return response.data.conversations;
}

// Obtener mensajes con un usuario específico
export async function getMessages(userId: string): Promise<Message[]> {
  const response = await api.get(`/chat/messages/${userId}`);
  return response.data.messages;
}

// Enviar mensaje privado
export async function sendMessage(recipientId: string, content: string): Promise<Message> {
  const response = await api.post('/chat/send', { recipientId, content });
  return response.data.data;
}

// Obtener grupos de mi tier
export async function getGroups(): Promise<Group[]> {
  const response = await api.get('/groups');
  return response.data.groups;
}

// Crear grupo nuevo
export async function createGroup(name: string, description: string): Promise<Group> {
  const response = await api.post('/groups', { name, description });
  return response.data.group;
}

// Unirse a un grupo
export async function joinGroup(groupId: string): Promise<void> {
  await api.post(`/groups/${groupId}/join`);
}

// Salir de un grupo
export async function leaveGroup(groupId: string): Promise<void> {
  await api.post(`/groups/${groupId}/leave`);
}

// Obtener mensajes de un grupo
export async function getGroupMessages(groupId: string): Promise<Message[]> {
  const response = await api.get(`/groups/${groupId}/messages`);
  return response.data.messages;
}

// Enviar mensaje a un grupo
export async function sendGroupMessage(groupId: string, content: string): Promise<Message> {
  const response = await api.post(`/groups/${groupId}/send`, { content });
  return response.data.data;
}
