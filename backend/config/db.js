const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  dateStrings: true
};

// Primeiro criamos a conexão
const pool = mysql.createPool(dbConfig);

// DEPOIS testamos a conexão usando a variável 'pool' que acabamos de criar
pool.getConnection()
  .then(conn => {
    console.log("✅ Conectado ao banco de dados na AWS!");
    conn.release();
  })
  .catch(err => {
    console.error("❌ ERRO DETALHADO DE CONEXÃO:");
    console.error("Código:", err.code); 
    console.error("Mensagem:", err.message);
    console.error("Verifique se o IP", process.env.DB_HOST, "está correto e acessível.");
  });

module.exports = pool;