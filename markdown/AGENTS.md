# AGENTS.md - AI Agent Guidelines for BarkItDone

> **Guiding Principle**: "A minimalist project manager that only grows when you feed it. No features until you need them, then they bloom. Starts with a junk drawer—quick to-dos, nothing fancy. No chaos. No noise. Just bark when it's done."

## Project Overview

BarkItDone is a minimalist task management app built with Expo, React Native, and TypeScript. It features an offline-first architecture with Supabase sync, supporting both web and native mobile platforms.

### Core Philosophy

- **Minimalist by design**: Only add features when explicitly requested
- **Offline-first**: All writes go to local storage first, then sync to cloud
- **Cross-platform**: Single codebase for web, iOS, and Android via Expo
- **Gradual typing**: TypeScript with loose settings - types can be added incrementally

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Expo** (~54.0) | React Native framework with web support |
| **TypeScript** | Type safety (loose mode enabled) |
| **Expo Router** | File-based routing |
| **Zustand** | State management |
| **WatermelonDB** | Offline-first database (native) |
| **expo-sqlite** | SQLite for native platforms |
| **Supabase** | Auth, PostgreSQL backend, and sync |
| **NativeWind/Tailwind** | Styling |
| **date-fns** | Date handling |

## Project Structure

```
app/                    # Expo Router screens
├── (tabs)/             # Main tab screens (dashboard, tasks, calendar, etc.)
├── auth/               # Authentication screens (login, signup)
├── project/            # Project detail screens
├── _layout.tsx         # Root layout with auth routing
└── index.tsx           # Entry point

components/             # React components
├── ui/                 # Reusable UI primitives (Button, Input, Card, etc.)
├── dashboards/         # Agile/Waterfall dashboard views
├── documentation/      # Mermaid/Markdown editors
├── layout/             # TopBar, WebLayout, Sidebar
├── resources/          # File upload/resource management
├── team/               # Team management components
├── TaskCard.tsx        # Task display
├── ProjectCard.tsx     # Project display
├── TaskForm.tsx        # Task creation/editing
└── QuickAdd.tsx        # Quick task creation ("junk drawer")

lib/
├── db/                 # WatermelonDB schema and models
│   ├── index.native.ts # Native database setup
│   ├── index.web.ts    # Web database (Supabase direct)
│   ├── schema.ts       # Database schema
│   └── models/         # WatermelonDB model definitions
└── supabase/           # Supabase client and sync logic
    ├── client.ts       # Supabase client configuration
    ├── auth.ts         # Authentication helpers
    └── sync.ts         # Sync logic

store/                  # Zustand stores
├── authStore.ts        # Authentication state
├── taskStore.ts        # Task CRUD operations
├── projectStore.ts     # Project management
├── labelStore.ts       # Label management
├── profileStore.ts     # User profile
├── syncStore.ts        # Sync status
└── themeStore.ts       # Dark/light theme

types/                  # TypeScript type definitions
hooks/                  # Custom React hooks
constants/              # App constants (Colors, etc.)
```

## Coding Conventions

### TypeScript

- **Loose mode enabled**: `strict: false`, `noImplicitAny: false`
- Use `any` when type complexity would slow development
- Add proper types incrementally as the codebase matures
- Interface names: `PascalCase` (e.g., `TaskStore`, `Project`)

### State Management (Zustand)

```typescript
// Pattern for Zustand stores
export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  
  fetchTasks: async (userId: string) => {
    set({ loading: true });
    try {
      // Platform-specific logic
      if (Platform.OS === 'web') {
        // Use Supabase directly
      } else {
        // Use WatermelonDB
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
```

### Platform-Specific Code

The app uses different data strategies per platform:

```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Direct Supabase calls
  const { data, error } = await supabase.from('tasks').select('*');
} else {
  // WatermelonDB for offline-first
  const tasksCollection = database.get('tasks');
  const tasks = await tasksCollection.query().fetch();
}
```

### Database Field Naming

| JavaScript (camelCase) | Database (snake_case) |
|------------------------|----------------------|
| `userId` | `user_id` |
| `projectId` | `project_id` |
| `dueDate` | `due_date` |
| `createdAt` | `created_at` |
| `labelIds` | `label_ids` |
| `completedAt` | `completed_at` |

### Styling

- Use **Tailwind CSS** classes via NativeWind
- Global styles in `global.css`
- Theme colors defined in `constants/Colors.ts` and `store/themeStore.ts`
- Prefer `className` prop for styling

