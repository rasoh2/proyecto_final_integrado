const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contactoTransferencia.controller');

// Crear contacto
router.post('/', contactoController.crearContacto);

// Obtener contactos por usuarioId
router.get('/', contactoController.obtenerContactos);

module.exports = router;
