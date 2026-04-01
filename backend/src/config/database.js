const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "alkewallet_db",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "admin",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false, // Ocultar queries SQL en terminal por limpieza
  },
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a PostgreSQL establecida con éxito.");
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
  }
};

testConnection();

module.exports = sequelize;
