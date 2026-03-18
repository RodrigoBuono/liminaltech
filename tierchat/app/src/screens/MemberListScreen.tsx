// ============================================================
// PANTALLA DE LISTA DE MIEMBROS
// ============================================================
// Muestra todos los usuarios que están en tu mismo tier.
// Desde acá podés iniciar un chat privado.
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, TIERS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { getMembers } from '../services/chat';
import { TierMember } from '../utils/types';
import MemberItem from '../components/MemberItem';

export default function MemberListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TierMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const tierInfo = user?.tier ? TIERS[user.tier] : null;

  // Cargar miembros cada vez que se enfoca la pantalla
  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [])
  );

  async function loadMembers() {
    try {
      const data = await getMembers();
      setMembers(data.members);
    } catch (error) {
      console.error('Error cargando miembros:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    loadMembers();
  }

  function handlePressMember(member: TierMember) {
    navigation.navigate('Chat', {
      userId: member._id,
      userName: member.displayName,
    });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con info del tier */}
      <View style={[styles.tierBanner, { borderBottomColor: tierInfo?.color || COLORS.border }]}>
        <Text style={styles.tierEmoji}>{tierInfo?.emoji}</Text>
        <Text style={[styles.tierName, { color: tierInfo?.color }]}>Tier {tierInfo?.name}</Text>
        <Text style={styles.memberCount}>
          {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
        </Text>
      </View>

      {/* Lista de miembros */}
      {members.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>No hay otros miembros en tu tier todavía</Text>
          <Text style={styles.emptySubtext}>
            Cuando más personas se unan al tier {tierInfo?.name}, van a aparecer acá
          </Text>
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <MemberItem member={item} onPress={() => handlePressMember(item)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  tierBanner: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 2,
    marginBottom: 8,
  },
  tierEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  tierName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  list: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
