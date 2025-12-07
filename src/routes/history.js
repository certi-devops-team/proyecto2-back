const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// Generar ID simple
const generateId = () => {
  return Math.random().toString(16).substring(2, 6);
};

// GET /history - Obtener historial de tasas
router.get('/', async (req, res) => {
  try {
    const { exchangeHouseId, currency, _sort, _order } = req.query;
    
    let sql = 'SELECT * FROM history WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (exchangeHouseId) {
      sql += ` AND "exchangeHouseId" = $${paramCount}`;
      params.push(exchangeHouseId);
      paramCount++;
    }
    
    if (currency) {
      sql += ` AND currency = $${paramCount}`;
      params.push(currency);
      paramCount++;
    }
    
    if (_sort) {
      const order = _order === 'desc' ? 'DESC' : 'ASC';
      sql += ` ORDER BY ${_sort} ${order}`;
    }
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /history/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM history WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /history - Crear registro de historial
router.post('/', async (req, res) => {
  try {
    const { exchangeHouseId, currency, date, buy, sell } = req.body;
    
    const id = generateId();
    
    await query(`
      INSERT INTO history (id, "exchangeHouseId", currency, date, buy, sell)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, exchangeHouseId, currency, date, buy, sell]);
    
    const result = await query('SELECT * FROM history WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /history/:id
router.put('/:id', async (req, res) => {
  try {
    const { exchangeHouseId, currency, date, buy, sell } = req.body;
    
    await query(`
      UPDATE history SET "exchangeHouseId" = $1, currency = $2, date = $3, buy = $4, sell = $5
      WHERE id = $6
    `, [exchangeHouseId, currency, date, buy, sell, req.params.id]);
    
    const result = await query('SELECT * FROM history WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /history/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM history WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    await query('DELETE FROM history WHERE id = $1', [req.params.id]);
    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
