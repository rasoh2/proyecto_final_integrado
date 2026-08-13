const { Sequelize } = require("sequelize");
require("dotenv").config();

let dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (dbUrl) {
  // Limpiar channel_binding si está presente para evitar problemas de compatibilidad con el driver 'pg'
  if (dbUrl.includes("channel_binding=")) {
    try {
      const urlObj = new URL(dbUrl);
      urlObj.searchParams.delete("channel_binding");
      dbUrl = urlObj.toString();
    } catch (e) {
      dbUrl = dbUrl.replace(/[?&]channel_binding=[^&]*/g, "");
    }
  }

  try {
    const parsed = new URL(dbUrl);
    console.log(`🔌 Conectando a base de datos via URL en host: ${parsed.hostname}, puerto: ${parsed.port || '5432'}, db: ${parsed.pathname}`);
  } catch (e) {
    console.log(`🔌 URL de base de datos detectada pero falló al parsear: ${e.message}`);
  }
} else {
  console.log(`🔌 Conectando usando variables individuales a host: ${process.env.DB_HOST || "127.0.0.1"}`);
}

const poolConfig = {
  max: 5, // Límite de conexiones en el pool para no saturar Neon/Render en planes gratuitos
  min: 0,
  acquire: 30000,
  idle: 10000,
};

const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      pool: poolConfig,
    })
  : new Sequelize(
      process.env.DB_NAME || "alkewallet_db",
      process.env.DB_USER || "postgres",
      process.env.DB_PASSWORD || "admin",
      {
        host: process.env.DB_HOST || "127.0.0.1",
        port: process.env.DB_PORT || 5432,
        dialect: "postgres",
        logging: false,
        pool: poolConfig,
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
