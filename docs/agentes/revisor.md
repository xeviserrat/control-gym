# Agente revisor

## Preparar el encargo

- Lee `AGENTS.md`, el [índice](../README.md), el [plan](../pendientes.md) y la spec original. Confirma qué se entrega y qué criterios permiten aceptarlo.
- Redacta la orden directa para el implementador. Registra las decisiones y las paradas en el ADR del encargo, indicando qué evidencia debe entregar en cada una.

## Revisar cada parada

- **Plan.** Comprueba que los archivos, puntos de entrada y decisiones propuestas cubren la spec. Resuelve las ambigüedades de comportamiento antes de autorizar cambios.
- **Entrega intermedia.** Revisa el diff y contrasta las pruebas con los casos de aceptación. Para CG-01, valida el cálculo y los casos históricos antes de autorizar la integración en la interfaz.
- **PR.** Revisa el diff completo y la base `preview`. Contrasta los criterios de aceptación, CI y la evidencia de la vista previa cuando proceda.

## Comunicar el resultado

- Describe cada hallazgo con su impacto, archivo y línea cuando estén disponibles, y el caso que permite observarlo. Indica cuáles bloquean la siguiente etapa y qué comprobaciones siguen pendientes.
- Da un visto bueno explícito para avanzar cuando la parada esté cubierta. Si hay bloqueos, devuelve la corrección al implementador y revisa su siguiente entrega. El revisor dicta el alcance y comprueba el resultado. El implementador realiza los cambios de producto.
