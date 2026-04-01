const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Rutas Públicas (No requieren JWT)
router.post('/registro', userController.register);
router.post('/login', userController.login);

// Rutas Críticas / Privadas (Requieren JWT por el Middleware authMiddleware)
router.get('/perfil', authMiddleware, userController.getProfile);

// Ruta para subida de imagen de perfil (Upload Simple Multer)
// Se protege con JWT y verifica un field "avatar" del input en el FormData del frontend
router.post('/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;