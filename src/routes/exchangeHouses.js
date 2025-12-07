const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// Generar ID simple
const generateId = () => {
  return Math.random().toString(16).substring(2, 6);
};

// GET /exchangeHouses - Obtener todas las casas de cambio
router.get('/', async (req, res) => {
  try {
    const { currency } = req.query;
    
    let result;
    if (currency) {
      result = await query('SELECT * FROM "exchangeHouses" WHERE currency = $1', [currency]);
    } else {
      result = await query('SELECT * FROM "exchangeHouses"');
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener casas de cambio:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /exchangeHouses/:id - Obtener casa de cambio por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM "exchangeHouses" WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Casa de cambio no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener casa de cambio:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /exchangeHouses - Crear casa de cambio
router.post('/', async (req, res) => {
  try {
    const { name, address, lat, lng, currency, buy, sell, commission = 0, minimumCapital = 0, startTime, endTime, operatingHours } = req.body;
    
    const id = generateId();
    
    await query(`
      INSERT INTO "exchangeHouses" (id, name, address, lat, lng, currency, buy, sell, commission, "minimumCapital", "startTime", "endTime", "operatingHours")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [id, name, address, lat, lng, currency, buy, sell, commission, minimumCapital, startTime, endTime, operatingHours]);
    
    const result = await query('SELECT * FROM "exchangeHouses" WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear casa de cambio:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /exchangeHouses/:id - Actualizar casa de cambio
router.put('/:id', async (req, res) => {
  try {
    const { name, address, lat, lng, currency, buy, sell, commission = 0, minimumCapital = 0, startTime, endTime, operatingHours } = req.body;
    
    await query(`
      UPDATE "exchangeHouses" 
      SET name = $1, address = $2, lat = $3, lng = $4, currency = $5, buy = $6, sell = $7, 
          commission = $8, "minimumCapital" = $9, "startTime" = $10, "endTime" = $11, "operatingHours" = $12
      WHERE id = $13
    `, [name, address, lat, lng, currency, buy, sell, commission, minimumCapital, startTime, endTime, operatingHours, req.params.id]);
    
    const result = await query('SELECT * FROM "exchangeHouses" WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Casa de cambio no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar casa de cambio:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PATCH /exchangeHouses/:id - Actualizar parcialmente
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      const columnName = ['minimumCapital', 'startTime', 'endTime', 'operatingHours'].includes(key) 
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
    
    await query(`UPDATE "exchangeHouses" SET ${fields.join(', ')} WHERE id = $${paramCount}`, values);
    
    const result = await query('SELECT * FROM "exchangeHouses" WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Casa de cambio no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar casa de cambio:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /exchangeHouses/:id - Eliminar casa de cambio
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM "exchangeHouses" WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Casa de cambio no encontrada' });
    }
    
    await query('DELETE FROM "exchangeHouses" WHERE id = $1', [req.params.id]);
    res.json({ message: 'Casa de cambio eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar casa de cambio:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
