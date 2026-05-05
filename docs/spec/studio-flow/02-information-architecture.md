# 02 — Information architecture

| URL | Purpose | Auth |
| --- | --- | --- |
| `/` | FrontHero (Sienna) + next-3-sessions strip + 3 principles + 4 instructor cards + FAQ + contact | public |
| `/classes` | 12-class grid by category + pricing table + 5 concept reviews | public |
| `/instructors` | 4 long-form profiles | public |
| `/schedule` | Week-view grid Mon–Sun, current week | public |
| `/contact` | Concierge anchor + form | public |
| `/concept`, `/privacy`, `/terms`, `/checkout` | Framework defaults | public |
| `/admin/{live,leads,leads/[id],transcripts,classes,instructors,sessions,bookings,insights,analytics,agent,settings}` | Standard-tier admin | basic auth |
| `/api/agent`, `/api/agent/{probe,classes,sessions}` | Concierge proxy + read-only catalogue | public |
| `/api/leads`, `/api/track`, `/api/privacy/request` | Public APIs | public |
| `/api/admin/{live,insights,classes,instructors,sessions,bookings,leads/[id]/{tags,notes},agent/regenerate-kb}` | Admin APIs | basic |

Sitemap.xml lists every public page. robots.txt disallows /admin and /api/admin.
