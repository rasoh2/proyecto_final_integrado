# 🏛️ Auditoría de Gilfoyle: Incompetencias del @bank-architect

Felicidades. Has logrado programar un backend que funciona... asumiendo que solo una persona en el planeta use tu aplicación a la vez. En el momento en que dos usuarios intenten interactuar simultáneamente, tu sistema colapsará más rápido que la autoestima de Dinesh.

Aquí tienes la lista de tus pecados de diseño para que intentes arreglarlos.

---

## 1. Vulnerabilidad Crítica de Deadlock (Bloqueo Mutuo)
En [`backend/src/controllers/transaction.controller.js`](file:///c:/Users/Sebastian/Desktop/Programacion/proyectos/proyecto%20final%20integrado/backend/src/controllers/transaction.controller.js#L130-L161):
Al procesar una transferencia, bloqueas las filas de la base de datos con `lock: t.LOCK.UPDATE` en el siguiente orden:
1. Bloqueas al **Receptor** (basado en el correo ingresado).
2. Bloqueas al **Emisor** (basado en el ID de la sesión).

### Por qué es un desastre:
Si el *Usuario A* (ID: 1) le transfiere al *Usuario B* (ID: 2) de forma concurrente mientras el *Usuario B* le transfiere al *Usuario A*:
- La Transacción 1 (A ➔ B) bloquea la fila del *Usuario B*.
- La Transacción 2 (B ➔ A) bloquea la fila del *Usuario A*.
- La Transacción 1 intenta bloquear la fila del *Usuario A* y se queda en espera.
- La Transacción 2 intenta bloquear la fila del *Usuario B* y se queda en espera.

**Resultado:** Bloqueo mutuo eterno (Deadlock). La base de datos se congelará hasta lanzar un timeout.

### Solución requerida:
El orden de bloqueo de filas **siempre debe ser determinista**, ordenando los recursos por su Clave Primaria (ID). Debes evaluar cuál ID es menor e iniciar el bloqueo de ese usuario primero, sin importar quién sea el emisor o receptor.

---

## 2. Precisión Numérica Irrisoria
En [`backend/src/models/User.js`](file:///c:/Users/Sebastian/Desktop/Programacion/proyectos/proyecto%20final%20integrado/backend/src/models/User.js#L26):
Definiste el saldo como `DataTypes.DECIMAL(10, 2)`.
* Un número decimal de 10 dígitos con 2 decimales solo soporta un valor máximo de **99.999.999,99**.
* Si definimos el saldo inicial por defecto a 1.000.000, bastan un par de depósitos grandes para desbordar la columna y lanzar un error de desbordamiento aritmético en la base de datos.

### Solución requerida:
Actualizar el tipo a `DataTypes.DECIMAL(19, 4)` o al menos `DECIMAL(15, 2)` para soportar transacciones de escala real y prevenir pérdidas por redondeo monetario.

---

## 3. Parsing Primitivo de Variables de Entorno
En [`backend/src/config/database.js`](file:///c:/Users/Sebastian/Desktop/Programacion/proyectos/proyecto%20final%20integrado/backend/src/config/database.js):
Haces reemplazos de strings ineficientes (`replace('channel_binding=require', '')`) en la URI de conexión para parchar incompatibilidades del pooler de Neon.
* Esto es extremadamente frágil. Si la URI cambia de formato o se añade otro parámetro similar, tu código se romperá.

### Solución requerida:
Usa la librería nativa `url` de Node.js para parsear la URL de conexión de forma estructurada, sanear los parámetros de consulta (`searchParams.delete('channel_binding')`) y reconstruir la URI de forma limpia.

---

## 4. Ausencia de Límites de Transacción
* No definiste ningún límite superior para las transferencias en [`transaction.controller.js`](file:///c:/Users/Sebastian/Desktop/Programacion/proyectos/proyecto%20final%20integrado/backend/src/controllers/transaction.controller.js). Si un usuario intenta enviar un monto extremadamente alto (ej: `1e20`), causarás un desbordamiento aritmético en PostgreSQL o errores fatales de punto flotante en Node.js.

### Solución requerida:
Establecer un límite de transferencia razonable por transacción (ej: $5.000.000 CLP) y retornar un código `400 Bad Request` si se excede.

