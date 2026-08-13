const ContactoTransferencia = require("../models/ContactoTransferencia");

// Crear contacto
exports.crearContacto = async (req, res) => {
  try {
    const { nombre, apellido, alias, banco, numeroCuenta, correo } = req.body;
    const usuarioId = req.user.id; // Obtenido del token autenticado

    // Validar campos obligatorios
    if (!nombre || !apellido || !alias || !banco || !numeroCuenta || !correo) {
      return res.sendResponse("error", "Todos los campos son obligatorios (nombre, apellido, alias, banco, numeroCuenta, correo)", null, 400);
    }

    const contacto = await ContactoTransferencia.create({
      nombre,
      apellido,
      alias,
      banco,
      numeroCuenta,
      correo,
      usuarioId,
    });

    return res.sendResponse("success", "Contacto de transferencia guardado con éxito", contacto, 201);
  } catch (error) {
    console.error("❌ Error al guardar el contacto:", error);
    return res.sendResponse("error", "Error al guardar el contacto", error.message, 500);
  }
};

// Obtener contactos del usuario logueado
exports.obtenerContactos = async (req, res) => {
  try {
    const usuarioId = req.user.id; // Obtenido del token autenticado (evita IDOR)

    const contactos = await ContactoTransferencia.findAll({
      where: { usuarioId },
      order: [["createdAt", "DESC"]],
    });

    return res.sendResponse("success", "Contactos de transferencia recuperados con éxito", contactos);
  } catch (error) {
    console.error("❌ Error al obtener los contactos:", error);
    return res.sendResponse("error", "Error al obtener los contactos", error.message, 500);
  }
};
