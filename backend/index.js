require("dotenv").config();

// Validar variables de entorno críticas en el inicio para evitar fallas silenciosas en producción
const REQUIRED_ENV_VARS = ["JWT_SECRET"];
if (!process.env.NEON_DATABASE_URL && !process.env.DATABASE_URL) {
  REQUIRED_ENV_VARS.push("DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST");
}
REQUIRED_ENV_VARS.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ ERROR DE CONFIGURACIÓN: La variable de entorno '${varName}' es obligatoria.`);
    process.exit(1);
  }
});
const express = require("express");
const cors = require("cors");
const path = require("path");
const sequelize = require("./src/config/database");

// Importaremos los modelos para que Sequelize detecte las tablas
const User = require("./src/models/User");
const Transaction = require("./src/models/Transaction");
const ContactoTransferencia = require("./src/models/ContactoTransferencia");
// Importar rutas
const userRoutes = require("./src/routes/user.routes");
const transactionRoutes = require("./src/routes/transaction.routes");
const contactoTransferenciaRoutes = require("./src/routes/contactoTransferencia.routes");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Directorio público para las imágenes subidas por multer
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware estandarizador de respuestas JSON
app.use((req, res, next) => {
  res.sendResponse = (status, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
      status, // 'success' o 'error'
      message,
      data,
    });
  };
  next();
});

// Ruta pública de prueba
app.get("/", (req, res) => {
  res.sendResponse("success", "Bienvenido a la API REST de AlkeWallet Backend");
});
// Registrar Rutas de API
app.use("/api/v1/usuarios", userRoutes);
app.use("/api/v1/transacciones", transactionRoutes);
app.use("/api/v1/contactos-transferencia", contactoTransferenciaRoutes);
// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  res.sendResponse("error", "Ruta no encontrada", null, 404);
});

// Middleware global para el manejo de excepciones y errores no controlados
app.use((err, req, res, next) => {
  console.error("❌ Error no controlado detectado:", err);

  if (err instanceof require('multer').MulterError) {
    return res.sendResponse("error", `Error de subida de archivo: ${err.message}`, null, 400);
  }

  return res.sendResponse(
    "error",
    "Ha ocurrido un error interno en el servidor",
    process.env.NODE_ENV === "development" ? err.message : null,
    500
  );
});

// Iniciar servidor y sincronizar base de datos
const startServer = async () => {
  try {
    // alter: true solo en desarrollo para evitar bloqueos y riesgos en producción (Render/Neon)
    const isDev = process.env.NODE_ENV === "development";
    await sequelize.sync({ alter: isDev });
    console.log(`✅ Modelos sincronizados con la Base de Datos (alter: ${isDev}).`);

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error general al iniciar servidor:", error);
  }
};

startServer();
