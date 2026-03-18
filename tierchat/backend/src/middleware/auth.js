// ============================================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================================
// Verifica que el usuario esté logueado antes de acceder
// a rutas protegidas. Usa JWT (JSON Web Token).
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // 1. Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No estás autenticado. Iniciá sesión primero.',
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar que el token sea válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Buscar al usuario en la base de datos
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado. Puede que tu cuenta haya sido eliminada.',
      });
    }

    // 4. Agregar el usuario al request para usarlo en las rutas
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Tu sesión expiró. Iniciá sesión de nuevo.',
      });
    }
    return res.status(401).json({
      error: 'Token inválido.',
    });
  }
};

module.exports = auth;
