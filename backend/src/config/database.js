const { Sequelize } = require("sequelize");
require("dotenv").config();

let dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (dbUrl) {
  try {
    const urlObj = new URL(dbUrl);
    // Eliminar parámetros de consulta incompatibles con el driver nativo de postgres pg
    if (urlObj.searchParams.has("channel_binding")) {
      urlObj.searchParams.delete("channel_binding");
    }
    dbUrl = urlObj.toString();
    console.log(`🔌 Conectando a base de datos via URL en host: ${urlObj.hostname}, puerto: ${urlObj.port || '5432'}, db: ${urlObj.pathname}`);
  } catch (e) {
    console.log(`🔌 Error al parsear URL de conexión estructurada: ${e.message}. Aplicando fallback regex.`);
    dbUrl = dbUrl.replace(/([?&])channel_binding=[^&]*(&|$)/, '$1').replace(/[?&]$/, '');
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
    if (sequelize && sequelize.config) {
      const { host, port, database, username } = sequelize.config;
      console.error(`🔌 Detalle del intento de conexión - Host: ${host || 'no especificado'}, Puerto: ${port || 'no especificado'}, DB: ${database || 'no especificado'}, Usuario: ${username || 'no especificado'}`);
    }
  }
};

testConnection();

module.exports = sequelize;
