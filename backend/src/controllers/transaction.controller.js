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
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { monto } = req.body;

    if (!monto || monto <= 0) {
      return res.sendResponse(
        "error",
        "El monto debe ser mayor a 0",
        null,
        400,
      );
    }

    const user = await User.findByPk(userId, { transaction: t });

    // Actualizar saldo
    user.saldo = parseFloat(user.saldo) + parseFloat(monto);
    await user.save({ transaction: t });

    // Registrar transacción (receptor es el mismo usuario, sender nulo o el mismo)
    const transaction = await Transaction.create(
      {
        monto,
        tipo: "deposito",
        receiver_id: userId,
        sender_id: userId,
      },
      { transaction: t },
    );

    await t.commit();
    res.sendResponse("success", "Depósito realizado con éxito", {
      transaction,
      nuevoSaldo: user.saldo,
    });
  } catch (error) {
    await t.rollback();
    res.sendResponse(
      "error",
      "Error al realizar el depósito",
      error.message,
      500,
    );
  }
};

// Transferir dinero a otro usuario
exports.transfer = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const senderId = req.user.id;
    const { receiver_correo, monto } = req.body;

    if (!monto || monto <= 0) {
      return res.sendResponse(
        "error",
        "El monto debe ser mayor a 0",
        null,
        400,
      );
    }

    // Buscar receptor
    let receiver = await User.findOne({
      where: { correo: receiver_correo },
      transaction: t,
    });

    // Si el usuario receptor (contacto) no existe en el sistema, lo creamos automáticamente
    // como cuenta "fantasma" para poder asignarle el dinero y completar la transferencia.
    if (!receiver) {
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash("contacto123", 10);
      receiver = await User.create(
        {
          nombre: "Contacto " + receiver_correo.split("@")[0],
          correo: receiver_correo,
          password: hashedPassword,
          saldo: 0,
        },
        { transaction: t },
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

    // Buscar emisor y verificar saldo
    const sender = await User.findByPk(senderId, { transaction: t });
    if (parseFloat(sender.saldo) < parseFloat(monto)) {
      await t.rollback();
      return res.sendResponse("error", "Fondos insuficientes", null, 400);
    }

    // Actualizar saldos
    sender.saldo = parseFloat(sender.saldo) - parseFloat(monto);
    receiver.saldo = parseFloat(receiver.saldo) + parseFloat(monto);

    await sender.save({ transaction: t });
    await receiver.save({ transaction: t });

    // Registrar transacción
    const transaction = await Transaction.create(
      {
        monto,
        tipo: "transferencia",
        sender_id: sender.id,
        receiver_id: receiver.id,
      },
      { transaction: t },
    );

    await t.commit();
    res.sendResponse("success", "Transferencia realizada con éxito", {
      transaction,
      tuNuevoSaldo: sender.saldo,
    });
  } catch (error) {
    await t.rollback();
    res.sendResponse(
      "error",
      "Error al realizar la transferencia",
      error.message,
      500,
    );
  }
};
