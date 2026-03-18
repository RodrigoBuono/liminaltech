// ============================================================
// COMPONENTE: TARJETA DE TIER
// ============================================================
// Muestra la info de un tier en la pantalla de selección.
// ============================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../utils/constants';

interface TierCardProps {
  emoji: string;
  name: string;
  price: number;
  description: string;
  color: string;
  loading: boolean;
  onPress: () => void;
}

export default function TierCard({
  emoji,
  name,
  price,
  description,
  color,
  loading,
  onPress,
}: TierCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: color }]}
      onPress={onPress}
      disabled={loading}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.info}>
        <Text style={[styles.name, { color }]}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.priceContainer}>
        {loading ? (
          <ActivityIndicator color={color} />
        ) : (
          <>
            <Text style={[styles.price, { color }]}>${price.toLocaleString()}</Text>
            <Text style={styles.period}>/mes</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
  },
  emoji: {
    fontSize: 34,
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
