const { Sequelize } = require("sequelize");
require("dotenv").config();

const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (dbUrl) {
  try {
    const parsed = new URL(dbUrl);
    console.log(`🔌 Conectando a base de datos via URL en host: ${parsed.hostname}, puerto: ${parsed.port || '5432'}, db: ${parsed.pathname}`);
  } catch (e) {
    console.log(`🔌 URL de base de datos detectada pero falló al parsear: ${e.message}`);
  }
} else {
  console.log(`🔌 Conectando usando variables individuales a host: ${process.env.DB_HOST || "localhost"}`);
}

const isProduction = process.env.NODE_ENV === "production" || 
  (dbUrl && (dbUrl.includes("neon.tech") || dbUrl.includes("render.com")));

const sslOptions = isProduction
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  : {};

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
      dialectOptions: sslOptions,
      pool: poolConfig,
    })
  : new Sequelize(
      process.env.DB_NAME || "alkewallet_db",
      process.env.DB_USER || "postgres",
      process.env.DB_PASSWORD || "admin",
      {
        host: process.env.DB_HOST || "localhost",
        dialect: "postgres",
        logging: false,
        dialectOptions: sslOptions,
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
