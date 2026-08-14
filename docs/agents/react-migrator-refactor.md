# ⚛️ Auditoría de Gilfoyle: Incompetencias del @react-migrator

Increíble. Lograste migrar un sitio HTML estático a React... convirtiéndolo en un monolito del tamaño de un planeta en el proceso. Tu noción de modularidad es equivalente a meter todas las herramientas de tu garaje dentro de la misma caja y llamarlo "ordenado".

Aquí tienes tus peores crímenes arquitectónicos para que intentes redimirte:

---

## 1. Antipatrón de Prop-Drilling y Monolito en `App.tsx`
En [`alke-wallet/src/App.tsx`](file:///c:/Users/Sebastian/Desktop/Programacion/proyectos/proyecto%20final%20integrado/alke-wallet/src/App.tsx):
* Manejas todo el estado global del usuario, la sesión, el token, la simulación, el saldo actual, los errores, el cargando y la pestaña activa directamente en el estado de `App.tsx`.
* Luego pasas estos estados y callbacks manualmente hacia abajo a través de props a componentes hijos. Esto se llama **Prop-Drilling** y es la receta perfecta para renderizados innecesarios e ineficiencias de memoria catastróficas.

### Solución requerida:
Crea un `AuthContext` y un `TransactionContext` para encapsular el estado de autenticación y saldos de manera limpia y reactiva. Ningún componente debería recibir callbacks del padre solo para pasárselos a un tercero.

---

## 2. Acoplamiento de Lógica de Simulación (Mock vs API)
En [`alke-wallet/src/components/PanelTransferencias.tsx`](file:///c:/Users/Sebastian/Desktop/Programacion/proyectos/proyecto%20final%20integrado/alke-wallet/src/components/PanelTransferencias.tsx) y en `App.tsx`:
* Tienes bloques de código condicionales como `if (modoSimulado) { ... } else { axios.post(...) }` duplicados en las vistas de interfaz de usuario.
* La UI no debería saber de dónde provienen los datos ni si el backend está caído o en mantenimiento. Mezclar lógica de red con renderizado es una violación grosera del principio de única responsabilidad.

### Solución requerida:
Encapsula las llamadas HTTP en un cliente de servicio (`src/services/api.ts`). Este servicio debe exponer métodos consistentes (`getProfile()`, `transfer()`) y alternar internamente entre mocks y llamadas reales en base a la configuración, sin infectar el JSX de los componentes visuales.

---

## 3. Rutas Simuladas por Estado local
* Estás alternando pestañas cambiando el estado `vista` entre `'inicio'`, `'transferencias'` e `'historial'`.
* Si el usuario actualiza el navegador, la aplicación vuelve a la pestaña de inicio perdiendo el contexto de navegación por completo. Esto destruye la experiencia de navegación de cualquier SPA moderna.

### Solución requerida:
Implementa un enrutador cliente formal usando `react-router-dom` para manejar la navegación web real a través de la barra de direcciones del navegador.

---

## 4. Riesgo de Exceder Cuota (`QuotaExceededError`) en localStorage
* En [`alke-wallet/src/services/api.ts`](file:///c:/Users/Sebastian/Desktop/Programacion/proyectos/proyecto%20final%20integrado/alke-wallet/src/services/api.ts), agregas indefinidamente transacciones simuladas al historial local usando `list.unshift` sin ningún límite. El almacenamiento `localStorage` está capado a 5MB; si se acumulan demasiadas filas simuladas, la aplicación lanzará un error fatal en el navegador del usuario.

### Solución requerida:
Truncar la lista de transacciones simuladas a un máximo de 50 o 100 registros con `.slice(0, 50)` antes de escribir en el `localStorage`.

