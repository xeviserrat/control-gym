# Invitaciones por email

**Objetivo.** Invitar a otra persona a Control Gym y, opcionalmente, darle una rutina lista para usar.

## Flujo

1. En **Perfil → Invitar a alguien**, se introduce un correo y se puede adjuntar una rutina propia. Desde una rutina, **Invitar con esta rutina** abre el mismo formulario con ella seleccionada.
2. La app envía un correo que identifica Control Gym, indica si se adjunta una rutina y contiene un enlace con caducidad.
3. Si hace falta, la persona se registra o inicia sesión. La invitación solo se puede aceptar con una cuenta cuyo correo verificado coincida con el destinatario. El flujo conserva la invitación durante el inicio de sesión y la verificación.
4. Al aceptar, la app confirma la invitación. Si se adjuntó una rutina, aparece en **Mis rutinas** como una copia editable.

## Reglas

- Solo una persona autenticada puede enviar invitaciones. Validar el correo, verificar que la rutina pertenece a quien envía y limitar los envíos repetidos. El mensaje de confirmación de envío no revela si el destinatario tiene cuenta.
- Capturar la rutina en el momento del envío. Copiar orden, ejercicios, series, rangos, descansos, notas de la rutina y superseries. Los ejercicios globales pueden conservar su referencia. Los personalizados deben quedar disponibles para el destinatario mediante una copia propia. Dejar fuera el historial de entrenamientos y las cargas registradas.
- Consumir la invitación al aceptarla correctamente. La aceptación y la creación de la copia forman una sola operación. Los reintentos devuelven el resultado anterior sin duplicar rutinas.
- Mostrar estados comprensibles para enlace caducado, correo de cuenta distinto y fallo de envío. Permitir enviar una nueva invitación si la anterior ha caducado.

## Criterios de aceptación

- Un destinatario nuevo puede registrarse, verificar su correo y aceptar. Un usuario existente con el correo correcto puede aceptar tras iniciar sesión.
- Una cuenta con otro correo no puede canjear el enlace ni consultar el contenido adjunto.
- Aceptar dos veces, incluso desde dos pestañas, crea como máximo una copia. Editarla no cambia la rutina de origen.
- Una invitación sin adjunto completa el flujo sin crear una rutina. Si falla el envío, la interfaz indica el fallo y permite reintentar.

## Decisiones de implementación pendientes

Elegir el proveedor de correo, el remitente y el dominio. Definir el plazo de caducidad y los límites de envío antes de habilitar el flujo. Probar la entrega y el retorno desde el enlace en un entorno de pruebas antes de activarlo.
