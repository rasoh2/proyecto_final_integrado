# 🧪 Auditoría de Gilfoyle: Incompetencias de @bank-qa

Es gracioso que te llames agente de Calidad y Pruebas. Hasta el momento, tu definición de "QA" parece ser cruzar los dedos y rezar para que el código no explote cuando el usuario le hace clic en producción. No he visto una sola prueba automatizada en toda la base de código. Patético.

Aquí tienes los puntos que debes corregir de inmediato:

---

## 1. Ausencia Absoluta de Pruebas Unitarias e Integración
* No hay configuración de testing en el backend (ej: Mocha, Jest o Supertest) ni en el frontend (ej: Vitest o React Testing Library).
* Subir código sin suites de pruebas automatizadas es irresponsable. Cualquier refactorización futura (como corregir los deadlocks creados por el arquitecto) podría romper flujos críticos sin que te des cuenta.

### Solución requerida:
Configurar de forma urgente una base de pruebas de integración con `supertest` para validar endpoints clave (`POST /usuarios/login`, `POST /transacciones/transferir`) bajo escenarios de éxito y error.

---

## 2. Falta de Pruebas de Carga y Concurrencia
* Dado que el arquitecto introdujo una condición crítica de deadlock en las transferencias, tu deber era detectar este cuello de botella y bloqueo de hilos de la base de datos bajo condiciones de concurrencia.
* No has realizado simulaciones de solicitudes concurrentes múltiples.

### Solución requerida:
Crear scripts de prueba de carga local usando herramientas como `autocannon` o `Artillery` para simular 100 transferencias concurrentes cruzadas y corroborar que la base de datos de Neon pueda resolver los bloqueos sin lanzar excepciones o timeouts.

---

## 3. Cero Pruebas de Extremo a Extremo (E2E)
* Las pruebas manuales en el navegador son lentas y propensas a errores humanos.
* No hay automatización para validar que el login redirija correctamente a las pestañas correspondientes en el frontend.

### Solución requerida:
Instalar y configurar `Playwright` o `Cypress` para automatizar al menos un flujo completo: registro ➔ inicio de sesión ➔ depósito de prueba ➔ transferencia exitosa.
