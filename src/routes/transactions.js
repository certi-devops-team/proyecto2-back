const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// Generar ID simple
const generateId = () => {
  return Math.random().toString(16).substring(2, 6);
};

// GET /transactions - Obtener todas las transacciones
router.get('/', async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;
    
    let sql = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (senderId) {
      sql += ` AND "senderId" = $${paramCount}`;
      params.push(senderId);
      paramCount++;
    }
    
    if (receiverId) {
      sql += ` AND "receiverId" = $${paramCount}`;
      params.push(receiverId);
      paramCount++;
    }
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /transactions/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener transacción:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /transactions - Crear transacción
router.post('/', async (req, res) => {
  try {
    const { amount, type, currency, time, rate, senderId, receiverId, exchangeHouseId } = req.body;
    
    const id = generateId();
    const transactionTime = time || new Date().toISOString();
    
    await query(`
      INSERT INTO transactions (id, amount, type, currency, time, rate, "senderId", "receiverId", "exchangeHouseId")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [id, amount, type, currency, transactionTime, rate, senderId, receiverId, exchangeHouseId]);
    
    const result = await query('SELECT * FROM transactions WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear transacción:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const { amount, type, currency, time, rate, senderId, receiverId, exchangeHouseId } = req.body;
    
    await query(`
      UPDATE transactions 
      SET amount = $1, type = $2, currency = $3, time = $4, rate = $5, "senderId" = $6, "receiverId" = $7, "exchangeHouseId" = $8
      WHERE id = $9
    `, [amount, type, currency, time, rate, senderId, receiverId, exchangeHouseId, req.params.id]);
    
    const result = await query('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    
    await query('DELETE FROM transactions WHERE id = $1', [req.params.id]);
    res.json({ message: 'Transacción eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
