// ============================================================
// COMPONENTE: ITEM DE MIEMBRO
// ============================================================
// Muestra un miembro en la lista con su nombre, estado online,
// y la última vez que se conectó.
// ============================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import { TierMember } from '../utils/types';

interface MemberItemProps {
  member: TierMember;
  onPress: () => void;
}

export default function MemberItem({ member, onPress }: MemberItemProps) {
  const lastSeen = member.lastSeen
    ? new Date(member.lastSeen).toLocaleDateString()
    : 'Nunca';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {member.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        {/* Indicador online/offline */}
        <View
          style={[
            styles.onlineIndicator,
            { backgroundColor: member.isOnline ? COLORS.online : COLORS.offline },
          ]}
        />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{member.displayName}</Text>
        <Text style={styles.status}>
          {member.isOnline ? 'En línea' : `Última vez: ${lastSeen}`}
        </Text>
      </View>

      {/* Botón chat */}
      <Text style={styles.chatIcon}>💬</Text>
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
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.surface,
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
  status: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chatIcon: {
    fontSize: 22,
  },
});
