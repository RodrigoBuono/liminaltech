// ============================================================
// RUTAS DE GRUPOS
// ============================================================
// GET    /api/groups           - Ver grupos de mi tier
// POST   /api/groups           - Crear grupo nuevo
// POST   /api/groups/:id/join  - Unirse a un grupo
// POST   /api/groups/:id/leave - Salir de un grupo
// GET    /api/groups/:id/messages - Ver mensajes del grupo
// POST   /api/groups/:id/send  - Enviar mensaje al grupo
// ============================================================

const express = require('express');
const Group = require('../models/Group');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const tierCheck = require('../middleware/tierCheck');

const router = express.Router();

router.use(auth);
router.use(tierCheck);

// ============================================================
// VER GRUPOS DE MI TIER
// ============================================================
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find({ tier: req.user.tier })
      .populate('createdBy', 'displayName')
      .sort({ updatedAt: -1 });

    res.json({
      tier: req.user.tier,
      groups: groups.map((g) => ({
        id: g._id,
        name: g.name,
        description: g.description,
        memberCount: g.members.length,
        createdBy: g.createdBy?.displayName,
        lastMessage: g.lastMessage,
        isMember: g.members.some((m) => m.toString() === req.user._id.toString()),
        avatarUrl: g.avatarUrl,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener grupos: ' + error.message });
  }
});

// ============================================================
// CREAR GRUPO NUEVO
// ============================================================
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    const group = await Group.create({
      name,
      description,
      tier: req.user.tier,
      createdBy: req.user._id,
      members: [req.user._id],
      admins: [req.user._id],
    });

    res.status(201).json({
      message: `Grupo "${name}" creado exitosamente.`,
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
        tier: group.tier,
        memberCount: 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear grupo: ' + error.message });
  }
});

// ============================================================
// UNIRSE A UN GRUPO
// ============================================================
router.post('/:id/join', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Grupo no encontrado.' });
    }

    if (group.tier !== req.user.tier) {
      return res.status(403).json({ error: 'Este grupo no es de tu tier.' });
    }

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ error: 'Ya sos miembro de este grupo.' });
    }

    group.members.push(req.user._id);
    await group.save();

    res.json({ message: `Te uniste al grupo "${group.name}".` });
  } catch (error) {
    res.status(500).json({ error: 'Error al unirse: ' + error.message });
  }
});

// ============================================================
// SALIR DE UN GRUPO
// ============================================================
router.post('/:id/leave', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Grupo no encontrado.' });
    }

    group.members = group.members.filter((m) => m.toString() !== req.user._id.toString());
    await group.save();

    res.json({ message: `Saliste del grupo "${group.name}".` });
  } catch (error) {
    res.status(500).json({ error: 'Error al salir: ' + error.message });
  }
});

// ============================================================
// VER MENSAJES DEL GRUPO
// ============================================================
router.get('/:id/messages', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group || group.tier !== req.user.tier) {
      return res.status(403).json({ error: 'No tenés acceso a este grupo.' });
    }

    if (!group.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: 'No sos miembro de este grupo.' });
    }

    const messages = await Message.find({ group: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'displayName avatarUrl');

    res.json({ messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes: ' + error.message });
  }
});

// ============================================================
// ENVIAR MENSAJE AL GRUPO
// ============================================================
router.post('/:id/send', async (req, res) => {
  try {
    const { content } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group || group.tier !== req.user.tier) {
      return res.status(403).json({ error: 'No tenés acceso a este grupo.' });
    }

    if (!group.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: 'No sos miembro de este grupo.' });
    }

    const message = await Message.create({
      sender: req.user._id,
      group: group._id,
      content,
      tier: req.user.tier,
    });

    await message.populate('sender', 'displayName avatarUrl');

    // Actualizar último mensaje del grupo
    group.lastMessage = {
      content,
      sender: req.user._id,
      sentAt: new Date(),
    };
    await group.save();

    res.status(201).json({ data: message });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar mensaje: ' + error.message });
  }
});

module.exports = router;
