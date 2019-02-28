const Sequelize = require('sequelize');
const db = new Sequelize('realappdb', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,
});


module.exports = db;