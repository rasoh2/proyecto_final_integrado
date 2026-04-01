const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User"); // Importamos a User para forzar la relación

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Las llaves foráneas 'sender_id' y 'receiver_id' serán añadidas automáticamente por la relación
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM("deposito", "transferencia", "retiro"),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "transactions",
  },
);

// Relación de transacciones enviadas
User.hasMany(Transaction, { foreignKey: "sender_id", as: "sentTransactions" });
Transaction.belongsTo(User, { foreignKey: "sender_id", as: "sender" });

// Relación de transacciones recibidas
User.hasMany(Transaction, {
  foreignKey: "receiver_id",
  as: "receivedTransactions",
});
Transaction.belongsTo(User, { foreignKey: "receiver_id", as: "receiver" });

module.exports = Transaction;
