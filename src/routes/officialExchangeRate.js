const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// Generar ID simple
const generateId = () => {
  return Math.random().toString(16).substring(2, 6);
};

// GET /officialExchangeRate - Obtener tasas oficiales
router.get('/', async (req, res) => {
  try {
    const { currency, _sort, _order, _limit } = req.query;
    
    let sql = 'SELECT * FROM "officialExchangeRate"';
    const params = [];
    let paramCount = 1;
    
    if (currency) {
      sql += ` WHERE currency = $${paramCount}`;
      params.push(currency);
      paramCount++;
    }
    
    if (_sort) {
      const order = _order === 'desc' ? 'DESC' : 'ASC';
      sql += ` ORDER BY ${_sort} ${order}`;
    }
    
    if (_limit) {
      sql += ` LIMIT ${parseInt(_limit)}`;
    }
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tasas oficiales:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /officialExchangeRate/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM "officialExchangeRate" WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tasa no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener tasa:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /officialExchangeRate - Crear tasa oficial
router.post('/', async (req, res) => {
  try {
    const { date, currency, buy, sell } = req.body;
    
    const id = generateId();
    
    await query(`
      INSERT INTO "officialExchangeRate" (id, date, currency, buy, sell)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, date, currency, buy, sell]);
    
    const result = await query('SELECT * FROM "officialExchangeRate" WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear tasa oficial:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /officialExchangeRate/:id
router.put('/:id', async (req, res) => {
  try {
    const { date, currency, buy, sell } = req.body;
    
    await query(`
      UPDATE "officialExchangeRate" SET date = $1, currency = $2, buy = $3, sell = $4
      WHERE id = $5
    `, [date, currency, buy, sell, req.params.id]);
    
    const result = await query('SELECT * FROM "officialExchangeRate" WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tasa no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar tasa:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /officialExchangeRate/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM "officialExchangeRate" WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tasa no encontrada' });
    }
    
    await query('DELETE FROM "officialExchangeRate" WHERE id = $1', [req.params.id]);
    res.json({ message: 'Tasa eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar tasa:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
