const { pool, query } = require('./connection');

// Crear tablas
const initDatabase = async () => {
  try {
    // Tabla de usuarios
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        "lastName" VARCHAR(255) NOT NULL,
        token VARCHAR(255),
        "alertThreshold" DECIMAL(10,2) DEFAULT 0,
        "alertEnabled" BOOLEAN DEFAULT false,
        role VARCHAR(50) DEFAULT 'client',
        wallet DECIMAL(10,2) DEFAULT 1000,
        "currencyPreference" VARCHAR(10) DEFAULT 'USD'
      )
    `);

    // Tabla de casas de cambio
    await query(`
      CREATE TABLE IF NOT EXISTS "exchangeHouses" (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        lat DECIMAL(20,15) NOT NULL,
        lng DECIMAL(20,15) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        buy DECIMAL(10,4) NOT NULL,
        sell DECIMAL(10,4) NOT NULL,
        commission DECIMAL(10,2) DEFAULT 0,
        "minimumCapital" DECIMAL(10,2) DEFAULT 0,
        "startTime" VARCHAR(10),
        "endTime" VARCHAR(10),
        "operatingHours" VARCHAR(50)
      )
    `);

    // Tabla de tasas de cambio oficiales
    await query(`
      CREATE TABLE IF NOT EXISTS "officialExchangeRate" (
        id VARCHAR(50) PRIMARY KEY,
        date DATE NOT NULL,
        currency VARCHAR(10) NOT NULL,
        buy DECIMAL(10,4) NOT NULL,
        sell DECIMAL(10,4) NOT NULL
      )
    `);

    // Tabla de historial de tasas
    await query(`
      CREATE TABLE IF NOT EXISTS history (
        id VARCHAR(50) PRIMARY KEY,
        "exchangeHouseId" INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL,
        date DATE NOT NULL,
        buy DECIMAL(10,4) NOT NULL,
        sell DECIMAL(10,4) NOT NULL
      )
    `);

    // Tabla de transacciones
    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(50) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        time TIMESTAMP NOT NULL,
        rate DECIMAL(10,4) NOT NULL,
        "senderId" VARCHAR(50) NOT NULL,
        "receiverId" VARCHAR(50) NOT NULL,
        "exchangeHouseId" VARCHAR(255) NOT NULL
      )
    `);

    console.log('✅ Tablas creadas correctamente');
  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
    throw error;
  }
};

