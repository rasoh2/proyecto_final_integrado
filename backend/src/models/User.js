const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    saldo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 100000.0, // Todo usuario arranca con 100,000 de saldo a nivel DB
    },
    avatar: {
      type: DataTypes.STRING, // Será la ruta de archivo para Multer (ej: 'uploads/file123.jpg')
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "users",
  },
);

module.exports = User;
