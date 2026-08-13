# 🔧 Alke Wallet - Backend API

**API RESTful para Gestión de Billetera Digital | Express.js + PostgreSQL**

---

## 📋 Descripción General

Alke Wallet Backend es una API RESTful robusta desarrollada con Express.js que gestiona todas las operaciones de la plataforma de billetera digital. Implementa autenticación segura, validaciones de negocio y operaciones financieras complejas con persistencia en base de datos PostgreSQL.

Desarrollada como proyecto final del Bootcamp SENCE 2025, demuestra competencias en desarrollo backend, seguridad, y arquitectura escalable.

---

## ✨ Características Principales

- 🔐 **Autenticación JWT** - Tokens seguros con expiración
- 👤 **Gestión de Usuarios** - Registro, login y perfil
- 💰 **Sistema de Transacciones** - Depósitos y transferencias
- 👨‍👩‍👧 **Gestión de Contactos** - Agregar y listar contactos de transferencia
- 📊 **Historial Completo** - Registros detallados de operaciones
- 🔒 **Validaciones de Seguridad** - Encriptación y protección de datos
- ⚡ **Middleware Personalizado** - Autenticación y manejo de archivos
- 📈 **Arquitectura MVC** - Separación clara de responsabilidades
- 🗄️ **ORM Sequelize** - Gestión de base de datos
- 🛡️ **CORS Habilitado** - Seguridad en peticiones cross-origin

---

## 🛠️ Stack Tecnológico

| Tecnología     | Versión | Uso                      |
| -------------- | ------- | ------------------------ |
| **Node.js**    | 14+     | Runtime                  |
| **Express.js** | 4.19.2  | Framework web            |
| **PostgreSQL** | -       | Base de datos relacional |
| **Sequelize**  | 6.37.3  | ORM                      |
| **JWT**        | 9.0.2   | Autenticación            |
| **Bcrypt**     | 5.1.1   | Hash de contraseñas      |
| **CORS**       | 2.8.5   | Manejo de CORS           |
| **Multer**     | 1.4.5   | Carga de archivos        |
| **Dotenv**     | 16.4.5  | Variables de entorno     |

---

## 📁 Estructura del Proyecto

```
backend/
├── index.js                    # Punto de entrada
├── package.json                # Dependencias y scripts
├── package-lock.json           # Lock de dependencias
├── .env.example                # Variables de entorno (ejemplo)
├── .gitignore                  # Archivos ignorados
│
├── src/
│   ├── config/
│   │   └── database.js         # Configuración BD + Sequelize
│   │
│   ├── models/
│   │   ├── User.js             # Modelo Usuario
│   │   ├── Transaction.js      # Modelo Transacción
│   │   └── ContactoTransferencia.js  # Modelo Contacto
│   │
│   ├── controllers/
│   │   ├── user.controller.js           # Lógica de usuarios
│   │   ├── transaction.controller.js    # Lógica de transacciones
│   │   └── contactoTransferencia.controller.js  # Lógica de contactos
│   │
│   ├── routes/
│   │   ├── user.routes.js               # Rutas de usuarios
│   │   ├── transaction.routes.js        # Rutas de transacciones
│   │   └── contactoTransferencia.routes.js  # Rutas de contactos
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js   # Validación de JWT
│   │   └── upload.middleware.js # Manejo de carga de archivos
│   │
│   └── helpers/
│       └── [utilidades compartidas]
│
└── uploads/                    # Directorio de archivos subidos
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** v14.0.0 o superior
- **npm** o **yarn**
- **PostgreSQL** 12+ instalado y en ejecución
- **Postman** o **curl** para testing de API

### Paso 1: Instalación de Dependencias

```bash
cd backend
npm install
```

### Paso 2: Configuración de Variables de Entorno

Crear archivo `.env` en la raíz del backend:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alke_wallet_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# Servidor
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:8000,http://localhost:3000

# Archivos
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Paso 3: Crear Base de Datos

```bash
# Acceder a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE alke_wallet_db;
```

### Paso 4: Ejecutar Migraciones

```bash
# Si hay archivo de migraciones
npm run migrate

# O sincronizar modelos con BD
npm run sync-db
```

### Paso 5: Iniciar Servidor

```bash
# Desarrollo con nodemon
npm run dev

# Producción
npm start
```

Servidor ejecutándose en: `http://localhost:5000`

---

## 🔌 Documentación de API

