// ============================================================
// MODELO DE GRUPO
// ============================================================
// Los usuarios pueden crear grupos dentro de su tier.
// Solo pueden unirse personas del mismo tier.
// ============================================================

const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    // Nombre del grupo
    name: {
      type: String,
      required: [true, 'El nombre del grupo es obligatorio'],
      trim: true,
      maxlength: 100,
    },

    // Descripción opcional
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },

    // Tier al que pertenece este grupo (solo ese tier puede ver/unirse)
    tier: {
      type: String,
      required: true,
    },

    // Quién creó el grupo
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Lista de miembros del grupo
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Admins del grupo (pueden agregar/remover miembros)
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Imagen del grupo (URL)
    avatarUrl: {
      type: String,
      default: null,
    },

    // Último mensaje (para mostrar preview en la lista)
    lastMessage: {
      content: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sentAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para buscar grupos por tier rápidamente
groupSchema.index({ tier: 1 });

module.exports = mongoose.model('Group', groupSchema);
