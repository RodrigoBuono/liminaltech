// ============================================================
// SERVIDOR PRINCIPAL DE TIERCHAT
// ============================================================
// Este archivo es el "cerebro" del backend. Acá se configura
// todo: la base de datos, las rutas, y el chat en tiempo real.
// ============================================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./src/routes/auth');
const paymentRoutes = require('./src/routes/payments');
const chatRoutes = require('./src/routes/chat');
const groupRoutes = require('./src/routes/groups');

// Importar el manejador de chat en tiempo real
const { setupChatSocket } = require('./src/socket/chatHandler');

// Crear la app de Express
const app = express();
const server = http.createServer(app);

// Configurar Socket.io para chat en tiempo real
const io = new Server(server, {
  cors: {
    origin: '*', // En producción, limitá esto a tu dominio
    methods: ['GET', 'POST'],
  },
});

// ============================================================
// MIDDLEWARE (código que se ejecuta antes de cada petición)
// ============================================================
app.use(cors()); // Permite peticiones desde la app
app.use(express.json()); // Permite recibir JSON en las peticiones

// Ruta de Stripe webhooks necesita el body raw (sin procesar)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// ============================================================
// RUTAS DE LA API
// ============================================================
// Cada grupo de rutas maneja una parte de la app:
app.use('/api/auth', authRoutes);         // Login y registro
app.use('/api/payments', paymentRoutes);   // Pagos con Stripe
app.use('/api/chat', chatRoutes);         // Mensajes
app.use('/api/groups', groupRoutes);       // Grupos

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({
    message: '¡TierChat API funcionando!',
    version: '1.0.0',
    tiers: ['Bronce ($1)', 'Plata ($10)', 'Oro ($100)', 'Diamante ($1000)', 'Elite ($10000)'],
  });
});

// ============================================================
// CONEXIÓN A BASE DE DATOS Y ARRANQUE
// ============================================================
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');

    // Configurar el chat en tiempo real
    setupChatSocket(io);

    // Iniciar el servidor
    server.listen(PORT, () => {
      console.log(`🚀 Servidor TierChat corriendo en puerto ${PORT}`);
      console.log(`📡 API disponible en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  });
