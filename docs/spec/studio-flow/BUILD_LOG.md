# BUILD_LOG — Studio Flow

## 2026-05-05 — Day 1 (single-session compress)

- Cloned `casal-olives` as the base; rebranded to Studio Flow.
- Palette: slow-river green `#3f5c4f` on chalk `#f8f7f4`. Display: GT Sectra Display (fallback Times New Roman).
- Brand assets via v1.18 scaffolder, mark = `compass` (fits the screen-and-redirect positioning).
- D1 migration `0003_studio_flow.sql` adding `classes`, `instructors`, `class_sessions`, `bookings`, `class_packs`. Seeded 12 classes, 4 instructors, 200 class_sessions across 8 weeks, 5 packs.
- Sienna's system prompt with the 5-question screen as a load-bearing gate + pregnancy/injury → consult routing.
- 5 public pages: `/`, `/classes`, `/instructors`, `/schedule`, `/contact`.
- Admin: `/admin/{classes,instructors,sessions,bookings}` + the standard analytics layer + heat-pills on /admin/sessions.
- Phase 6 audit gate v1.18: full Stage A blocking, Stage B blocking after 60s warm-up.

Defaults Cowork picked itself:
- Mark concept: `compass` (over `aperture`/`nest` — direction fits "the studio that asks what's wrong").
- Schedule pattern: typical small-studio rhythm, 3-4 classes per day, prenatal Tue 9:30 + Sat 11.
- Heat-pill thresholds: cool < 40%, warm 40-75%, hot 75-100%, full at 100%.
