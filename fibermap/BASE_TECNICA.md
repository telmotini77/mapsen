# Base técnica de FiberMap

Esta base vincula las historias de usuario con el modelo existente y con criterios verificables. Describe el alcance actual; los pendientes no deben interpretarse como funciones terminadas.

## Historias y criterios de aceptación

| ID | Historia | Modelo y aplicación | Criterios de aceptación |
| --- | --- | --- | --- |
| HU-01 | Como administrador quiero organizar la red por proyecto para separar su inventario. | Project; servicio projects | Código único; nombre obligatorio; coordenadas válidas; zoom entre 1 y 22; los proyectos eliminados no aparecen en el listado. |
| HU-02 | Como diseñador quiero trazar cables sobre la infraestructura para representar la red física. | Cable, CableRouteNode, CableConnection; cables y cable-geometry | Se admiten 2, 6, 12, 24 y 48 hilos; cada vértice se ajusta a postes o dispositivos; una línea cercana sin vértice en el dispositivo no crea conexión. |
| HU-03 | Como técnico quiero identificar tubos e hilos para preparar los empalmes. | FiberTube, Fiber; domain/network-rules | 2 hilos: 1×2; 6: 1×6; 12: 2×6; 24: 4×6; 48: 4×12. La numeración de hilos es única por cable y la posición es única por tubo. |
| HU-04 | Como técnico quiero conectar mangas y NAP conservando la identidad de cada hilo. | Box, Splitter, SplitterPort, OpticalTermination, OpticalConnection | La conexión registra extremos e identificadores de fibra; una manga de distribución usa 1:8; la NAP admite 1:8 o 1:16, con máximo 16 salidas. |
| HU-05 | Como operador quiero consultar continuidad para localizar el recorrido óptico. | OpticalConnection, FiberSegment; trace y optical-continuity-engine | El recorrido debe corresponder a conexiones persistidas; una conexión eliminada no debe aportar continuidad; validar con pruebas del servicio trace. |
| HU-06 | Como operador quiero registrar clientes y evaluar cobertura. | Customer, Box; customers | Nombre y coordenadas obligatorios; correo válido cuando se proporciona; la evaluación conserva caja cercana y distancia cuando corresponde. |

## Modelo técnico

La fuente del modelo persistido es `backend/prisma/schema.prisma`. Project agrupa la infraestructura; Cable contiene tubos y estos contienen hilos. CableConnection describe el paso físico del cable por dispositivos. OpticalTermination y OpticalConnection describen la conectividad óptica: pasar por una caja y tener continuidad óptica son relaciones distintas y deben verificarse por separado.

Los tipos e identificadores de referencias polimórficas, como CableConnection.elementType/elementId, requieren validación en servicios porque no tienen una clave foránea directa. Los registros con deletedAt deben excluirse de las consultas operativas. Los campos version requieren comprobación explícita en las operaciones que ofrecen control de concurrencia; su presencia por sí sola no lo garantiza.

## Criterios de cierre

1. Cada cambio funcional identifica la historia afectada y sus criterios.
2. Las entradas se validan en la API y las reglas de capacidad se comprueban en el servidor.
3. Los cambios al modelo incluyen revisión de compatibilidad y un plan de migración; no se aplica db push sobre datos restaurados sin revisión.
4. Se ejecutan las pruebas relevantes y la compilación del componente modificado.
5. Se documentan los criterios pendientes sin presentarlos como aprobados.

## Implementación y verificación

- La asignación automática rechaza NAP adicionales o continuidad hacia manga/ODF cuando no quedan hilos libres.
- Los rangos guardados se validan contra la capacidad, sin recortarlos silenciosamente.
- Al insertar una NAP se reservan los hilos de las NAP existentes, incluso si aparecen después en el trazado.
- Crear o editar un trazado valida la asignación antes de guardar el cable y su geometría. La sincronización vuelve a validar antes de escribir conexiones.
- Los clientes solo aceptan proyectos existentes sin eliminar. La reevaluación sin caja cercana limpia la caja y distancia anteriores.
- Verificación: 79 pruebas del backend aprobadas, incluidas cuatro regresiones nuevas de capacidad y conservación de rangos.

## Límites de la verificación

La suite verifica reglas y servicios con dobles de datos. La prueba integral con PostgreSQL/PostGIS y la interfaz en ejecución sigue siendo necesaria antes de certificar todas las historias. Las escrituras del trazado y la asignación de puertos todavía abarcan varias operaciones; la validación previa evita los rechazos conocidos por capacidad, pero no garantiza atomicidad ante fallos de infraestructura o cambios concurrentes.
