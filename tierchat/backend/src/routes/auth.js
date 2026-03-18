// ============================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================
// POST /api/auth/register - Crear cuenta nueva
// POST /api/auth/login    - Iniciar sesión
// GET  /api/auth/me       - Ver mi perfil
// PUT  /api/auth/profile  - Actualizar perfil
// ============================================================

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Generar token JWT (dura 30 días)
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// ============================================================
// REGISTRO - Crear cuenta nueva
// ============================================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Verificar que no exista ya un usuario con ese email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'Ya existe una cuenta con ese email.',
      });
    }

    // Crear el usuario
    const user = await User.create({
      email,
      password,
      displayName,
    });

    // Generar token y responder
    const token = generateToken(user._id);

    res.status(201).json({
      message: '¡Cuenta creada exitosamente!',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        tier: user.tier,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la cuenta: ' + error.message });
  }
});

// ============================================================
// LOGIN - Iniciar sesión
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario (incluir password para comparar)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Email o contraseña incorrectos.',
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Email o contraseña incorrectos.',
      });
    }

    // Generar token y responder
    const token = generateToken(user._id);

    res.json({
      message: '¡Bienvenido de vuelta!',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        tier: user.tier,
        subscriptionActive: user.subscriptionActive,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión: ' + error.message });
  }
});

// ============================================================
// MI PERFIL - Ver datos del usuario logueado
// ============================================================
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      displayName: req.user.displayName,
      tier: req.user.tier,
      subscriptionActive: req.user.subscriptionActive,
      subscriptionExpiresAt: req.user.subscriptionExpiresAt,
      avatarUrl: req.user.avatarUrl,
      isOnline: req.user.isOnline,
      createdAt: req.user.createdAt,
    },
  });
});

// ============================================================
// ACTUALIZAR PERFIL
// ============================================================
router.put('/profile', auth, async (req, res) => {
  try {
    const { displayName, avatarUrl } = req.body;
    const updates = {};

    if (displayName) updates.displayName = displayName;
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });

    res.json({
      message: 'Perfil actualizado.',
      user: {
        id: user._id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil: ' + error.message });
  }
});

module.exports = router;
