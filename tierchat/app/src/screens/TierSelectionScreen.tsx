// ============================================================
// PANTALLA DE SELECCIÓN DE TIER
// ============================================================
// El usuario elige qué nivel quiere pagar.
// Se muestra después del registro o cuando no tiene tier activo.
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, TIERS, TierId } from '../utils/constants';
import { startCheckout } from '../services/payments';
import { useAuth } from '../context/AuthContext';

export default function TierSelectionScreen() {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelectTier(tierId: TierId) {
    setLoading(tierId);
    try {
      await startCheckout(tierId);
      // Después de volver del navegador, refrescar datos del usuario
      await refreshUser();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error al procesar el pago');
    } finally {
      setLoading(null);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Elegí tu Tier</Text>
      <Text style={styles.subtitle}>Solo vas a poder chatear con gente de tu mismo nivel</Text>

      {Object.entries(TIERS).map(([id, tier]) => (
        <TouchableOpacity
          key={id}
          style={[styles.tierCard, { borderColor: tier.color }]}
          onPress={() => handleSelectTier(id as TierId)}
          disabled={loading !== null}
        >
          <View style={styles.tierHeader}>
            <Text style={styles.tierEmoji}>{tier.emoji}</Text>
            <View style={styles.tierInfo}>
              <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
              <Text style={styles.tierDescription}>{tier.description}</Text>
            </View>
          </View>

          <View style={styles.tierPriceContainer}>
            {loading === id ? (
              <ActivityIndicator color={tier.color} />
            ) : (
              <>
                <Text style={[styles.tierPrice, { color: tier.color }]}>
                  ${tier.price.toLocaleString()}
                </Text>
                <Text style={styles.tierPeriod}>/mes</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.disclaimer}>
        Los pagos se procesan de forma segura a través de Stripe. Podés cancelar en cualquier
        momento.
      </Text>
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
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  tierCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tierEmoji: {
    fontSize: 36,
    marginRight: 16,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tierDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  tierPriceContainer: {
    alignItems: 'flex-end',
  },
  tierPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tierPeriod: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
});
