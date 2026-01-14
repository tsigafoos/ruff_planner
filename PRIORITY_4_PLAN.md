# Priority 4: Team & Collaboration Mode

> **Status:** 🟢 IN PROGRESS  
> **Date:** January 14, 2026  
> **Estimated Time:** 4-5 hours (can be split across sessions)

### Decisions Made:
- ✅ **Invite Links**: Short 8-char codes
- ✅ **Email**: Add email settings (SMTP/IMAP) in account settings
- ✅ **Multiple Teams**: Yes, users can be in multiple teams
- ✅ **Team Deletion**: Projects stay with owner, shares removed
- ✅ **Guest Upgrade**: Yes, prompt guests to create full account

---

## 🎯 Goal

Add team collaboration features including team creation, role-based permissions, project sharing with magic links, and invite management.

---

## 📋 Feature Breakdown

### Core Features:
1. **Account-wide Team Mode Toggle** - Enable/disable collaboration features
2. **Team Creation** - Create teams with name + note
3. **Role System** - Owner, Admin, Member, Guest with permissions
4. **Project Sharing** - Magic links with role picker
5. **Invite Management** - Track sent/pending/joined/expired invites
6. **Guest Flow** - Minimal registration via magic link

---

## 🗄️ Phase 1: Database Schema (30 min)

### New Tables:

```sql
-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  note TEXT,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members (who belongs to which team with what role)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Team invites (pending invitations)
CREATE TABLE team_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'guest')),
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Project sharing (links projects to teams)
CREATE TABLE project_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'commenter', 'editor', 'co_owner')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, team_id),
  UNIQUE(project_id, shared_with_user_id)
);
```

### Profile Updates:
```sql
-- Add team_mode_enabled to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_mode_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_team_id UUID REFERENCES teams(id);
```

### Indexes:
```sql
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_invites_token ON team_invites(token);
CREATE INDEX idx_team_invites_email ON team_invites(email);
CREATE INDEX idx_project_shares_project_id ON project_shares(project_id);
```

---

## 🔧 Phase 2: Types & Store Setup (30 min)

### New Types (`types/index.ts`):
```typescript
export type TeamRole = 'owner' | 'admin' | 'member' | 'guest';
export type ProjectShareRole = 'viewer' | 'commenter' | 'editor' | 'co_owner';
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Team {
  id: string;
  name: string;
  note?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: Date;
  // Populated fields
  user?: { email: string; firstName?: string; lastName?: string; avatar?: string };
}

export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  token: string;
  invitedBy: string;
  status: InviteStatus;
  createdAt: Date;
  expiresAt: Date;
}

export interface ProjectShare {
  id: string;
  projectId: string;
  teamId?: string;
  sharedWithUserId?: string;
  role: ProjectShareRole;
  createdAt: Date;
}
```

### New Store (`store/teamStore.ts`):
- `teams: Team[]`
- `currentTeam: Team | null`
- `members: TeamMember[]`
- `invites: TeamInvite[]`
- Actions: `createTeam`, `updateTeam`, `deleteTeam`
- Actions: `inviteMember`, `removeMember`, `updateMemberRole`
- Actions: `acceptInvite`, `revokeInvite`, `resendInvite`
- Actions: `shareProject`, `unshareProject`, `updateShareRole`

---

## ⚙️ Phase 3: Settings - Team Mode Toggle (30 min)

### Profile Screen Updates:
1. Add "Team Mode" section in profile/settings
2. Toggle switch: "Enable Team Mode"
3. When enabled, show:
   - Current team (if any)
   - "Create Team" button (if no team)
   - "Manage Team" button (if team exists)

### UI Component:
```
┌─────────────────────────────────────┐
│ 👥 Team Mode                        │
│ ─────────────────────────────────── │
│ [Toggle] Enable Team Mode           │
│                                     │
│ When enabled, you can:              │
│ • Create or join teams              │
│ • Share projects with team members  │
│ • Collaborate in real-time          │
│                                     │
│ [Create Team] or [Join Team]        │
└─────────────────────────────────────┘
```

---

## 👥 Phase 4: Team Creation & Management (45 min)

### Team Creation Modal:
- Team name (required)
- Team note/description (optional)
- Auto-add creator as Owner

