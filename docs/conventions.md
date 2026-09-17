# Conventions

## TypeScript

- Strict mode enabled
- Avoid `any`; use Prisma-generated types
- Server Actions return `ActionResult<T>` union type

## Components

- `src/components/ui/` — primitives (Button, Input, Card, Tooltip)
- `src/components/{feature}/` — feature-specific components
- Client components only when interactivity required

## Loading UX

- `LoadingProvider` in root layout — global overlay for navigation and async work
- `AppLink` — use instead of `Link` for in-app navigation (shows overlay immediately)
- `useAppRouter()` — use instead of `useRouter()` when calling `push` / `replace` / `back`
- `usePendingAction()` — wrap Server Action calls; pass `{ overlay: false }` for high-frequency actions (e.g. completing a set during workout)
- `(app)/loading.tsx` and `(auth)/loading.tsx` — fallback while server components load

## Styling

- Tailwind CSS with CSS variables in `globals.css`
- Primary color: turquoise (`--primary: #0d9488` / `#14b8a6` dark)
- Apple-inspired: system font stack, generous spacing, minimal borders

## Forms

- Zod schemas in `src/lib/validations/`
- React Hook Form for complex forms; native forms for auth actions
- Server Actions for all mutations

## Testing

- Vitest for unit tests
- Critical logic: `src/lib/workout/__tests__/`

## Naming

- Server Actions: verb + noun (`createRoutine`, `completeSet`)
- Routes: lowercase, Spanish UI labels
