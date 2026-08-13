const ContactoTransferencia = require("../models/ContactoTransferencia");

// Crear contacto
exports.crearContacto = async (req, res) => {
  try {
    const contacto = await ContactoTransferencia.create(req.body);
    res.json({ status: "success", data: contacto });
  } catch (error) {
    console.error("Error al guardar el contacto:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Obtener contactos por usuarioId
exports.obtenerContactos = async (req, res) => {
  try {
    const { usuarioId } = req.query;
    const contactos = await ContactoTransferencia.findAll({
      where: { usuarioId },
    });
    res.json({ status: "success", data: contactos });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
