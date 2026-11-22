# Mejoras de entrenamiento

Estas specs describen trabajo pendiente. El [documento de pendientes](../pendientes.md) recoge el orden y las dependencias.

## Récords personales

**Objetivo.** Mostrar una mejora concreta al terminar y permitir consultarla en la ficha del ejercicio.

- Comparar series de sesiones completadas del mismo usuario, ejercicio y número de repeticiones. Un récord es una carga estrictamente superior a todas las marcas anteriores para esas repeticiones.
- Mostrar en el resumen la mejor serie nueva por ejercicio y número de repeticiones. En la ficha, mostrar la mejor carga por número de repeticiones, agrupada en rangos para facilitar la lectura.
- Si todavía no hay una marca comparable, tratar la serie como referencia inicial. Para ejercicios sin carga registrada, dejar los récords de repeticiones para una ampliación posterior.

**Aceptación.** Si la marca era 67,5 kg × 8, una serie de 70 kg × 8 aparece como récord. Repetir 70 kg × 8 o hacer 70 kg × 7 no bate esa marca. Las sesiones canceladas quedan fuera y el resumen histórico compara contra sesiones anteriores a la sesión mostrada.

## Siguiente rutina

**Objetivo.** Proponer desde Inicio la siguiente rutina de una rotación configurable.

- Permitir ordenar rutinas propias en una rotación y activarla desde Inicio. Proponer la primera rutina antes de completar una sesión de la rotación.
- Avanzar a partir de la última sesión completada de una rutina incluida, volver al principio al acabar la lista y permitir elegir otra rutina manualmente.
- Si se elimina una rutina, omitirla en futuras sugerencias. Si queda vacía la rotación, mostrar el acceso habitual a Entrenar.

**Aceptación.** En una secuencia A → B → C, completar B propone C, completar C propone A y abandonar C mantiene la propuesta. Una sesión de otra rutina queda fuera del cálculo.

## Subida de peso concreta

**Objetivo.** Convertir el consejo de subir peso en un objetivo que se pueda cargar en el gimnasio.

- Permitir definir un incremento positivo por ejercicio en la rutina, expresado como incremento de la carga total registrada.
- Cuando la progresión existente aconseje subir y haya una carga de trabajo comparable, sumar el incremento y mostrar el peso sugerido antes de entrenar. Ofrecer una acción para aplicarlo al campo de peso, que sigue siendo editable.
- Conservar el consejo general cuando falte la configuración o la carga de referencia. Respetar el ajuste de progresión de cada ejercicio de la rutina.

**Aceptación.** Con una carga de trabajo de 60 kg, un incremento de 2,5 kg y un resultado de progresión que aconseja subir, aparece «Prueba 62,5 kg». La acción rellena el peso sin registrar la serie.

## Modo exprés

**Objetivo.** Adaptar una sesión al tiempo disponible sin tener que editar la rutina cada vez.

- Permitir marcar ejercicios como prioritarios en el editor. Antes de empezar, seleccionar un límite de tiempo y previsualizar el plan ajustado.
- Estimar la duración a partir de las series, un tiempo orientativo de ejecución por serie y los descansos. Conservar las series prioritarias, recortar primero las accesorias y mantener coordinadas las rondas de superseries. Si una superserie contiene un ejercicio prioritario, conservarla completa en la primera versión.
- Si las prioridades superan el límite, mostrar la estimación mínima y permitir volver o empezar con ese plan. Aplicar los cambios solo a la sesión. Si se recortan series previstas, evitar que completar el plan reducido active por sí solo una subida de peso.

**Aceptación.** Elegir 30 minutos muestra los recortes antes de iniciar. La sesión y el historial reflejan las series del plan confirmado y volver a iniciar la rutina en modo normal recupera su volumen habitual.

## Alternativas por material

**Objetivo.** Encontrar rápido un sustituto cuando un equipo está ocupado.

- Etiquetar ejercicios por material, incluidos los personalizados. En el selector de cambio de ejercicio, dejar que el usuario indique qué material tiene disponible.
- Priorizar sustitutos compatibles por material y grupo muscular. Entre opciones compatibles, dar preferencia al último sustituto elegido para ese ejercicio. Mantener accesible la búsqueda en la biblioteca completa.
- Usar el cambio de ejercicio de la sesión activa. Si ya hay series registradas para ese ejercicio, pedir confirmación antes de un cambio que las borre.

**Aceptación.** Si para un press el usuario indica que solo tiene mancuernas, aparecen primero alternativas compatibles para pecho. Una preferencia anterior por una máquina no desplaza las opciones disponibles y la rutina original conserva su ejercicio.

## Semana de descarga

**Objetivo.** Avisar al usuario de cuándo toca reducir la carga de entrenamiento según la frecuencia que configure.

- En Perfil, permitir activar los avisos y elegir un intervalo en semanas enteras, con un mínimo de dos. Guardar la configuración por usuario. Los avisos están desactivados por defecto.
- Contar semanas de lunes a domingo en la hora local del usuario. La semana de activación cuenta como semana 1 y la última semana de cada ciclo es de descarga. Cambiar el intervalo conserva la semana de inicio. Desactivar y volver a activar los avisos inicia un nuevo ciclo.
- Mostrar en Inicio y Entrenar «La próxima semana toca descarga» durante la semana anterior y «Esta semana toca descarga» durante la semana de descarga. Ocultar el aviso el resto de semanas y cuando esté desactivado. El usuario decide cómo ajustar el entrenamiento.

**Aceptación.** Con un intervalo de cuatro semanas, la semana 3 muestra el aviso de la próxima semana y la semana 4 muestra el aviso de la semana actual. Los avisos se repiten en las semanas 7 y 8. Al desactivarlos, desaparecen.

## Entrenar sin cobertura

**Objetivo.** Empezar una rutina descargada, registrar series y cerrar la sesión sin conexión.

- Desde una sesión autenticada y con conexión, permitir descargar una rutina y los datos necesarios para ejecutarla. Mostrar qué rutinas están listas para usar sin conexión.
- Guardar localmente el plan de la sesión, las series y el estado del entrenamiento, de modo que sobrevivan al cierre y reapertura de la app. Mostrar qué sesiones están pendientes de sincronizar.
- Sincronizar al recuperar la conexión con identificadores estables para evitar duplicados ante reintentos. Mantener los datos locales hasta que el servidor confirme la recepción y asociarlos a la cuenta que los creó. Si hay otra sesión activa en el servidor, conservar ambas y mostrar el conflicto sin sobrescribir ninguna.
- La primera versión cubre rutinas descargadas, registro de series y finalización. Las sesiones sincronizadas pasan al historial y cuentan para récords y rotación según cuándo se entrenó.

**Aceptación.** En modo avión se puede empezar una rutina descargada, registrar series, cerrar y reabrir la app y terminar la sesión. Al volver la red, incluso si falla el primer intento, aparece una sola sesión con todas sus series. Otra cuenta del dispositivo no puede ver ni sincronizar los datos pendientes.
