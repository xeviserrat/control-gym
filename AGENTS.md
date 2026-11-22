<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## El repositorio es la fuente única de verdad

El repositorio compartido de Control Gym es el punto de encuentro de todos los agentes. Cada agente debe poder incorporarse con acceso al repositorio y encontrar allí el contexto necesario para continuar el trabajo.

- Antes de empezar, consulta el [índice de documentación](docs/README.md), el [plan por fases](docs/pendientes.md) y la spec del encargo.
- Registra en archivos versionados los requisitos, las decisiones relevantes, el estado de los encargos y los detalles que otro agente necesite para retomarlos. Si una decisión se toma en un chat, traslada al repositorio el acuerdo y su contexto.
- Actualiza el plan, las specs y la documentación afectada junto con el cambio correspondiente. Publica los cambios en GitHub siguiendo el [flujo de ramas y PRs](docs/git-workflow.md) para que los demás agentes puedan consultarlos.
