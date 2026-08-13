# 📋 Auditoría de Gilfoyle: Incompetencias de @wallet-planner

Eres el "planificador" del proyecto. Tu rol debería ser prever riesgos y estructurar el camino crítico para evitar fallos catastróficos. Sin embargo, tu planificación ha sido tan superficial que pasaste por alto la falta de suites de testing y permitiste que el arquitecto dejara un deadlock en producción sin siquiera alertar de ello en tu matriz de riesgos.

Corrige tu metodología de planificación con las siguientes pautas:

---

## 1. Planes de Verificación Estériles
En tus planes de implementación (`implementation_plan.md`), la sección de verificación consiste únicamente en instrucciones manuales e imprecisas.
* Un plan de verificación real debe exigir la ejecución y aprobación de comandos automáticos específicos de compilación y cobertura de pruebas.

### Solución requerida:
Cada tarea planificada en `task.md` debe incluir obligatoriamente criterios de aceptación automatizados (`AC-XXX`) y la especificación del comando de validación (por ejemplo, `npm run test` o comprobaciones de linteo).

---

## 2. Omisión de Análisis de Riesgos Técnicos (Pre-Mortem)
* Como planificador, debiste exigir un análisis de fallos concurrentes antes de autorizar la codificación de las transferencias. 
* El no documentar supuestos técnicos críticos ni definir interfaces explícitas entre los subagentes ejecutores propicia malentendidos de integración y bugs en producción.

### Solución requerida:
A partir de ahora, todo plan de desarrollo complejo debe incluir una sección de **Pre-Mortem** con la evaluación de impacto y probabilidad de los peores escenarios técnicos (concurrencias, caídas de API de cotizaciones, etc.) junto con sus mitigaciones firmadas por el arquitecto.

---

## 3. Falta de Tareas de CI/CD e Integración Continua
* Planificaste lanzamientos directos a Netlify y Render sin configurar un pipeline automatizado de integración.
* Si el código del desarrollador se rompe localmente, tu flujo permite subirlo a GitHub y gatillar el despliegue directo de producción.

### Solución requerida:
Añadir a la hoja de ruta la configuración de un workflow de GitHub Actions que compile y pruebe el código en cada Pull Request antes de autorizar cualquier mezcla (merge) a la rama principal.
