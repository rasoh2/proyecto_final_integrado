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

  const numMonto = parseFloat(monto);
  if (!monto || numMonto <= 0 || isNaN(numMonto)) {
    return res.sendResponse(
      "error",
      "El monto debe ser un número mayor a 0",
      null,
      400,
    );
  }

  const MAX_TRANSFER_LIMIT = 5000000;
  if (numMonto > MAX_TRANSFER_LIMIT) {
    return res.sendResponse(
      "error",
      "El monto máximo permitido por transferencia es de $5.000.000 CLP",
      null,
      400,
    );
  }

  const t = await sequelize.transaction();
  try {
    // 1. Buscar receptor sin bloquear para validar existencia e ID
    const receiverCheck = await User.findOne({
      where: { correo: receiver_correo },
      transaction: t,
    });

    if (!receiverCheck) {
      await t.rollback();
      return res.sendResponse(
        "error",
        "El usuario receptor no está registrado en AlkeWallet",
        null,
        404,
      );
    }

    if (senderId === receiverCheck.id) {
      await t.rollback();
      return res.sendResponse(
        "error",
        "No puedes transferirte a ti mismo",
        null,
        400,
      );
    }

    // 2. Ordenar IDs de forma determinista para adquirir bloqueos UPDATE y evitar Deadlocks
    const firstLockId = senderId < receiverCheck.id ? senderId : receiverCheck.id;
    const secondLockId = senderId < receiverCheck.id ? receiverCheck.id : senderId;

    // Adquirir bloqueos en orden estricto (solo PostgreSQL soporta LOCK.UPDATE)
    const lockOption = sequelize.options.dialect === "sqlite" ? {} : { lock: t.LOCK.UPDATE };

    const firstUser = await User.findByPk(firstLockId, {
      transaction: t,
      ...lockOption,
    });

    const secondUser = await User.findByPk(secondLockId, {
      transaction: t,
      ...lockOption,
    });

    if (!firstUser || !secondUser) {
      await t.rollback();
      return res.sendResponse(
        "error",
        "Error al recuperar datos de los usuarios participantes",
        null,
        500,
      );
    }

    // Asignar emisor y receptor según el ID correspondiente
    const sender = firstLockId === senderId ? firstUser : secondUser;
    const receiver = firstLockId === receiverCheck.id ? firstUser : secondUser;

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
