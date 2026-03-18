// ============================================================
// SERVICIO DE PAGOS
// ============================================================
// Funciones para manejar suscripciones con Stripe.
// ============================================================

import * as WebBrowser from 'expo-web-browser';
import api from './api';
import { TierId } from '../utils/constants';

// Obtener estado de la suscripción
export async function getPaymentStatus(): Promise<{
  tier: string | null;
  subscriptionActive: boolean;
  subscriptionExpiresAt: string | null;
  tiers: Array<{ id: string; name: string; price: number }>;
}> {
  const response = await api.get('/payments/status');
  return response.data;
}

// Iniciar proceso de pago (abre el navegador con Stripe Checkout)
export async function startCheckout(tier: TierId): Promise<void> {
  const response = await api.post('/payments/create-checkout', { tier });
  const { checkoutUrl } = response.data;

  // Abrir el navegador para completar el pago en Stripe
  await WebBrowser.openBrowserAsync(checkoutUrl);
}

// Cancelar suscripción
export async function cancelSubscription(): Promise<{ message: string }> {
  const response = await api.post('/payments/cancel');
  return response.data;
}
