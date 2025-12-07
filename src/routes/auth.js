const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// Generar token simple
const generateToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Generar ID simple
const generateId = () => {
  return Math.random().toString(16).substring(2, 6);
};

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    res.json(user);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, lastName, role = 'client' } = req.body;
    
    // Verificar si el email ya existe
    const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const id = generateId();
    const token = generateToken();
    
    await query(`
      INSERT INTO users (id, email, password, name, "lastName", token, "alertThreshold", "alertEnabled", role, wallet)
      VALUES ($1, $2, $3, $4, $5, $6, 0, false, $7, 1000)
    `, [id, email, password, name, lastName, token, role]);
    
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
