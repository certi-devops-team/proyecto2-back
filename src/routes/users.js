const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// GET /users - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const { email, password } = req.query;
    
    let result;
    if (email && password) {
      result = await query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    } else {
      result = await query('SELECT * FROM users');
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /users/:id - Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /users - Crear usuario
router.post('/', async (req, res) => {
  try {
    const { email, password, name, lastName, token, alertThreshold = 0, alertEnabled = false, role = 'client', wallet = 1000 } = req.body;
    
    const id = Math.random().toString(16).substring(2, 6);
    
    await query(`
      INSERT INTO users (id, email, password, name, "lastName", token, "alertThreshold", "alertEnabled", role, wallet)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [id, email, password, name, lastName, token, alertThreshold, alertEnabled, role, wallet]);
    
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /users/:id - Actualizar usuario completo
router.put('/:id', async (req, res) => {
  try {
    const { email, password, name, lastName, token, alertThreshold, alertEnabled, role, wallet, currencyPreference } = req.body;
    
    await query(`
      UPDATE users 
      SET email = $1, password = $2, name = $3, "lastName" = $4, token = $5, 
          "alertThreshold" = $6, "alertEnabled" = $7, role = $8, wallet = $9, "currencyPreference" = $10
      WHERE id = $11
    `, [email, password, name, lastName, token, alertThreshold, alertEnabled, role, wallet, currencyPreference, req.params.id]);
    
    const result = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PATCH /users/:id - Actualizar usuario parcialmente
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      // Mapear nombres de campos a nombres de columnas con comillas si es necesario
      const columnName = ['lastName', 'alertThreshold', 'alertEnabled', 'currencyPreference'].includes(key) 
        ? `"${key}"` 
        : key;
      fields.push(`${columnName} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }
    
    values.push(req.params.id);
    
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}`, values);
    
    const result = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /users/:id - Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
