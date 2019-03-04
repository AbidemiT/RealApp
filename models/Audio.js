const Sequelize = require('sequelize');
const db = require('../config/database');

const Audio = db.define('audio', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  filename: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Audio;