const { Pool } = require("pg");
require("dotenv").config();

// Configuración del pool de conexiones PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

// Verificar conexión
pool.on("connect", () => {
  console.log("✅ Conectado a PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Error en conexión PostgreSQL:", err);
});

// Función helper para queries
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== "production") {
    console.log("Query ejecutada", {
      text: text.substring(0, 50),
      duration,
      rows: res.rowCount,
    });
  }
  return res;
};

module.exports = { pool, query };
