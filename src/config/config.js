require('dotenv').config();

module.exports = {
  development:{
    username: process.env.DB_USER,
    username: process.env.DB_PASS,
    username: process.env.DB_NAME,
    username: process.env.DB_HOST,
    username: process.env.DB_USER,
    dialect: 'mysql',
    dialectOptions: {decimalNumbers: true},
    define: {underscored: true}
  }
}
