// ============================================================
// MIDDLEWARE DE VERIFICACIÓN DE TIER
// ============================================================
// Verifica que el usuario tenga una suscripción activa
// antes de dejarlo acceder al chat o ver miembros.
// ============================================================

const tierCheck = (req, res, next) => {
  // Verificar que tenga un tier asignado
  if (!req.user.tier) {
    return res.status(403).json({
      error: 'No tenés un tier activo. Elegí un plan para empezar a chatear.',
      code: 'NO_TIER',
    });
  }

  // Verificar que la suscripción esté activa
  if (!req.user.subscriptionActive) {
    return res.status(403).json({
      error: 'Tu suscripción no está activa. Renovála para seguir chateando.',
      code: 'SUBSCRIPTION_INACTIVE',
    });
  }

  // Verificar que no haya expirado
  if (req.user.subscriptionExpiresAt && req.user.subscriptionExpiresAt < new Date()) {
    return res.status(403).json({
      error: 'Tu suscripción expiró. Renovála para seguir chateando.',
      code: 'SUBSCRIPTION_EXPIRED',
    });
  }

  next();
};

module.exports = tierCheck;
