# Pendientes de Control Gym

Cada fila es un encargo para un futuro agente. Todas las tareas están pendientes. Los identificadores sirven para referenciar el encargo en una rama o PR.

## Fase 1 · Progreso y vuelta al gimnasio

| Estado | Encargo | Entrega |
|---|---|---|
| [ ] | **CG-01 · Récords personales** | Calcular marcas y mostrarlas en el resumen y en la ficha del ejercicio. [Spec](./specs/entrenamiento.md#récords-personales) |
| [ ] | **CG-02 · Siguiente rutina** | Configurar una rotación y mostrar la siguiente rutina en Inicio. [Spec](./specs/entrenamiento.md#siguiente-rutina) |
| [ ] | **CG-03 · Subida de peso concreta** | Configurar incrementos y aplicar una sugerencia editable desde el entrenamiento. [Spec](./specs/entrenamiento.md#subida-de-peso-concreta) |

## Fase 2 · Invitaciones

| Estado | Encargo | Entrega |
|---|---|---|
| [ ] | **CG-04 · Invitaciones de usuarios** | Crear y compartir manualmente un enlace con caducidad y aceptar con el correo verificado. [Spec](./specs/invitaciones.md) |
| [ ] | **CG-05 · Rutina adjunta** | Incorporar la captura y copia de rutinas, incluida la entrada desde la rutina. Depende de CG-04. [Spec](./specs/invitaciones.md#cg-05--rutina-adjunta) |

## Fase 3 · Adaptar el entrenamiento

| Estado | Encargo | Entrega |
|---|---|---|
| [ ] | **CG-06 · Modo exprés** | Configurar prioridades, previsualizar recortes y ejecutar el plan ajustado. Verificar su interacción con CG-03. [Spec](./specs/entrenamiento.md#modo-exprés) |
| [ ] | **CG-07 · Alternativas por material** | Etiquetar ejercicios, ordenar sustitutos y recordar la última elección compatible. [Spec](./specs/entrenamiento.md#alternativas-por-material) |

## Fase 4 · Entrenar sin cobertura

| Estado | Encargo | Entrega |
|---|---|---|
| [ ] | **CG-08 · Sesión local** | Descargar rutinas y registrar una sesión completa con persistencia local. [Spec](./specs/entrenamiento.md#entrenar-sin-cobertura) |
| [ ] | **CG-09 · Sincronización** | Integrar sesiones locales en el historial con reintentos y gestión de conflictos. Depende de CG-08. Validar el flujo completo antes de habilitarlo. [Spec](./specs/entrenamiento.md#entrenar-sin-cobertura) |

## Cómo repartir el trabajo

- Empezar por CG-01. CG-02 puede avanzar en paralelo. Coordinar CG-03 con CG-01 porque ambos afectan al flujo de entrenamiento.
- Dar a cada agente un encargo y su spec. Si dos encargos tocan el mismo modelo o pantalla, acordar primero el orden de integración.
- Cerrar cada encargo cuando se haya integrado y comprobado su criterio de aceptación. Actualizar entonces esta lista y el [inventario de funciones](./features.md).
