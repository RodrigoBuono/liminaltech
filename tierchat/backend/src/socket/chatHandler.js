// ============================================================
// MANEJADOR DE CHAT EN TIEMPO REAL (Socket.io)
// ============================================================
// Acá se maneja toda la comunicación en tiempo real:
// - Conexión/desconexión de usuarios
// - Envío de mensajes instantáneos
// - Notificación de "está escribiendo..."
// - Unirse a salas por tier
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

function setupChatSocket(io) {
  // ============================================================
  // AUTENTICACIÓN DEL SOCKET
  // ============================================================
  // Antes de conectar, verificamos que el usuario tiene un token válido
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('No estás autenticado'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('Usuario no encontrado'));
      }

      // Guardar el usuario en el socket para usarlo después
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  // ============================================================
  // CUANDO UN USUARIO SE CONECTA
  // ============================================================
  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`🟢 ${user.displayName} se conectó (tier: ${user.tier || 'sin tier'})`);

    // Marcar como online
    await User.findByIdAndUpdate(user._id, { isOnline: true });

    // Unir al usuario a la sala de su tier
    if (user.tier && user.subscriptionActive) {
      const tierRoom = `tier:${user.tier}`;
      socket.join(tierRoom);

      // Avisar a los demás del tier que se conectó
      socket.to(tierRoom).emit('user:online', {
        userId: user._id,
        displayName: user.displayName,
      });
    }

    // ============================================================
    // ENVIAR MENSAJE PRIVADO
    // ============================================================
    socket.on('message:send', async (data) => {
      try {
        const { recipientId, content } = data;

        // Verificar que el destinatario sea del mismo tier
        const recipient = await User.findById(recipientId);
        if (!recipient || recipient.tier !== user.tier) {
          socket.emit('error', {
            message: 'Solo podés enviar mensajes a personas de tu mismo tier.',
          });
          return;
        }

        // Guardar el mensaje en la base de datos
        const message = await Message.create({
          sender: user._id,
          recipient: recipientId,
          content,
          tier: user.tier,
        });

        await message.populate('sender', 'displayName avatarUrl');

        // Enviar el mensaje al destinatario en tiempo real
        io.to(`user:${recipientId}`).emit('message:new', {
          message: {
            id: message._id,
            sender: {
              id: user._id,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
            },
            content,
            createdAt: message.createdAt,
          },
        });

        // Confirmar al remitente que se envió
        socket.emit('message:sent', {
          messageId: message._id,
          recipientId,
        });
      } catch (error) {
        socket.emit('error', { message: 'Error al enviar mensaje' });
      }
    });

    // ============================================================
    // ENVIAR MENSAJE A GRUPO
    // ============================================================
    socket.on('group:message', async (data) => {
      try {
        const { groupId, content } = data;

        const message = await Message.create({
          sender: user._id,
          group: groupId,
          content,
          tier: user.tier,
        });

        await message.populate('sender', 'displayName avatarUrl');

        // Enviar a todos los miembros del grupo
        io.to(`group:${groupId}`).emit('group:newMessage', {
          groupId,
          message: {
            id: message._id,
            sender: {
              id: user._id,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
            },
            content,
            createdAt: message.createdAt,
          },
        });
      } catch (error) {
        socket.emit('error', { message: 'Error al enviar mensaje al grupo' });
      }
    });

    // ============================================================
    // UNIRSE A UN GRUPO (sala de socket)
    // ============================================================
    socket.on('group:join', (data) => {
      socket.join(`group:${data.groupId}`);
    });

    // ============================================================
    // "ESTÁ ESCRIBIENDO..."
    // ============================================================
    socket.on('typing:start', (data) => {
      if (data.recipientId) {
        io.to(`user:${data.recipientId}`).emit('typing:show', {
          userId: user._id,
          displayName: user.displayName,
        });
      } else if (data.groupId) {
        socket.to(`group:${data.groupId}`).emit('typing:show', {
          userId: user._id,
          displayName: user.displayName,
        });
      }
    });

    socket.on('typing:stop', (data) => {
      if (data.recipientId) {
        io.to(`user:${data.recipientId}`).emit('typing:hide', {
          userId: user._id,
        });
      } else if (data.groupId) {
        socket.to(`group:${data.groupId}`).emit('typing:hide', {
          userId: user._id,
        });
      }
    });

    // ============================================================
    // CUANDO SE DESCONECTA
    // ============================================================
    socket.on('disconnect', async () => {
      console.log(`🔴 ${user.displayName} se desconectó`);

      await User.findByIdAndUpdate(user._id, {
        isOnline: false,
        lastSeen: new Date(),
      });

      if (user.tier) {
        socket.to(`tier:${user.tier}`).emit('user:offline', {
          userId: user._id,
          lastSeen: new Date(),
        });
      }
    });

    // Unirse a la sala personal (para recibir mensajes privados)
    socket.join(`user:${user._id}`);
  });
}

module.exports = { setupChatSocket };
