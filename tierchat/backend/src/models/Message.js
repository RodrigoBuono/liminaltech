// ============================================================
// MODELO DE MENSAJE
// ============================================================
// Cada mensaje que se envía en la app se guarda acá.
// Puede ser un mensaje privado (1 a 1) o de grupo.
// ============================================================

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // Quién envió el mensaje
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // A quién va dirigido (para chat privado 1 a 1)
    // Si es null, es un mensaje de grupo
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Si el mensaje es para un grupo, acá va el ID del grupo
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
    },

    // El contenido del mensaje
    content: {
      type: String,
      required: [true, 'El mensaje no puede estar vacío'],
      maxlength: 5000,
    },

    // Tipo de mensaje
    messageType: {
      type: String,
      enum: ['text', 'image', 'system'],
      default: 'text',
    },

    // Si el destinatario ya leyó el mensaje
    read: {
      type: Boolean,
      default: false,
    },

    // En qué tier se envió este mensaje
    tier: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas rápidas
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ group: 1, createdAt: -1 });
messageSchema.index({ tier: 1 });

module.exports = mongoose.model('Message', messageSchema);
