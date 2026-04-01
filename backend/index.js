require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const sequelize = require("./src/config/database");

// Importaremos los modelos para que Sequelize detecte las tablas
const User = require("./src/models/User");
const Transaction = require("./src/models/Transaction");
// Importar rutas
const userRoutes = require('./src/routes/user.routes');
const transactionRoutes = require('./src/routes/transaction.routes');
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
app.use('/api/v1/usuarios', userRoutes);
app.use('/api/v1/transacciones', transactionRoutes);
// Iniciar servidor y sincronizar base de datos
const startServer = async () => {
  try {
    // alter: true actualiza la estructura de la base de datos sin borrar registros
    await sequelize.sync({ alter: true });
    console.log("✅ Modelos sincronizados con la Base de Datos.");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error general al iniciar servidor:", error);
  }
};

startServer();
