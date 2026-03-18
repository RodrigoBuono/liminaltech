// ============================================================
// HOOK DE CHAT EN TIEMPO REAL
// ============================================================
// Maneja la conexión con Socket.io para mensajes instantáneos.
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOCKET_URL } from '../utils/constants';

interface ChatMessage {
  id: string;
  sender: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  content: string;
  createdAt: string;
}

export function useChat() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  // Conectar al socket
  useEffect(() => {
    connectSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  async function connectSocket() {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🟢 Conectado al chat');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔴 Desconectado del chat');
    });

    // Manejar "está escribiendo..."
    socket.on('typing:show', (data: { userId: string; displayName: string }) => {
      setTypingUsers((prev) => new Map(prev).set(data.userId, data.displayName));
    });

    socket.on('typing:hide', (data: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    });

    socketRef.current = socket;
  }

  // Enviar mensaje privado
  const sendMessage = useCallback((recipientId: string, content: string) => {
    socketRef.current?.emit('message:send', { recipientId, content });
  }, []);

  // Enviar mensaje a grupo
  const sendGroupMessage = useCallback((groupId: string, content: string) => {
    socketRef.current?.emit('group:message', { groupId, content });
  }, []);

  // Unirse a sala de grupo
  const joinGroupRoom = useCallback((groupId: string) => {
    socketRef.current?.emit('group:join', { groupId });
  }, []);

  // Indicar que estoy escribiendo
  const startTyping = useCallback((recipientId?: string, groupId?: string) => {
    socketRef.current?.emit('typing:start', { recipientId, groupId });
  }, []);

  const stopTyping = useCallback((recipientId?: string, groupId?: string) => {
    socketRef.current?.emit('typing:stop', { recipientId, groupId });
  }, []);

  // Escuchar nuevos mensajes
  const onNewMessage = useCallback((callback: (data: { message: ChatMessage }) => void) => {
    socketRef.current?.on('message:new', callback);
    return () => {
      socketRef.current?.off('message:new', callback);
    };
  }, []);

  // Escuchar mensajes de grupo
  const onGroupMessage = useCallback(
    (callback: (data: { groupId: string; message: ChatMessage }) => void) => {
      socketRef.current?.on('group:newMessage', callback);
      return () => {
        socketRef.current?.off('group:newMessage', callback);
      };
    },
    []
  );

  return {
    isConnected,
    typingUsers,
    sendMessage,
    sendGroupMessage,
    joinGroupRoom,
    startTyping,
    stopTyping,
    onNewMessage,
    onGroupMessage,
  };
}