### Autenticación

Todos los endpoints protegidos requieren token JWT en el header:

```javascript
Authorization: Bearer <token_jwt>
```

---

### 👤 Endpoints de Usuarios

#### Registro

```
POST /users/register

Body:
{
  "email": "user@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "password": "password123"
}

Response: 201
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "Juan",
  "token": "eyJhbGc..."
}
```

#### Login

```
POST /users/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "Juan",
  "token": "eyJhbGc...",
  "balance": 5000
}
```

#### Obtener Perfil

```
GET /users/profile
Header: Authorization: Bearer <token>

Response: 200
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "balance": 5000,
  "created_at": "2024-03-20T10:00:00Z"
}
```

#### Listar Usuarios

```
GET /users
Header: Authorization: Bearer <token>

Response: 200
[
  {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Juan"
  }
]
```

---

### 💰 Endpoints de Transacciones

#### Realizar Depósito

```
POST /transactions/deposit
Header: Authorization: Bearer <token>

Body:
{
  "amount": 500,
  "description": "Depósito inicial"
}

Response: 201
{
  "id": 1,
  "user_id": 1,
  "type": "deposit",
  "amount": 500,
  "description": "Depósito inicial",
  "date": "2024-03-20T10:00:00Z",
  "balance_after": 5500
}
```

#### Realizar Transferencia

```
POST /transactions/transfer
Header: Authorization: Bearer <token>

Body:
{
  "recipient_email": "maria@example.com",
  "amount": 100,
  "description": "Pago de almuerzo"
}

Response: 201
{
  "id": 2,
  "from_user_id": 1,
  "to_user_id": 2,
  "type": "transfer",
  "amount": 100,
  "description": "Pago de almuerzo",
  "date": "2024-03-20T10:30:00Z",
  "sender_balance_after": 5400,
  "recipient_balance_after": 600
}
```

#### Obtener Historial

```
GET /transactions/history
Header: Authorization: Bearer <token>
Query: ?type=all&limit=10&offset=0

Response: 200
{
  "total": 5,
  "transactions": [
    {
      "id": 1,
      "type": "deposit",
      "amount": 500,
      "date": "2024-03-20T10:00:00Z"
    }
  ]
}
```

#### Obtener Detalles de Transacción

```
GET /transactions/:id
Header: Authorization: Bearer <token>

Response: 200
{
  "id": 1,
  "user_id": 1,
  "type": "deposit",
  "amount": 500,
  "description": "Depósito inicial",
  "date": "2024-03-20T10:00:00Z"
}
```

---

### 👥 Endpoints de Contactos

#### Listar Contactos

```
GET /contactos/list
Header: Authorization: Bearer <token>

Response: 200
[
  {
    "id": 1,
    "user_id": 1,
    "contact_name": "María García",
    "contact_email": "maria@example.com",
    "phone": "987654321"
  }
]
```

#### Agregar Contacto

```
POST /contactos/add
Header: Authorization: Bearer <token>

Body:
{
  "contact_name": "María García",
  "contact_email": "maria@example.com",
  "phone": "987654321"
}

Response: 201
{
  "id": 1,
  "user_id": 1,
  "contact_name": "María García",
  "contact_email": "maria@example.com",
  "created_at": "2024-03-20T10:00:00Z"
}
```

#### Eliminar Contacto

```
DELETE /contactos/:id
Header: Authorization: Bearer <token>

Response: 200
{
  "message": "Contacto eliminado exitosamente"
}
```

#### Actualizar Contacto

```
PUT /contactos/:id
Header: Authorization: Bearer <token>

Body:
{
  "contact_name": "María García López",
  "phone": "987654322"
}

Response: 200
{
  "id": 1,
  "contact_name": "María García López",
  "phone": "987654322"
}
```

---

## 🗄️ Modelos de Base de Datos

### Tabla: Users

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: Transactions

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER REFERENCES users(id),
  to_user_id INTEGER REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- 'deposit' o 'transfer'
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: ContactoTransferencia

