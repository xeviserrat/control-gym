# Control Gym

Training tracker personal — mobile-first, diseñado para registrar cada serie individual durante el entrenamiento.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** — diseño minimalista estilo Apple con acento turquesa
- **Supabase** — Auth + PostgreSQL (plan Free)
- **Prisma ORM** — acceso tipado a la base de datos
- **Zod** + React Hook Form — validación de formularios
- **Vercel** — despliegue serverless

## Requisitos

- Node.js 20+
- Cuenta [Supabase](https://supabase.com) (Free)
- Cuenta [Vercel](https://vercel.com) (Hobby)

## Configuración local

1. Clona el repositorio e instala dependencias:

```bash
npm install
```

2. Copia las variables de entorno:

```bash
cp .env.example .env.local
```

3. Configura Supabase:
   - Crea un proyecto en Supabase
   - Copia `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - En Settings → Database, copia la connection string (Transaction pooler) como `DATABASE_URL`
   - Copia la connection string directa como `DIRECT_URL`

4. Ejecuta las migraciones:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

5. Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Despliegue en Vercel

1. Conecta el repositorio Git a Vercel
2. Añade las variables de entorno de `.env.example`
3. En Build Command, Prisma se genera automáticamente via `postinstall`
4. Ejecuta migraciones contra producción:

```bash
npx prisma migrate deploy
```

5. (Opcional) Ejecuta `supabase/rls.sql` en el SQL Editor de Supabase

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run test` | Tests (Vitest) |
| `npx prisma studio` | Explorador de BD |

## Estructura

```
src/
  app/           # Rutas (App Router)
  components/    # UI reutilizable
  lib/
    actions/     # Server Actions
    supabase/    # Clientes Supabase
    workout/     # Lógica de entrenamiento
    validations/ # Schemas Zod
prisma/          # Schema y seed
supabase/        # RLS policies
docs/            # Documentación del proyecto
```

## Funcionalidades

- Autenticación email/password (Supabase Auth)
- Biblioteca de ejercicios reutilizables
- Editor de rutinas con supersets
- Modo entrenamiento serie por serie
- Timer de descanso
- Historial y evolución por ejercicio
- Progresión de carga (doble progresión)
- PWA instalable
- Light / Dark / System theme
