# 01 — Design system

## Voice
- Calm, never preachy.
- Specific over vague.
- Plain English. Sanskrit pose names appear once, glossed in English thereafter.
- Banned: "journey", "intention", "self-care" as filler, "honour", "embrace", "elevate".
- First-person singular for opinions; first-person plural for the studio.

## Tokens (`apps/web/styles/tokens.css`)

| Token | Hex | Use |
| --- | --- | --- |
| `--color-bg` | `#f8f7f4` | Chalk page bg |
| `--color-surface` | `#ffffff` | Cards |
| `--color-ink` | `#1d1f1e` | Body text |
| `--color-ink-muted` | `#666867` | Secondary |
| `--color-accent` | `#3f5c4f` | Slow-river green |
| `--color-warm` | `#d8a97c` | Beginner-friendly pill only |
| `--color-line` | `#e5e3de` | Borders |

## Type
- Display: GT Sectra Display (fallback Times New Roman).
- Sans: Inter (fallback Söhne).
- Mono: ui-monospace — for class times in the schedule grid.

## Logo
- "studio fl○w" with the "o" of "flow" replaced by an open-circle SVG path (Header.tsx).
- Mark concept = `compass` for the favicon / OG card / apple-touch-icon — references the screen-and-redirect positioning.