```sql
CREATE TABLE contacto_transferencia (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔒 Seguridad Implementada

✅ **Autenticación JWT**

- Tokens con expiración
- Refresh tokens (implementar)
- Validación en cada petición

✅ **Encriptación de Datos**

- Contraseñas con bcrypt (10 rondas)
- Datos sensibles encriptados
- HTTPS recomendado en producción

✅ **Validaciones**

- Entrada del lado del servidor
- Verificación de balance
- Prevención de división de dinero
- Validación de email único

✅ **Middleware de Seguridad**

- CORS configurado
- Rate limiting (implementar)
- CSRF protection (implementar)
- Validación de roles

✅ **Protección de Base de Datos**

- Prepared statements (Sequelize)
- SQL injection prevention
- Conexión segura

---

## 🧪 Testing de Endpoints

### Con Postman

1. Importar colección (crear en Postman)
2. Configurar variables de entorno:
   - `base_url`: http://localhost:5000
   - `token`: [token_obtenido_del_login]

### Con curl

```bash
# Registro
curl -X POST http://localhost:5000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "firstName":"Juan",
    "lastName":"Pérez",
    "password":"password123"
  }'

# Login
curl -X POST http://localhost:5000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"password123"
  }'

# Obtener perfil (usar token del login)
curl -X GET http://localhost:5000/users/profile \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 📊 Flujo de Negocio

```
1. USUARIO NUEVO
   Register → Crear usuario con saldo inicial (0)

2. USUARIO EXISTENTE
   Login → Validar credentials → Emitir JWT

3. OPERACIONES DISPONIBLES
   ├─ Depósito: Aumentar saldo del usuario
   ├─ Transferencia: Disminuir saldo (sender) + Aumentar saldo (recipient)
   └─ Consultar: Ver saldos y transacciones

4. VALIDACIONES CRÍTICAS
   ✓ Saldo suficiente antes de transferencia
   ✓ Email del destinatario existe y es activo
   ✓ No transferir a la misma cuenta
   ✓ Monto debe ser positivo
```

---

## 🚨 Códigos de Estado HTTP

| Código  | Significado  | Ejemplo           |
| ------- | ------------ | ----------------- |
| **200** | OK           | Operación exitosa |
| **201** | Created      | Recurso creado    |
| **400** | Bad Request  | Datos inválidos   |
| **401** | Unauthorized | Sin autenticación |
| **403** | Forbidden    | Sin permisos      |
| **404** | Not Found    | Recurso no existe |
| **409** | Conflict     | Email duplicado   |
| **500** | Server Error | Error interno     |

---

## 🔄 Manejo de Errores

### Estructura de Respuesta de Error

```javascript
{
  "success": false,
  "message": "Descripción del error",
  "error": "ERROR_CODE",
  "statusCode": 400
}
```

### Errores Comunes

```javascript
// Fondos insuficientes
{
  "message": "Fondos insuficientes para la transferencia",
  "error": "INSUFFICIENT_FUNDS",
  "statusCode": 400
}

// Email en uso
{
  "message": "El email ya está registrado",
  "error": "EMAIL_EXISTS",
  "statusCode": 409
}

// Token inválido
{
  "message": "Token inválido o expirado",
  "error": "INVALID_TOKEN",
  "statusCode": 401
}
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log

# Caché
CACHE_ENABLED=true
CACHE_TTL=3600

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Pagos (futuros)
PAYMENT_GATEWAY=stripe
STRIPE_KEY=sk_test_...
```

---

## 📈 Escalabilidad Futura

- [ ] Caché con Redis
- [ ] Rate limiting avanzado
- [ ] Websockets para actualizaciones en tiempo real
- [ ] Historial de auditoría
- [ ] Sistema de notificaciones
- [ ] Integración con pasarelas de pago
- [ ] Microservicios
- [ ] GraphQL API
- [ ] Balanceo de carga

---

## 📝 Licencia

Proyecto educativo - Bootcamp SENCE 2025

---

## 👨‍💻 Desarrollo Local

### Tips Útiles

```bash
# Ver logs en tiempo real
npm run dev

# Limpiar base de datos
npm run reset-db

# Crear seed de datos
npm run seed

# Ejecutar tests
npm test
```

---

## 🐛 Troubleshooting

| Problema             | Solución                                 |
| -------------------- | ---------------------------------------- |
| Puerto 5000 en uso   | `lsof -i :5000` y matar proceso          |
| BD no conecta        | Verificar credenciales en .env           |
| JWT expirado         | Obtener nuevo token en login             |
| CORS error           | Verificar CORS_ORIGIN en .env            |
| Archivos no se suben | Verificar permisos de directorio uploads |

---

**Última actualización:** Abril 2026
**Versión:** 1.0.0
**Estatus:** ✅ Producción-Ready
