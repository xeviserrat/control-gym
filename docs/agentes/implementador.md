# Agente implementador

## Antes de empezar

- Lee `AGENTS.md`, el [índice](../README.md), el [plan](../pendientes.md), la spec del encargo y su ADR si existe.
- Trabaja en una rama propia desde `preview` según el [flujo Git](../git-workflow.md). Usa el identificador del encargo en la rama o la PR.
- Identifica los puntos de entrada, el comportamiento que debe conservarse y las comprobaciones de aceptación. Eleva al revisor las decisiones que cambien el alcance o el comportamiento acordado.

## Durante el encargo

- Implementa el alcance asignado y reutiliza los patrones del repo. Comprueba los casos de la spec y los efectos del cambio sobre los flujos existentes.
- Cumple las paradas del ADR. En CG-01, presenta primero el plan antes de editar, luego el cálculo y las pruebas antes de conectar la interfaz y por último la PR antes de integrar. En cada parada, entrega la evidencia pedida y espera el visto bueno para continuar.
- Si una prueba falla, diagnostica el fallo y corrige lo que esté dentro del alcance. Si queda bloqueada, explica qué falta y qué partes sí has podido verificar.

## Entrega

- Abre la PR contra `preview` con el objetivo, los criterios de aceptación comprobados, los comandos y resultados, y la vista previa de Vercel cuando proceda.
- Atiende los hallazgos del revisor y vuelve a presentar los cambios afectados. Tras la aprobación, sigue el flujo Git del repo. Actualiza el plan y el inventario de funciones cuando la integración y la aceptación estén verificadas.
