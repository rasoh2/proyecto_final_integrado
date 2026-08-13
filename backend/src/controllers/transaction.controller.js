const Transaction = require("../models/Transaction");
const User = require("../models/User");
const sequelize = require("../config/database");

// Obtener todas las transacciones del usuario logueado
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { sender_id: userId },
          { receiver_id: userId },
        ],
      },
      order: [["createdAt", "DESC"]],
    });

    res.sendResponse(
      "success",
      "Transacciones obtenidas correctamente",
      transactions,
    );
  } catch (error) {
    res.sendResponse(
      "error",
      "Error al obtener transacciones",
      error.message,
      500,
    );
  }
};

// Crear un depósito (Agrega saldo al usuario logueado)
exports.deposit = async (req, res) => {
  const { monto } = req.body;

  // Validar monto antes de iniciar la transacción
  if (!monto || parseFloat(monto) <= 0 || isNaN(parseFloat(monto))) {
    return res.sendResponse(
      "error",
      "El monto debe ser un número mayor a 0",
      null,
      400,
    );
  }

  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    // Bloquear la fila del usuario para evitar condiciones de carrera (Race Conditions)
    const user = await User.findByPk(userId, { 
      transaction: t,
      lock: t.LOCK.UPDATE 
    });

    if (!user) {
      await t.rollback();
      return res.sendResponse("error", "Usuario no encontrado", null, 404);
    }

    // Actualizar saldo con precisión decimal fija
    const nuevoSaldo = (parseFloat(user.saldo) + parseFloat(monto)).toFixed(2);
    user.saldo = nuevoSaldo;
    await user.save({ transaction: t });

    // Registrar transacción (receptor es el mismo usuario, sender es el mismo)
    const transaction = await Transaction.create(
      {
        monto: parseFloat(monto).toFixed(2),
        tipo: "deposito",
        receiver_id: userId,
        sender_id: userId,
      },
      { transaction: t },
    );

    await t.commit();
    return res.sendResponse("success", "Depósito realizado con éxito", {
      transaction,
      nuevoSaldo: user.saldo,
    });
  } catch (error) {
    await t.rollback();
    return res.sendResponse(
      "error",
      "Error al realizar el depósito",
      error.message,
      500,
    );
  }
};

// Transferir dinero a otro usuario
exports.transfer = async (req, res) => {
  const senderId = req.user.id;
  const { receiver_correo, monto } = req.body;

  // Validaciones antes de iniciar la transacción
  if (!receiver_correo) {
    return res.sendResponse(
      "error",
      "El correo del destinatario es obligatorio",
      null,
      400,
    );
  }

  if (req.user.correo === receiver_correo) {
    return res.sendResponse(
      "error",
      "No puedes transferirte a ti mismo",
      null,
      400,
    );
  }

  if (!monto || parseFloat(monto) <= 0 || isNaN(parseFloat(monto))) {
    return res.sendResponse(
      "error",
      "El monto debe ser un número mayor a 0",
      null,
      400,
    );
  }

  const t = await sequelize.transaction();
  try {
    // Buscar receptor y bloquear la fila para evitar inconsistencias
    const receiver = await User.findOne({
      where: { correo: receiver_correo },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!receiver) {
      await t.rollback();
      return res.sendResponse(
        "error",
        "El usuario receptor no está registrado en AlkeWallet",
        null,
        404,
      );
    }

    if (senderId === receiver.id) {
      await t.rollback();
      return res.sendResponse(
        "error",
        "No puedes transferirte a ti mismo",
        null,
        400,
      );
    }

    // Buscar emisor y bloquear fila
    const sender = await User.findByPk(senderId, { 
      transaction: t,
      lock: t.LOCK.UPDATE 
    });

    if (!sender) {
      await t.rollback();
      return res.sendResponse("error", "Emisor no encontrado", null, 404);
    }

    if (parseFloat(sender.saldo) < parseFloat(monto)) {
      await t.rollback();
      return res.sendResponse("error", "Fondos insuficientes", null, 400);
    }

    // Actualizar saldos con precisión decimal
    sender.saldo = (parseFloat(sender.saldo) - parseFloat(monto)).toFixed(2);
    receiver.saldo = (parseFloat(receiver.saldo) + parseFloat(monto)).toFixed(2);

    await sender.save({ transaction: t });
    await receiver.save({ transaction: t });

    // Registrar transacción
    const transaction = await Transaction.create(
      {
        monto: parseFloat(monto).toFixed(2),
        tipo: "transferencia",
        sender_id: sender.id,
        receiver_id: receiver.id,
      },
      { transaction: t },
    );

    await t.commit();
    return res.sendResponse("success", "Transferencia realizada con éxito", {
      transaction,
      tuNuevoSaldo: sender.saldo,
    });
  } catch (error) {
    await t.rollback();
    return res.sendResponse(
      "error",
      "Error al realizar la transferencia",
      error.message,
      500,
    );
  }
};
