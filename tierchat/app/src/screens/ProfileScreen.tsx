// ============================================================
// PANTALLA DE PERFIL
// ============================================================
// El usuario ve su información, tier actual, y puede
// cerrar sesión o cancelar su suscripción.
// ============================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TIERS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { cancelSubscription } from '../services/payments';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, refreshUser } = useAuth();
  const [cancelLoading, setCancelLoading] = useState(false);

  const tierInfo = user?.tier ? TIERS[user.tier] : null;

  async function handleLogout() {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }

  async function handleCancelSubscription() {
    Alert.alert(
      'Cancelar Suscripción',
      '¿Estás seguro? Seguirás teniendo acceso hasta que termine el período actual.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancelLoading(true);
            try {
              const result = await cancelSubscription();
              Alert.alert('Listo', result.message);
              await refreshUser();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Error al cancelar');
            } finally {
              setCancelLoading(false);
            }
          },
        },
      ]
    );
  }

  function handleChangeTier() {
    navigation.navigate('TierSelection');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { borderColor: tierInfo?.color || COLORS.border }]}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.displayName}>{user?.displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Info del tier */}
      {tierInfo && (
        <View style={[styles.tierCard, { borderColor: tierInfo.color }]}>
          <Text style={styles.tierEmoji}>{tierInfo.emoji}</Text>
          <Text style={[styles.tierName, { color: tierInfo.color }]}>Tier {tierInfo.name}</Text>
          <Text style={styles.tierPrice}>${tierInfo.price.toLocaleString()}/mes</Text>
          {user?.subscriptionExpiresAt && (
            <Text style={styles.tierExpiry}>
              Expira: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Opciones */}
      <View style={styles.options}>
        <TouchableOpacity style={styles.option} onPress={handleChangeTier}>
          <Ionicons name="swap-horizontal" size={22} color={COLORS.text} />
          <Text style={styles.optionText}>
            {tierInfo ? 'Cambiar Tier' : 'Elegir Tier'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {user?.subscriptionActive && (
          <TouchableOpacity
            style={styles.option}
            onPress={handleCancelSubscription}
            disabled={cancelLoading}
          >
            <Ionicons name="close-circle-outline" size={22} color={COLORS.error} />
            <Text style={[styles.optionText, { color: COLORS.error }]}>
              {cancelLoading ? 'Cancelando...' : 'Cancelar Suscripción'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.option, styles.logoutOption]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={[styles.optionText, { color: COLORS.error }]}>Cerrar Sesión</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tierCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
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
  tierPrice: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  tierExpiry: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  options: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  logoutOption: {
    borderBottomWidth: 0,
  },
});