```tsx
<View className="flex-1 bg-background p-4">
  <Text className="text-foreground text-lg font-bold">Title</Text>
</View>
```

## Architecture Patterns

### Data Flow

```
User Action → Zustand Store → Local DB (WatermelonDB) → Sync Queue → Supabase
                                                                        ↓
Supabase Realtime → Sync Store → Local DB → Zustand Store → UI Update
```

### Sync Strategy

1. **Offline-first**: All writes go to WatermelonDB immediately (native)
2. **Web direct**: Web platform writes directly to Supabase
3. **Background sync**: Sync queue processes changes when online
4. **Conflict resolution**: Last-write-wins (simple strategy)

### File Organization

- `.web.ts` / `.web.tsx` - Web-specific implementations
- `.native.ts` / `.native.tsx` - Native-specific implementations
- No suffix - Shared code

## Key Files to Understand

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout, auth routing logic |
| `store/taskStore.ts` | Core task CRUD operations pattern |
| `lib/supabase/client.ts` | Supabase client configuration |
| `lib/db/schema.ts` | WatermelonDB schema definition |
| `components/ui/` | Reusable UI component library |
| `global.css` | Tailwind CSS configuration |

## Development Commands

```bash
npm install          # Install dependencies
npm start            # Start Expo dev server
npm run web          # Run on web
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run build:web    # Build for web deployment
```

## Environment Variables

