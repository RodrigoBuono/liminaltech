// ============================================================
// COMPONENTE: ITEM DE GRUPO
// ============================================================
// Muestra un grupo en la lista con nombre, miembros y último mensaje.
// ============================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { Group } from '../utils/types';

interface GroupItemProps {
  group: Group;
  onPress: () => void;
  onJoin?: () => void;
}

export default function GroupItem({ group, onPress, onJoin }: GroupItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={group.isMember ? onPress : undefined}>
      {/* Avatar del grupo */}
      <View style={styles.avatar}>
        <Ionicons name="people" size={24} color={COLORS.primary} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{group.name}</Text>
        <Text style={styles.details}>
          {group.memberCount} {group.memberCount === 1 ? 'miembro' : 'miembros'}
        </Text>
        {group.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {group.lastMessage.content}
          </Text>
        )}
      </View>

      {/* Acción */}
      {group.isMember ? (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      ) : (
        <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
          <Text style={styles.joinText}>Unirme</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  details: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  lastMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
