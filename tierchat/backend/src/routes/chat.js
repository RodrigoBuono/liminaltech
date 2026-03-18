// ============================================================
// RUTAS DE CHAT
// ============================================================
// GET  /api/chat/members       - Ver miembros de tu tier
// GET  /api/chat/messages/:id  - Ver mensajes con un usuario
// POST /api/chat/send          - Enviar mensaje
// GET  /api/chat/conversations - Ver todas las conversaciones
// ============================================================

const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const tierCheck = require('../middleware/tierCheck');

const router = express.Router();

// Todas las rutas de chat requieren autenticación y tier activo
router.use(auth);
router.use(tierCheck);

// ============================================================
// VER MIEMBROS DE TU TIER
// ============================================================
// Solo muestra usuarios que pagaron lo mismo que vos
router.get('/members', async (req, res) => {
  try {
    const members = await User.find({
      tier: req.user.tier,
      _id: { $ne: req.user._id }, // Excluirme a mí mismo
      subscriptionActive: true,
    })
      .select('displayName avatarUrl isOnline lastSeen')
      .sort({ isOnline: -1, lastSeen: -1 }); // Online primero

    res.json({
      tier: req.user.tier,
      totalMembers: members.length,
      members,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener miembros: ' + error.message });
  }
});

// ============================================================
// VER MENSAJES CON UN USUARIO
// ============================================================
router.get('/messages/:userId', async (req, res) => {
  try {
    const otherUser = await User.findById(req.params.userId);

    // Verificar que el otro usuario existe y está en el mismo tier
    if (!otherUser || otherUser.tier !== req.user.tier) {
      return res.status(403).json({
        error: 'Solo podés chatear con personas de tu mismo tier.',
      });
    }

    // Obtener mensajes entre los dos usuarios (últimos 50)
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id },
      ],
      group: null,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'displayName avatarUrl');

    // Marcar como leídos los mensajes que me enviaron
    await Message.updateMany(
      {
        sender: req.params.userId,
        recipient: req.user._id,
        read: false,
      },
      { read: true }
    );

    res.json({
      messages: messages.reverse(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes: ' + error.message });
  }
});

// ============================================================
// ENVIAR MENSAJE
// ============================================================
router.post('/send', async (req, res) => {
  try {
    const { recipientId, content, messageType = 'text' } = req.body;

    // Verificar que el destinatario exista y sea del mismo tier
    const recipient = await User.findById(recipientId);
    if (!recipient || recipient.tier !== req.user.tier) {
      return res.status(403).json({
        error: 'Solo podés enviar mensajes a personas de tu mismo tier.',
      });
    }

    // Crear el mensaje
    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content,
      messageType,
      tier: req.user.tier,
    });

    // Poblar datos del sender para la respuesta
    await message.populate('sender', 'displayName avatarUrl');

    res.status(201).json({
      message: 'Mensaje enviado.',
      data: message,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar mensaje: ' + error.message });
  }
});

// ============================================================
// VER TODAS LAS CONVERSACIONES
// ============================================================
// Muestra la lista de chats con el último mensaje de cada uno
router.get('/conversations', async (req, res) => {
  try {
    // Obtener los IDs de usuarios con los que he chateado
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { recipient: req.user._id }],
          group: null,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', req.user._id] }, '$recipient', '$sender'],
          },
          lastMessage: { $first: '$content' },
          lastMessageAt: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ['$recipient', req.user._id] }, { $eq: ['$read', false] }],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    // Poblar datos de los usuarios
    const userIds = messages.map((m) => m._id);
    const users = await User.find({ _id: { $in: userIds } }).select(
      'displayName avatarUrl isOnline lastSeen'
    );

    const conversations = messages.map((msg) => {
      const user = users.find((u) => u._id.toString() === msg._id.toString());
      return {
        user: user || { displayName: 'Usuario eliminado' },
        lastMessage: msg.lastMessage,
        lastMessageAt: msg.lastMessageAt,
        unreadCount: msg.unreadCount,
      };
    });

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener conversaciones: ' + error.message });
  }
});

module.exports = router;
