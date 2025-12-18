const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const exchangeHousesRoutes = require('./routes/exchangeHouses');
const officialExchangeRateRoutes = require('./routes/officialExchangeRate');
const historyRoutes = require('./routes/history');
const transactionsRoutes = require('./routes/transactions');

// Inicializar base de datos
const { init } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/exchangeHouses', exchangeHousesRoutes);
app.use('/officialExchangeRate', officialExchangeRateRoutes);
app.use('/history', historyRoutes);
app.use('/transactions', transactionsRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Endpoint de métricas para Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP backend_status Backend health status
# TYPE backend_status gauge
backend_status 1

# HELP backend_uptime_seconds Backend uptime in seconds
# TYPE backend_uptime_seconds counter
backend_uptime_seconds ${process.uptime()}
`);
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicializar DB y luego iniciar servidor
init().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Error al inicializar la base de datos:', err);
  process.exit(1);
});
