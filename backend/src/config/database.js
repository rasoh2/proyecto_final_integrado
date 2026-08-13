const { Sequelize } = require("sequelize");
require("dotenv").config();

if (process.env.DATABASE_URL) {
  try {
    const parsed = new URL(process.env.DATABASE_URL);
    console.log(`🔌 Conectando a base de datos via DATABASE_URL en host: ${parsed.hostname}, puerto: ${parsed.port || '5432'}, db: ${parsed.pathname}`);
  } catch (e) {
    console.log(`🔌 DATABASE_URL detectada pero falló al parsear como URL: ${e.message}`);
  }
} else {
  console.log(`🔌 Conectando usando variables individuales a host: ${process.env.DB_HOST || "localhost"}`);
}

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME || "alkewallet_db",
      process.env.DB_USER || "postgres",
      process.env.DB_PASSWORD || "admin",
      {
        host: process.env.DB_HOST || "localhost",
        dialect: "postgres",
        logging: false,
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
