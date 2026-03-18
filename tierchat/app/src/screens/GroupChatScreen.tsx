// ============================================================
// PANTALLA DE CHAT DE GRUPO
// ============================================================
// Chat grupal dentro de un tier.
// Similar al chat privado pero con múltiples participantes.
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
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
import { getGroupMessages } from '../services/chat';
import { Message } from '../utils/types';
import ChatBubble from '../components/ChatBubble';

export default function GroupChatScreen({ route }: any) {
  const { groupId, groupName } = route.params;
  const { user } = useAuth();
  const { sendGroupMessage, joinGroupRoom, onGroupMessage, typingUsers } = useChat();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Unirse a la sala del grupo
    joinGroupRoom(groupId);
    // Cargar mensajes
    loadMessages();
  }, [groupId]);

  // Escuchar nuevos mensajes del grupo
  useEffect(() => {
    const unsubscribe = onGroupMessage((data) => {
      if (data.groupId === groupId) {
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
  }, [groupId, onGroupMessage]);

  async function loadMessages() {
    try {
      const msgs = await getGroupMessages(groupId);
      setMessages(msgs);
    } catch (error) {
      console.error('Error cargando mensajes del grupo:', error);
    }
  }

  function handleSend() {
    if (!inputText.trim()) return;

    const content = inputText.trim();
    setInputText('');

    sendGroupMessage(groupId, content);

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
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={item}
            isOwn={item.sender.id === user?.id}
            showSenderName={item.sender.id !== user?.id}
          />
        )}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`Mensaje en ${groupName}...`}
          placeholderTextColor={COLORS.textSecondary}
          value={inputText}
          onChangeText={setInputText}
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
