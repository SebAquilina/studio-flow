# 04 — Backend spec

## Bindings
- `DB` (D1) — `studio-flow-db`
- `DEAD_LETTER` (KV) — last-resort lead capture

## Schema (`drizzle/migrations/0003_studio_flow.sql`)
- `classes` — 12 rows seeded across 4 categories (yoga, pilates, breathwork, specials)
- `instructors` — 4 rows (Sienna, Marco, Lara, Adam)
- `class_sessions` — 200 rows seeded across 8 weeks (May 4 – June 29 2026)
- `bookings` — created via concierge or admin; FK to class_sessions; capacity-checked
- `class_packs` — 5 pricing options (drop-in, 5-pack, 10-pack, monthly, privates)

## API routes
- `/api/agent/probe` sentinel
- `/api/agent/classes` read-only catalogue + packs
- `/api/agent/sessions?limit=N&class_slug=...` read-only available sessions
- `/api/admin/{classes,instructors,sessions,bookings}` read endpoints
- `/api/leads`, `/api/track`, `/api/privacy/request` standard

## Concierge actions
`check_schedule`, `book_class`, `cancel_class`, `suggest_pack`, `book_consult`, `contact`. Plus the **5-question screen** baked into the system prompt as a non-negotiable gate.