### Team Management Screen:
```
┌─────────────────────────────────────┐
│ 🏢 My Team                    [Edit]│
│ ─────────────────────────────────── │
│ Team Name: "Acme Corp"              │
│ Note: "Main development team"       │
│                                     │
│ Members (4)                [+Invite]│
│ ┌─────────────────────────────────┐ │
│ │ 👤 John Doe      Owner     [···]│ │
│ │ 👤 Jane Smith    Admin     [···]│ │
│ │ 👤 Bob Wilson    Member    [···]│ │
│ │ 👤 guest@email   Guest     [···]│ │
│ └─────────────────────────────────┘ │
│                                     │
│ Pending Invites (2)                 │
│ ┌─────────────────────────────────┐ │
│ │ 📧 alice@email  Member  Pending │ │
│ │    [Resend] [Revoke]            │ │
│ │ 📧 charlie@... Admin   Expired  │ │
│ │    [Resend] [Remove]            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🔗 Phase 5: Invite System (45 min)

### Invite Flow:
1. Click "+ Invite" in team management
2. Enter email address
3. Select role (Admin, Member, Guest)
4. Generate magic link token
5. Copy link or send email (if email configured)

### Invite Modal:
```
┌─────────────────────────────────────┐
│ 📧 Invite Team Member               │
│ ─────────────────────────────────── │
│ Email: [________________________]   │
│                                     │
│ Role:                               │
│ ○ Admin - Manage members & roles    │
│ ● Member - Work on tasks & assign   │
│ ○ Guest - View and comment only     │
│                                     │
│ [Cancel]              [Send Invite] │
└─────────────────────────────────────┘
```

### Magic Link Format:
```
https://app.barkitdone.com/invite/{token}
```

### Accept Invite Page (`app/invite/[token].tsx`):
- Validate token
- If user logged in → auto-join team
- If user not logged in → show minimal signup (email only) or login
- Redirect to team/projects after joining

---

## 📂 Phase 6: Project Sharing (45 min)

### Share Button on Projects:
- Only visible when Team Mode enabled
- Opens share modal

### Share Modal:
```
┌─────────────────────────────────────┐
│ 🔗 Share Project                    │
│ ─────────────────────────────────── │
│ Share with Team: [My Team    ▼]     │
│ Role: [Editor ▼]                    │
│                                     │
│ ─── OR share with individual ───    │
│                                     │
│ Email: [________________________]   │
│ Role: [Viewer ▼]                    │
│                                     │
│ Currently shared with:              │
│ ┌─────────────────────────────────┐ │
│ │ 🏢 My Team      Editor   [Remove]│ │
│ │ 👤 bob@email    Viewer   [Remove]│ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel]                    [Share] │
└─────────────────────────────────────┘
```

### Role Permissions:
| Role | View | Comment | Edit Tasks | Edit Project | Manage Sharing |
|------|------|---------|------------|--------------|----------------|
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |
| Commenter | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editor | ✅ | ✅ | ✅ | ❌ | ❌ |
| Co-owner | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🛡️ Phase 7: Permission Checks (30 min)

### Update Stores:
Add permission checks to:
- `projectStore` - filter projects by access
- `taskStore` - check edit permissions before mutations

### Helper Functions:
```typescript
// lib/permissions.ts
export function canViewProject(userId: string, project: Project, shares: ProjectShare[]): boolean;
export function canEditProject(userId: string, project: Project, shares: ProjectShare[]): boolean;
export function canEditTask(userId: string, task: Task, project: Project, shares: ProjectShare[]): boolean;
export function canManageTeam(userId: string, team: Team, members: TeamMember[]): boolean;
```

---

## 📱 Phase 8: UI Integration (45 min)

### Sidebar Updates:
- Add "Team" section when Team Mode enabled
- Show team name and member count
- Quick link to team management

### Project List Updates:
- Show shared projects in a separate section or with badge
- Filter: "My Projects" | "Shared with Me" | "All"

### Header Updates:
- Team dropdown in TopNavbar (already has placeholder)
- Quick team switcher if user has multiple teams

---

## 📋 Implementation Order (Step by Step)

### Step 1: Database Migration
- [ ] Create `supabase-team-collaboration-migration.sql`
- [ ] Add all tables and indexes
- [ ] Update profiles table

### Step 2: Types
- [ ] Add Team, TeamMember, TeamInvite, ProjectShare types
- [ ] Add role types

### Step 3: Team Store
- [ ] Create `store/teamStore.ts`
- [ ] Implement CRUD for teams
- [ ] Implement member management
- [ ] Implement invite management

### Step 4: Profile/Settings UI
- [ ] Add Team Mode toggle to profile
- [ ] Update profileStore with team_mode_enabled

### Step 5: Team Creation
- [ ] Create TeamFormModal component
- [ ] Integrate with team store

### Step 6: Team Management View
- [ ] Create TeamManagementScreen
- [ ] Member list with role editing
- [ ] Invite list with actions

### Step 7: Invite System
- [ ] Create InviteModal component
- [ ] Generate magic link tokens
- [ ] Create invite accept page

### Step 8: Project Sharing
- [ ] Create ShareProjectModal
- [ ] Update project store for shared projects
- [ ] Add share button to project views

### Step 9: Permission System
- [ ] Create permissions helper
- [ ] Add checks to stores
- [ ] Update UI based on permissions

### Step 10: Polish & Testing
- [ ] Update sidebar for teams
- [ ] Add team badge to shared projects
- [ ] Test all flows

---

## ❓ Questions Before Starting

1. **Token Generation**: Use UUID or shorter alphanumeric codes for invite links?
   - Suggestion: Short codes (8-12 chars) for friendlier URLs

2. **Email Sending**: Should we integrate email now or just copy-link for MVP?
   - Suggestion: Copy-link for MVP, email later

3. **Multiple Teams**: Can a user be in multiple teams?
   - Suggestion: Yes, but one "default" team

4. **Team Deletion**: What happens to shared projects when team is deleted?
   - Suggestion: Projects stay with original owner, shares removed

5. **Guest Upgrade**: Should guests be prompted to create full account?
   - Suggestion: Yes, show banner in app

---

## 🚀 Ready to Start?

Answer the questions above and say **"approve"** to begin implementation!

We'll tackle this in phases, committing after each major step so progress is saved.
