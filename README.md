# BarkItDone - Minimalist Todoist Clone

A minimalist task management app built with Expo, React Native, and TypeScript. Features offline-first architecture with Supabase sync.

## Tech Stack

- **Expo** (latest) with React Native Web
- **TypeScript** (loose settings for gradual typing)
- **Expo Router** for file-based routing
- **Zustand** for state management
- **WatermelonDB** + expo-sqlite for offline-first database
- **Supabase** for auth, PostgreSQL backend, and realtime sync
- **NativeWind** (Tailwind CSS) for styling
- **date-fns** for date handling
- **expo-vector-icons** for icons

## Project Structure

```
app/
├── (tabs)/          # Main app screens (Inbox, Today, Upcoming, Projects, Labels)
├── auth/            # Authentication screens (Login, Signup)
└── _layout.tsx      # Root layout with auth routing

components/
├── ui/              # Reusable UI components (Button, Input, Card, etc.)
├── TaskCard.tsx     # Task display component
├── ProjectCard.tsx  # Project display component
├── QuickAdd.tsx     # Quick task creation
└── TaskForm.tsx     # Task creation/edit form

lib/
├── db/              # WatermelonDB schema and models
├── supabase/        # Supabase client and sync logic
└── utils/           # Utility functions

store/               # Zustand stores (tasks, projects, labels, auth, sync)
hooks/               # Custom hooks (useSync, useOffline)
types/               # TypeScript type definitions
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key
3. Create a `.env` file in the root directory:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Supabase Database

Create the following tables in your Supabase database:

**Projects Table:**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX projects_user_id ON projects(user_id);
```

**Tasks Table:**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  priority INTEGER NOT NULL DEFAULT 1,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  label_ids JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recurring_pattern TEXT
);

CREATE INDEX tasks_user_id ON tasks(user_id);
CREATE INDEX tasks_project_id ON tasks(project_id);
```

**Labels Table:**
```sql
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX labels_user_id ON labels(user_id);
```

**Enable Row Level Security (RLS):**

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for tasks and labels...
```

### 4. Enable Realtime (Optional)

In Supabase dashboard, enable Realtime for the tables you want to sync in real-time.

### 5. Run the App

```bash
# Start Expo
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Features Implemented

### ✅ Core Features
- User authentication (email/password + magic link)
- Offline-first database with WatermelonDB
- Task management (create, read, update, delete, complete)
- Project management
- Label management
- Basic sync with Supabase
- Responsive navigation (tabs for mobile, sidebar for web)

### 🔄 Partial/Future Enhancements
- Advanced filtering and sorting
- Drag & drop reordering
- Calendar view for upcoming tasks
- Subtasks and comments
- Recurring tasks
- Notifications
- Dark mode
- Export/Import
- Analytics

## Architecture

### Data Flow

```
User Action → Zustand Store → WatermelonDB (local) → Sync Queue → Supabase (when online)
                                                                    ↓
Supabase Realtime → Sync Store → WatermelonDB (local) → Zustand Store → UI Update
```

### Sync Strategy

1. **Offline-first**: All writes go to WatermelonDB immediately
2. **Background sync**: Sync queue processes changes when online
3. **Realtime updates**: Supabase Realtime pushes remote changes (when configured)
4. **Conflict resolution**: Last-write-wins (can be enhanced later)
5. **Optimistic updates**: UI updates immediately, sync happens in background

## Development Notes

- TypeScript is configured with loose settings for gradual typing
- You can use `any` types initially and add proper types incrementally
- The app uses file-based routing with Expo Router
- All data is stored locally first, then synced to Supabase

## Troubleshooting

### Database Errors
- Ensure WatermelonDB schema matches the database structure
- Check that all migrations are applied

### Sync Issues
- Verify Supabase credentials are correct
- Check network connectivity
- Review sync logs in console

### Build Issues
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## License

Private project
