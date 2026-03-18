// ============================================================
// COMPONENTE: BURBUJA DE CHAT
// ============================================================
// Muestra un mensaje individual en el chat.
// Se alinea a la derecha si es propio, a la izquierda si no.
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import { Message } from '../utils/types';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showSenderName?: boolean;
}

export default function ChatBubble({ message, isOwn, showSenderName = false }: ChatBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      {showSenderName && !isOwn && (
        <Text style={styles.senderName}>{message.sender.displayName}</Text>
      )}
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={styles.messageText}>{message.content}</Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    maxWidth: '80%',
  },
  ownContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ownBubble: {
    backgroundColor: COLORS.messageSent,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: COLORS.messageReceived,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  senderName: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 4,
  },
  messageText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 20,
  },
  timeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
});
