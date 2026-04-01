const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.sendResponse('error', 'Acceso denegado. No se proporcionó token de autenticación.', null, 401);
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodificado; // Información del usuario disponible para el siguiente proceso
    next();
  } catch (error) {
    return res.sendResponse('error', 'Token inválido o expirado.', null, 401);
  }
};

module.exports = authMiddleware;