const { Pool } = require('pg');
require('dotenv').config();

// Configurações usando apenas variáveis de ambiente para segurança máxima
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, 
  port: process.env.DB_PORT || 5432,
});

// Exporta a função de query para ser usada no index.js
module.exports = {
  query: (text, params) => pool.query(text, params),
};