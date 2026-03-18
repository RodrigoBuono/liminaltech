// ============================================================
// RUTAS DE PAGOS (STRIPE)
// ============================================================
// POST /api/payments/create-checkout  - Crear sesión de pago
// POST /api/payments/webhook          - Recibir eventos de Stripe
// GET  /api/payments/status           - Ver estado de suscripción
// POST /api/payments/cancel           - Cancelar suscripción
// ============================================================

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// ============================================================
// PRECIOS DE CADA TIER (IDs de Stripe)
// ============================================================
// Estos son los Price IDs que creás en tu dashboard de Stripe.
// Por ahora usamos precios de prueba. Cuando vayas a producción,
// creá los precios reales en Stripe y actualizá estos IDs.
const TIER_PRICES = {
  bronce: {
    name: 'Bronce',
    amount: 100, // $1.00 en centavos
    priceId: process.env.STRIPE_PRICE_BRONCE || 'price_bronce_test',
  },
  plata: {
    name: 'Plata',
    amount: 1000, // $10.00
    priceId: process.env.STRIPE_PRICE_PLATA || 'price_plata_test',
  },
  oro: {
    name: 'Oro',
    amount: 10000, // $100.00
    priceId: process.env.STRIPE_PRICE_ORO || 'price_oro_test',
  },
  diamante: {
    name: 'Diamante',
    amount: 100000, // $1,000.00
    priceId: process.env.STRIPE_PRICE_DIAMANTE || 'price_diamante_test',
  },
  elite: {
    name: 'Elite',
    amount: 1000000, // $10,000.00
    priceId: process.env.STRIPE_PRICE_ELITE || 'price_elite_test',
  },
};

// ============================================================
// CREAR SESIÓN DE CHECKOUT
// ============================================================
// El usuario elige un tier y se lo redirige a Stripe para pagar
router.post('/create-checkout', auth, async (req, res) => {
  try {
    const { tier } = req.body;

    // Verificar que el tier sea válido
    if (!TIER_PRICES[tier]) {
      return res.status(400).json({ error: 'Tier no válido.' });
    }

    const tierInfo = TIER_PRICES[tier];

    // Crear o recuperar el cliente de Stripe
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: { userId: req.user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
    }

    // Crear la sesión de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: tierInfo.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: req.user._id.toString(),
        tier: tier,
      },
      success_url: `${process.env.APP_URL || 'tierchat://'}payment-success?tier=${tier}`,
      cancel_url: `${process.env.APP_URL || 'tierchat://'}payment-cancel`,
    });

    res.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el pago: ' + error.message });
  }
});

// ============================================================
// WEBHOOK DE STRIPE
// ============================================================
// Stripe nos avisa acá cuando un pago se confirma o cancela.
// Es como un "callback" que Stripe llama automáticamente.
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Error en webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar los diferentes tipos de eventos
  switch (event.type) {
    // Pago exitoso - activar suscripción
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const tier = session.metadata.tier;

      await User.findByIdAndUpdate(userId, {
        tier: tier,
        stripeSubscriptionId: session.subscription,
        subscriptionActive: true,
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
      });

      console.log(`✅ Usuario ${userId} activó tier ${tier}`);
      break;
    }

    // Suscripción renovada
    case 'invoice.paid': {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;

      const user = await User.findOne({ stripeSubscriptionId: subscriptionId });
      if (user) {
        user.subscriptionActive = true;
        user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await user.save();
        console.log(`🔄 Suscripción renovada para usuario ${user._id}`);
      }
      break;
    }

    // Pago fallido - desactivar suscripción
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;

      const user = await User.findOne({ stripeSubscriptionId: subscriptionId });
      if (user) {
        user.subscriptionActive = false;
        await user.save();
        console.log(`❌ Pago fallido para usuario ${user._id}`);
      }
      break;
    }

    // Suscripción cancelada
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;

      const user = await User.findOne({ stripeSubscriptionId: subscription.id });
      if (user) {
        user.subscriptionActive = false;
        user.tier = null;
        user.stripeSubscriptionId = null;
        await user.save();
        console.log(`🚫 Suscripción cancelada para usuario ${user._id}`);
      }
      break;
    }
  }

  res.json({ received: true });
});

// ============================================================
// VER ESTADO DE SUSCRIPCIÓN
// ============================================================
router.get('/status', auth, async (req, res) => {
  res.json({
    tier: req.user.tier,
    subscriptionActive: req.user.subscriptionActive,
    subscriptionExpiresAt: req.user.subscriptionExpiresAt,
    tiers: Object.entries(TIER_PRICES).map(([key, value]) => ({
      id: key,
      name: value.name,
      price: value.amount / 100,
    })),
  });
});

// ============================================================
// CANCELAR SUSCRIPCIÓN
// ============================================================
router.post('/cancel', auth, async (req, res) => {
  try {
    if (!req.user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No tenés una suscripción activa.' });
    }

    // Cancelar en Stripe (al final del período)
    await stripe.subscriptions.update(req.user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({
      message: 'Suscripción cancelada. Seguirás teniendo acceso hasta que termine el período actual.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar: ' + error.message });
  }
});

module.exports = router;
