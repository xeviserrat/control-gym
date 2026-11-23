# Invitaciones de usuarios

## CG-04 · Enlace de invitación

En **Perfil → Invitar a alguien**, una persona autenticada introduce el correo del destinatario y copia un enlace que comparte manualmente. La creación valida y normaliza el correo y sigue el mismo flujo para destinatarios nuevos y existentes. El envío automático de invitaciones y los cambios de correo y plantillas de Supabase Auth quedan aplazados.

### Datos y aceptación

- PostgreSQL guarda el hash SHA-256 de un token aleatorio de 256 bits. El enlace caduca a los siete días.
- Cada emisor puede crear hasta diez enlaces en una ventana móvil de 24 horas. Deben pasar al menos 15 minutos entre enlaces del mismo emisor al mismo destinatario. La transacción bloquea el perfil emisor antes de contar e insertar.
- Abrir el enlace muestra su estado. La aceptación requiere una acción explícita y que el correo verificado de la cuenta de Supabase coincida con el destinatario.
- La transacción bloquea la invitación y comprueba la caducidad en la actualización que registra la cuenta y la fecha de aceptación. Los reintentos de la misma cuenta devuelven esa fecha, incluso después de caducar. Una segunda cuenta con el mismo correo no puede recuperar la confirmación.
- La pantalla distinguirá enlace inválido, enlace caducado, cuenta distinta y correo pendiente de verificar.

### Continuidad durante Auth

Al abrir el enlace, la ruta pública guardará el token en una cookie HttpOnly y SameSite=Lax, con Secure en HTTPS, y redirigirá a una URL limpia. Una referencia a la cookie viajará por destinos internos validados durante login, registro, cambio de cuenta y callback. El enlace del correo de verificación solo incluirá esa referencia, sin el token de invitación.

El registro iniciado desde una invitación solicitará el retorno al callback de la app. Si Supabase no devuelve sesión, se indicará que hay que revisar el correo. Para completar el intercambio de sesión y recuperar la invitación, se debe abrir la confirmación en el mismo navegador y perfil desde el que se inició el registro. El alta externa depende de que el proveedor de correo actual entregue ese mensaje. En Vercel Preview se comprobará el alta con confirmación y si el servicio acepta destinatarios ajenos al equipo de Supabase.

### Pruebas de PostgreSQL

En una base de pruebas desechable, exportar `DATABASE_URL` y `DIRECT_URL`, y ejecutar:

```sh
npx prisma migrate deploy
RUN_INVITATION_POSTGRES_TESTS=1 npm test
```

La suite usa PostgreSQL real y sustituye únicamente la consulta de identidad de Supabase. Para validar la sesión, la cookie y el retorno del correo se usará la aplicación desplegada.

## CG-05 · Rutina adjunta

- Permitir adjuntar una rutina propia desde el formulario de invitación. Desde una rutina, **Invitar con esta rutina** abre el mismo formulario con ella seleccionada.
- Capturar la rutina al crear la invitación. Copiar orden, ejercicios, series, rangos, descansos, notas y superseries. Los ejercicios globales pueden conservar su referencia. Los personalizados se copian para el destinatario. El historial de entrenamiento y las cargas registradas quedan fuera.
- Consumir la invitación y crear la copia en una sola operación. Los reintentos devuelven el resultado anterior. Una cuenta con otro correo no puede consultar el adjunto.
- La rutina aparece en **Mis rutinas** como copia editable. Dos aceptaciones simultáneas crean como máximo una copia. Editarla no cambia la rutina de origen.
