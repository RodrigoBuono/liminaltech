// ============================================================
// MODELO DE USUARIO
// ============================================================
// Define cómo se guarda un usuario en la base de datos.
// Cada usuario tiene: email, contraseña, nombre, tier, etc.
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Los 5 tiers disponibles en la app
const TIERS = ['bronce', 'plata', 'oro', 'diamante', 'elite'];

const userSchema = new mongoose.Schema(
  {
    // Nombre que se muestra en la app
    displayName: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: 50,
    },

    // Email para login (único, no se puede repetir)
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Contraseña (se guarda encriptada, nunca en texto plano)
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: 6,
      select: false, // No se incluye en las consultas por defecto
    },

    // Tier actual del usuario (determina con quién puede hablar)
    tier: {
      type: String,
      enum: TIERS,
      default: null, // null = no ha pagado todavía
    },

    // ID del cliente en Stripe (para manejar pagos)
    stripeCustomerId: {
      type: String,
      default: null,
    },

    // ID de la suscripción activa en Stripe
    stripeSubscriptionId: {
      type: String,
      default: null,
    },

    // Si la suscripción está activa o no
    subscriptionActive: {
      type: Boolean,
      default: false,
    },

    // Fecha en que expira la suscripción actual
    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },

    // Token para notificaciones push (Firebase)
    pushToken: {
      type: String,
      default: null,
    },

    // Foto de perfil (URL)
    avatarUrl: {
      type: String,
      default: null,
    },

    // Si el usuario está conectado ahora
    isOnline: {
      type: Boolean,
      default: false,
    },

    // Última vez que estuvo conectado
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Agrega automáticamente createdAt y updatedAt
    timestamps: true,
  }
);

// ============================================================
// ANTES DE GUARDAR: encriptar la contraseña
// ============================================================
// Esto se ejecuta automáticamente antes de guardar un usuario.
// Convierte la contraseña en un hash seguro.
userSchema.pre('save', async function (next) {
  // Solo encriptar si la contraseña fue modificada
  if (!this.isModified('password')) return next();

  // Encriptar con bcrypt (factor 12 = muy seguro)
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ============================================================
// MÉTODO: comparar contraseña
// ============================================================
// Se usa en el login para verificar que la contraseña es correcta
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Exportar el modelo
module.exports = mongoose.model('User', userSchema);
module.exports.TIERS = TIERS;
