// ============================================================
// SERVICIO DE STRIPE
// ============================================================
// Funciones auxiliares para trabajar con Stripe.
// Crear productos, precios y gestionar suscripciones.
// ============================================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Configuración de los tiers con sus precios
const TIER_CONFIG = {
  bronce: { name: 'TierChat Bronce', amount: 100, emoji: '🥉' },
  plata: { name: 'TierChat Plata', amount: 1000, emoji: '🥈' },
  oro: { name: 'TierChat Oro', amount: 10000, emoji: '🥇' },
  diamante: { name: 'TierChat Diamante', amount: 100000, emoji: '💎' },
  elite: { name: 'TierChat Elite', amount: 1000000, emoji: '👑' },
};

// Crear los productos y precios en Stripe (ejecutar una sola vez)
async function setupStripeProducts() {
  console.log('Creando productos en Stripe...\n');

  for (const [tierId, config] of Object.entries(TIER_CONFIG)) {
    // Crear el producto
    const product = await stripe.products.create({
      name: `${config.emoji} ${config.name}`,
      description: `Suscripción mensual al tier ${config.name} de TierChat`,
    });

    // Crear el precio (recurrente, mensual)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: config.amount,
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    console.log(`${config.emoji} ${config.name}: $${config.amount / 100}/mes`);
    console.log(`   Product ID: ${product.id}`);
    console.log(`   Price ID: ${price.id}`);
    console.log(`   → Agregá STRIPE_PRICE_${tierId.toUpperCase()}=${price.id} al .env\n`);
  }

  console.log('¡Productos creados! Actualizá tu archivo .env con los Price IDs.');
}

module.exports = { setupStripeProducts, TIER_CONFIG };
