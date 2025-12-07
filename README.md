# Exchange Backend

Backend Express con PostgreSQL (AWS RDS) para el sistema de casas de cambio.

## Requisitos

- Node.js >= 16
- npm
- PostgreSQL (local o AWS RDS)

## Instalación

```bash
cd back
npm install
```

## Configuración

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=3001

# PostgreSQL RDS Configuration
DATABASE_URL=postgresql://postgres:tu_password@tu-endpoint-rds.region.rds.amazonaws.com:5432/exchange_db
```

## Crear Base de Datos en AWS RDS

### Paso 1: Acceder a RDS
1. Ve a la consola de AWS: https://console.aws.amazon.com/rds
2. Click en "Create database"

### Paso 2: Configuración de la instancia
1. **Engine**: PostgreSQL
2. **Version**: PostgreSQL 15.x (o la más reciente)
3. **Template**: Free tier (para desarrollo)
4. **DB instance identifier**: `exchange-db`
5. **Master username**: `postgres`
6. **Master password**: (elige una contraseña segura)

### Paso 3: Configuración de conectividad
1. **VPC**: Default VPC
2. **Public access**: **Yes** (importante para conectar desde fuera de AWS)
3. **VPC security group**: Create new o usar existente
4. **Database port**: 5432

### Paso 4: Configuración adicional
1. **Initial database name**: `exchange_db`
2. **Backup retention**: 0 días (para ahorrar en free tier)
3. **Enable deletion protection**: No (para desarrollo)

### Paso 5: Security Group
Después de crear la instancia, configura el Security Group:
1. Ve a EC2 > Security Groups
2. Encuentra el SG de tu RDS
3. Edita Inbound rules
4. Agrega regla: **PostgreSQL (5432)** desde **0.0.0.0/0** (o tu IP específica)

### Paso 6: Obtener endpoint
1. Una vez creada, ve a RDS > Databases > tu-instancia
2. Copia el **Endpoint** (ej: `exchange-db.xxxxx.us-east-1.rds.amazonaws.com`)

### Paso 7: Actualizar .env
```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@exchange-db.xxxxx.us-east-1.rds.amazonaws.com:5432/exchange_db
```

## Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## Inicializar Base de Datos

La base de datos se inicializa automáticamente al iniciar el servidor. Si deseas reinicializar:

```bash
npm run init-db
```

## Endpoints API

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario

### Usuarios
- `GET /users` - Obtener todos los usuarios
- `GET /users/:id` - Obtener usuario por ID
- `POST /users` - Crear usuario
- `PUT /users/:id` - Actualizar usuario completo
- `PATCH /users/:id` - Actualizar usuario parcialmente
- `DELETE /users/:id` - Eliminar usuario

### Casas de Cambio
- `GET /exchangeHouses` - Obtener todas las casas de cambio
- `GET /exchangeHouses?currency=USD` - Filtrar por moneda
- `GET /exchangeHouses/:id` - Obtener casa de cambio por ID
- `POST /exchangeHouses` - Crear casa de cambio
- `PUT /exchangeHouses/:id` - Actualizar casa de cambio
- `PATCH /exchangeHouses/:id` - Actualizar parcialmente
- `DELETE /exchangeHouses/:id` - Eliminar casa de cambio

### Tasas de Cambio Oficiales
- `GET /officialExchangeRate` - Obtener todas las tasas
- `GET /officialExchangeRate?currency=USD&_sort=date&_order=desc&_limit=1` - Filtros
- `GET /officialExchangeRate/:id` - Obtener tasa por ID
- `POST /officialExchangeRate` - Crear tasa
- `PUT /officialExchangeRate/:id` - Actualizar tasa
- `DELETE /officialExchangeRate/:id` - Eliminar tasa

### Historial de Tasas
- `GET /history` - Obtener todo el historial
- `GET /history?exchangeHouseId=1` - Filtrar por casa de cambio
- `GET /history?currency=USD&_sort=date&_order=asc` - Filtros
- `GET /history/:id` - Obtener registro por ID
- `POST /history` - Crear registro
- `PUT /history/:id` - Actualizar registro
- `DELETE /history/:id` - Eliminar registro

### Transacciones
- `GET /transactions` - Obtener todas las transacciones
- `GET /transactions?senderId=1` - Filtrar por remitente
- `GET /transactions/:id` - Obtener transacción por ID
- `POST /transactions` - Crear transacción
- `PUT /transactions/:id` - Actualizar transacción
- `DELETE /transactions/:id` - Eliminar transacción

### Health Check
- `GET /health` - Verificar estado del servidor

## Estructura del Proyecto

```
back/
├── src/
│   ├── database/
│   │   ├── connection.js   # Pool de conexiones PostgreSQL
│   │   └── init.js         # Inicialización y datos semilla
│   ├── routes/
│   │   ├── auth.js         # Rutas de autenticación
│   │   ├── users.js        # Rutas de usuarios
│   │   ├── exchangeHouses.js
│   │   ├── officialExchangeRate.js
│   │   ├── history.js
│   │   └── transactions.js
│   └── index.js            # Punto de entrada
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Deploy en Render/Railway/Heroku

El backend está listo para deploy. Solo necesitas:
1. Conectar tu repositorio
2. Configurar la variable de entorno `DATABASE_URL`
3. El comando de inicio es `npm start`
