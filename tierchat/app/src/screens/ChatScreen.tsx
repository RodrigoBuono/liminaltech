// ============================================================
// PANTALLA DE CHAT PRIVADO
// ============================================================
// Chat 1 a 1 entre dos usuarios del mismo tier.
// Mensajes en tiempo real con Socket.io.
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import { getMessages } from '../services/chat';
import { Message } from '../utils/types';
import ChatBubble from '../components/ChatBubble';

export default function ChatScreen({ route }: any) {
  const { userId, userName } = route.params;
  const { user } = useAuth();
  const { sendMessage, onNewMessage, startTyping, stopTyping, typingUsers } = useChat();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar mensajes al abrir el chat
  useEffect(() => {
    loadMessages();
  }, [userId]);

  // Escuchar nuevos mensajes en tiempo real
  useEffect(() => {
    const unsubscribe = onNewMessage((data) => {
      if (data.message.sender.id === userId) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.message.id,
            sender: data.message.sender,
            content: data.message.content,
            messageType: 'text',
            read: true,
            createdAt: data.message.createdAt,
          },
        ]);
      }
    });
    return unsubscribe;
  }, [userId, onNewMessage]);

  async function loadMessages() {
    try {
      const msgs = await getMessages(userId);
      setMessages(msgs);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  }

  function handleSend() {
    if (!inputText.trim()) return;

    const content = inputText.trim();
    setInputText('');

    // Enviar via socket para tiempo real
    sendMessage(userId, content);

    // Agregar el mensaje a la lista localmente
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: {
        id: user!.id,
        displayName: user!.displayName,
        avatarUrl: user!.avatarUrl,
      },
      content,
      messageType: 'text',
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Dejar de mostrar "escribiendo..."
    stopTyping(userId);
  }

  function handleTextChange(text: string) {
    setInputText(text);

    // Manejar indicador de "escribiendo..."
    startTyping(userId);

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Dejar de "escribir" después de 2 segundos sin tipear
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(userId);
    }, 2000);
  }

  const isTyping = typingUsers.has(userId);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble message={item} isOwn={item.sender.id === user?.id} />
        )}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Indicador de "escribiendo..." */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{userName} está escribiendo...</Text>
        </View>
      )}

      {/* Input de mensaje */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribí un mensaje..."
          placeholderTextColor={COLORS.textSecondary}
          value={inputText}
          onChangeText={handleTextChange}
          multiline
          maxLength={5000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  typingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  typingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
