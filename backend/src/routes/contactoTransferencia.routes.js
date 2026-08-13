const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contactoTransferencia.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Proteger todas las rutas de contactos de transferencia
router.use(authMiddleware);

// Crear contacto
router.post('/', contactoController.crearContacto);

// Obtener contactos por usuarioId
router.get('/', contactoController.obtenerContactos);

module.exports = router;
