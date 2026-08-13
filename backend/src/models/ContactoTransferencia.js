const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');

const ContactoTransferencia = sequelize.define('ContactoTransferencia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  alias: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  banco: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numeroCuenta: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'contacto_transferencia',
  timestamps: true,
});

// Relación con el modelo User
User.hasMany(ContactoTransferencia, { foreignKey: 'usuarioId', as: 'contactos' });
ContactoTransferencia.belongsTo(User, { foreignKey: 'usuarioId', as: 'usuario' });

module.exports = ContactoTransferencia;
