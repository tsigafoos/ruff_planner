# AGENTS.md — BarkItDone

**Canonical agent & contributor guidelines:** [`markdown/AGENTS.md`](./markdown/AGENTS.md) (philosophy, stack, structure, conventions).

**Product + implementation decisions for the main Overview and navigation** (standardized in a recent session) are documented in the same file under:

**[Overview & main dashboard (standardized — read before changing)](./markdown/AGENTS.md#overview--main-dashboard-standardized--read-before-changing)**

### Quick status snapshot

| Area | Status |
|------|--------|
| Default landing / post-auth route | `/(tabs)/dashboard` (Overview) |
| Default “dashboard” in product terms | **Overview** tab — not a `dashboardStore` layout |
| Seeded Home dashboard | **Removed**; custom dashboards only via **+** / **Create Dash** |
| Store on load | `currentDashboard` / `activeDashboardId` **null** until user picks a custom tab |
| Web Overview header | **Hidden** `PageHeader`; chrome = tabs + Add Task / Add Project |
| Sidebar | No **Insights**; **Create Dash** |
| Top bar Team | **Always** shown (web) |
| Login / signup | Password visibility toggles |
| Web Overview layout | Projects (~40%, h 400) \| Calendar (flex, min 340, h 400); **Kanban** below with `fillHeight` lanes |
| Project dashboards | **Deferred** — different flow from main Overview |

When in doubt, read the full section in `markdown/AGENTS.md` before changing routing, `dashboardStore.ts`, or `app/(tabs)/dashboard.tsx`.
