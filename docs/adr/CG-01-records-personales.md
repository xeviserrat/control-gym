# ADR CG-01 — Récords personales

Estado: aceptado para implementación. CG-01 sigue pendiente hasta su integración y verificación.

## Contexto

La primera entrega del [plan](../pendientes.md) es [Récords personales](../specs/entrenamiento.md#récords-personales). El implementador ejecuta CG-01 y el revisor valida cada parada.

## Orden para el implementador

1. Parte de `preview`. Localiza el resumen tras finalizar, el detalle de historial `/history/[id]` y la ficha `/exercises/[id]`. Identifica cómo esos flujos autorizan y ordenan sesiones, y cómo se registra una serie sin carga. **Parada 1.** Antes de editar código, entrega los archivos que tocarás, el filtro de usuario y estado, el criterio de orden cronológico con empates y el tratamiento de carga cero. Espera el visto bueno del revisor.
2. Añade un cálculo compartido con los datos existentes. Agrupa por usuario autenticado, `WorkoutExercise.exerciseId` real y número exacto de repeticiones. Usa solo series con carga registrada de sesiones `COMPLETED`. Para cada pareja ejercicio y repeticiones de la sesión mostrada, toma su mejor carga y compárala con el máximo de sesiones estrictamente anteriores. Si no existe antecedente comparable, la carga establece la referencia inicial. Si lo supera estrictamente, devuelve un único récord para esa pareja. Una serie de la misma sesión jamás sirve de antecedente. Mantén las consultas acotadas al usuario y evita una consulta por serie. Conserva la precisión de kg del esquema actual y calcula desde el historial existente, sin migración.
3. Prueba el cálculo con 67,5 kg × 8 → 70 kg × 8, empate a 70 kg × 8, 70 kg × 7 evaluado solo frente a sus propios antecedentes, primera referencia, varias series o bloques del mismo ejercicio, sesiones canceladas y en curso, otro usuario, ejercicio distinto, series sin carga y consulta histórica con una marca posterior superior. **Parada 2.** Entrega el diff de datos y cálculo, las pruebas y sus resultados. Espera revisión antes de conectar la UI.
4. Muestra en el resumen al terminar y en el resumen histórico la mejor serie nueva por ejercicio y repeticiones, en kg × reps. En la ficha de ejercicio muestra la mejor carga histórica para cada número exacto de repeticiones, agrupando visualmente las filas por rangos. Conserva el gráfico, historial y consejos de progresión existentes. Mantén CG-02, CG-03 y los récords de ejercicios sin carga fuera del encargo.
5. Ejecuta `npm run lint`, `npm test` y `npm run build`. Verifica en la vista previa el flujo de cierre con récord, la reapertura de una sesión histórica tras lograr otra marca y la ficha agrupada. **Parada 3.** Entrega una PR contra `preview` con resultados, evidencias de las tres vistas, CI y enlace de Vercel. Si una comprobación queda bloqueada, documenta el motivo. Espera la aprobación del revisor antes de integrar. Tras integrar y comprobar la aceptación, actualiza `docs/pendientes.md` y `docs/features.md`.