// Datos semilla iniciales
const seedDatabase = async () => {
  try {
    // Verificar si ya hay datos
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('ℹ️ La base de datos ya tiene datos, omitiendo seed');
      return;
    }

    // Insertar usuarios
    const users = [
      ['1', 'admin@example.com', 'admin123', 'Admin', 'User', 'abc123', 10.07, true, 'admin', 331, 'USD'],
      ['2', 'user@example.com', 'user123', 'Normal', 'User', 'def456', 7.2, false, 'client', 1158, 'USD'],
      ['3', 'sudo@gmail.com', 'StringPassword12', 'Admin2', 'User2', 'abc123', 40, true, 'admin', 761, 'USD'],
    ];

    for (const user of users) {
      await query(`
        INSERT INTO users (id, email, password, name, "lastName", token, "alertThreshold", "alertEnabled", role, wallet, "currencyPreference")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `, user);
    }

    // Insertar casas de cambio
    const exchangeHouses = [
      ['1', 'INTERNATIONAL MONEY EXCHANGE SRL', 'Edificio Monrroy y Velez, Calle 21 de Calacoto 8350, La Paz', -16.542544652364764, -68.07743199174313, 'USD', 6.8, 6.95, 0, 0, null, null, null],
      ['2', 'CASA DE CAMBIO SEVILLA', 'Calle Bolivar entre 24 de Septiembre y Calle Beni, Shopping Bolivar, Local #8, Santa Cruz de la Sierra', -17.777298383238016, -63.17904743639257, 'USD', 6.78, 6.92, 0, 0, null, null, null],
      ['3', 'Casa de cambios Armella', 'Bolivar 256, Tarija', -21.532101005998115, -64.7328731217125, 'EUR', 7.45, 7.6, 0, 0, null, null, null],
      ['4', 'Casa de cambio MAMÁ CHELA', 'Nueva Terminal de Ómnibuses de Oruro-Este, C. Campo Jordán, Oruro', -17.950289098116436, -67.09539870328555, 'USD', 6.79, 6.94, 0, 0, null, null, null],
      ['5', 'MoneyGram - Av Arce', 'CONDOMINIO TO, PLAZA ISABEL, Av. Arce 2519, La Paz', -16.506659066238573, -68.12312897400949, 'EUR', 7.44, 7.58, 0, 0, null, null, null],
      ['6', 'Casa de Cambio EFI', 'Avenida Virgen de Cotoca, Tercer Anillo Externo y, Santa Cruz de la Sierra', -17.779103105820745, -63.152066429054415, 'USD', 6.77, 6.91, 0, 0, null, null, null],
      ['7', 'Unitransfer SRL', 'Heroinas esq, España, Cochabamba', -17.39142600947302, -66.15595992128148, 'USD', 6.81, 6.96, 0, 0, null, null, null],
      ['8', 'LATIN AMERICA CAMBIOS/EXCHANGE', 'C. Avaroa, Tupiza', -21.443236896167424, -65.7193239954301, 'USD', 6.76, 6.9, 0, 0, null, null, null],
      ['9', 'COOPERATIVA EL BUEN SAMARITANO LTDA.', 'PASAJE BOULEVARD S/N, ENTRE CALLE HOYOS Y LINARES, Padilla S/N, Potosí', -19.58789060065141, -65.75278638196373, 'EUR', 7.42, 7.57, 0, 0, null, null, null],
      ['10', 'Cooperativa de ahorro y crédito abierta Trinidad CACTRI R.L.', 'Calle Cochabamba esq. Manuel Limpias Nº 100, Calle Cochabamba, Trinidad', -14.834374886108538, -64.90183966787761, 'USD', 6.79, 6.93, 0, 0, null, null, null],
    ];

    for (const house of exchangeHouses) {
      await query(`
        INSERT INTO "exchangeHouses" (id, name, address, lat, lng, currency, buy, sell, commission, "minimumCapital", "startTime", "endTime", "operatingHours")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING
      `, house);
    }

    // Insertar tasas de cambio oficiales
    const officialRates = [
      ['1', '2025-05-30', 'USD', 6.86, 6.96],
      ['2', '2025-05-30', 'EUR', 7.4, 7.55],
      ['3', '2025-05-31', 'USD', 6.87, 6.97],
      ['4', '2025-05-31', 'EUR', 7.41, 7.56],
    ];

    for (const rate of officialRates) {
      await query(`
        INSERT INTO "officialExchangeRate" (id, date, currency, buy, sell)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, rate);
    }

    // Insertar historial
    const historyData = [
      ['1', 1, 'USD', '2025-05-25', 6.8, 6.95],
      ['2', 1, 'USD', '2025-05-26', 6.81, 6.96],
      ['3', 1, 'USD', '2025-05-27', 6.79, 6.94],
      ['4', 1, 'USD', '2025-05-28', 6.82, 6.97],
      ['5', 1, 'USD', '2025-05-29', 6.83, 6.98],
      ['6', 1, 'USD', '2025-05-30', 6.84, 6.99],
      ['7', 1, 'USD', '2025-05-31', 6.85, 7.0],
      ['8', 1, 'USD', '2025-06-01', 6.86, 7.01],
      ['9', 1, 'USD', '2025-06-02', 6.87, 7.02],
      ['10', 1, 'USD', '2025-06-03', 6.88, 7.03],
      ['11', 1, 'USD', '2025-06-04', 6.89, 7.04],
      ['12', 1, 'USD', '2025-06-05', 6.9, 7.05],
    ];

    for (const h of historyData) {
      await query(`
        INSERT INTO history (id, "exchangeHouseId", currency, date, buy, sell)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, h);
    }

    // Insertar transacciones de ejemplo
    const transactions = [
      ['1', 100, 'Compra', 'USD', '2025-06-15T12:00:00Z', 8.23, '1', '2', 'Casa ACME'],
      ['2', 50, 'Venta', 'USD', '2025-06-15T14:00:00Z', 9.23, '2', '1', 'Casa de cambios Armella'],
    ];

    for (const t of transactions) {
      await query(`
        INSERT INTO transactions (id, amount, type, currency, time, rate, "senderId", "receiverId", "exchangeHouseId")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, t);
    }

    console.log('✅ Datos semilla insertados correctamente');
  } catch (error) {
    console.error('❌ Error al insertar datos semilla:', error);
    throw error;
  }
};

// Ejecutar inicialización
const init = async () => {
  try {
    await initDatabase();
    await seedDatabase();
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error en inicialización:', error);
    process.exit(1);
  }
};

// Si se ejecuta directamente
if (require.main === module) {
  init().then(() => process.exit(0));
}

module.exports = { initDatabase, seedDatabase, init };