Required in `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Migrations

SQL migrations are stored in `sql/` directory with naming pattern:
- `sql/supabase-*.sql` - Various database setup scripts

Key migrations:
- `sql/supabase-setup.sql` - Core tables (projects, tasks, labels)
- `sql/supabase-project-migration.sql` - Project enhancements
- `sql/supabase-task-status-migration.sql` - Task status field
- `sql/supabase-team-management-migration.sql` - Team features

## Testing

- Test files in `components/__tests__/`
- Currently minimal test coverage
- Run tests: `npm test` (if configured)

## Common Pitfalls to Avoid

1. **Don't forget platform checks**: Always consider both web and native paths
2. **Database field casing**: Use snake_case for Supabase, camelCase for JS
3. **Array fields**: `label_ids` is JSONB in Supabase, may need JSON.parse()
4. **Date handling**: Use `date-fns` for consistency, store as ISO strings
5. **Avoid over-engineering**: Follow the minimalist philosophy

## When Making Changes

### Before implementing:
1. Check if the feature aligns with minimalist philosophy
2. Understand the platform-specific patterns (web vs native)
3. Review relevant Zustand store for state patterns
4. Check existing UI components before creating new ones

### Implementation checklist:
- [ ] Handle both web and native platforms if applicable
- [ ] Use existing Zustand store patterns
- [ ] Follow snake_case for database, camelCase for JS
- [ ] Use Tailwind classes for styling
- [ ] Add proper error handling with console.error
- [ ] Update local state optimistically when appropriate

### After implementing:
- [ ] Test on web platform
- [ ] Verify no TypeScript errors (loose mode, but avoid obvious issues)
- [ ] Ensure sync behavior is correct

## Overview & main dashboard (standardized — read before changing)

This section records **product decisions and implementation status** for the main **Overview** experience and related navigation. It reflects explicit standardization work (auth landing, dashboard store semantics, web chrome, layout). **Do not regress these without an intentional product change.**

### Terminology

| Term | Meaning |
|------|--------|
| **Overview** | The default **main** workspace view: projects list, mini calendar (web), and Kanban by status. Implemented as `app/(tabs)/dashboard.tsx` when `insightsTab === 'overview'`. **Not** a persisted `DashboardLayout` row in `dashboardStore`. |
| **Custom dashboard** | A user-created **global** layout (`scope: 'global'`) with widget lanes, edited in the dynamic dashboard UI. Shown as tabs to the right of Overview. |
| **Project dashboard** | Layouts with `scope: 'project'` and `projectId` — **different flow** from main Overview tabs; do not merge UX with global Overview until designed. |

### Landing & redirects (status: **done**)

- **After login / signup / leaving auth / logged-in index**: navigate to **`/(tabs)/dashboard`** (Overview), **not** `/(tabs)/projects`.
- **Top navbar** logo/title: `/(tabs)/dashboard`.
- **Native tabs**: `app/(tabs)/_layout.tsx` uses `initialRouteName="dashboard"` so the tab group defaults to Overview when applicable.
- **Files**: `app/index.tsx`, `app/_layout.tsx`, `app/auth/login.tsx`, `app/auth/signup.tsx`, `components/layout/TopNavbar.tsx`.

### `dashboardStore` semantics (status: **done**)

- **No auto-seeded** “Home” dashboard on first load (empty `localStorage` → `dashboards: []`, `currentDashboard: null`, `activeDashboardId: null`).
- **`loadDashboards`** (when data exists): restores `dashboards` from storage but sets **`currentDashboard: null`** and **`activeDashboardId: null`** so the app does **not** auto-open a custom tab; **Overview remains the default** until the user picks a tab.
- **`deleteDashboard`**: if the deleted layout was active, clear to **`null`**, not `dashboards[0]`.
- **`getHomeDashboard()`**: returns **`null`** — the “home” concept for the main app is **Overview**, not a stored layout.
- **`DashboardLayout.isDefault`**: treated as **legacy**; see comment on `types/index.ts`.

### Insights / Overview chrome — web (status: **done**)

- **`PageWrapper`**: `hideHeader={true}` on web for this screen so the large PageHeader strip is omitted; toolbar lives in the tab row.
- **Tab row**: **Overview** (first) → global custom dashboards (sorted by `order`) → **trailing `+`** opens `DashboardCreationModal`.
- **Actions**: **Add Task** and **Add Project** in the chrome are both **primary** (blue fill, white **plus** icon); on native, same via `PageWrapper` actions.
- **Sidebar**: **“Insights”** nav item **removed**; **“Create Dash”** triggers create flow and navigates to the dashboard route.
- **Account menu** (`TopNavbar`): link label **Overview** → `/(tabs)/dashboard`.

### Overview layout — web (status: **done**)

- **Top row**: `flexDirection: 'row'`, **`alignItems: 'flex-start'`** (projects + calendar top-aligned).
- **Projects column**: ~**40%** width, **`maxWidth: 400`**, fixed **`height: 400`**; inner list `ScrollView` uses **`flex: 1`** inside the column.
- **Calendar column**: **`flex: 1`**, **`minWidth: 340`**, **`height: 400`**; **`MiniCalendar`** uses **`containerStyle`**, **`width: '100%'`**, and flex fill so it is not a fixed 280px strip or bottom-aligned.
- **Below the row**: **Kanban** section (header label **Kanban**); horizontal lane scroller with **`minHeight: ~400`**; **`StatusLane`** accepts optional **`fillHeight`** (Overview passes **400** on web) so lanes do not collapse inside the horizontal `ScrollView`.

### Auth screens (status: **done**)

- **Login** and **signup**: **Show / hide password** toggles (`@expo/vector-icons/FontAwesome`, `eye` / `eye-slash`), accessibility labels, `secureTextEntry` toggled.

### Team in top bar (status: **done**)

- **`TopNavbar`**: **Team** dropdown is **always** rendered on web (do not hide behind `profile.team_mode_enabled` unless product changes again).

### Deferred / out of scope (explicit)

- **Project-scoped dashboards** on project pages: **separate UX flow** from main Overview + global custom tabs — **not** unified in this pass.

### Regression checklist for agents

When touching Overview or `dashboardStore`:

1. Confirm post-auth still lands on **`/(tabs)/dashboard`**.
2. Confirm **`loadDashboards`** does not set active global dashboard on load.
3. Confirm web Overview still shows **Kanban** below projects/calendar with non-zero lane height on web.
4. Do not reintroduce sidebar **Insights** or **Create custom** label without product sign-off.

---

## Feature Status Reference

See `markdown/BARKITDONE_STATUS_REPORT.md` for detailed feature completion status.

**Implemented (>80%):**
- Task management (CRUD, priorities, statuses, labels)
- Project management (waterfall/agile, objectives, risks)
- Dashboards (Gantt, Kanban, Agile/Waterfall views)
- Calendar views (day, week, month)
- Documentation (Mermaid, Markdown)
- Resource management (file uploads)
- Authentication and profiles

**Not Implemented (0%):**
- Voice input/notes
- AI/LLM features
- External integrations (Slack, Teams)
- Multi-user collaboration

## Additional Documentation

- `markdown/README.md` - Project overview and setup
- `markdown/SETUP_GUIDE.md` - Detailed setup instructions
- `markdown/HOSTING_GUIDE.md` - Deployment information
- `markdown/TROUBLESHOOTING.md` - Common issues and solutions
- `markdown/WATERMELONDB_SETUP.md` - Offline database setup
