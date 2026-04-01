const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas las rutas de transacciones son protegidas
router.use(authMiddleware);

router.get('/', transactionController.getTransactions);
router.post('/deposito', transactionController.deposit);
router.post('/transferencia', transactionController.transfer);

module.exports = router;