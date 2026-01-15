# Priority 3: Project Stages ✅ COMPLETE

> **Status:** ✅ COMPLETE  
> **Date:** January 14, 2026

---

## 🎯 Goal

Add "Maintenance" as a third project mode alongside Waterfall and Agile, with proper transitions and mode-specific views.

---

## 📋 Current State

Currently the app has two project types:
- **Waterfall** - Gantt charts, milestones, deliverables, sequential phases
- **Agile** - Kanban board, sprints, burndown charts, velocity tracking

---

## 🆕 What We're Adding

### Maintenance Mode
A third project type for ongoing support/maintenance work:
- Bug queue instead of sprint backlog
- Issue tracking focus (bugs, enhancements, support tickets)
- SLA/priority-based workflow
- No velocity/burndown (not sprint-based)
- Simpler dashboard focused on open issues

---

## 📋 Implementation Steps

### Step 1: Database & Types (~15 min)

**1.1 - Update Types**
- [ ] Add `'maintenance'` to project type options in `types/index.ts`
- [ ] Create `MaintenanceCategory` type: `'bug' | 'enhancement' | 'support' | 'other'`
- [ ] Add `category` field to Task type for maintenance classification

**1.2 - Database Migration**
- [ ] Create `supabase-maintenance-mode-migration.sql`:
  - Add `category` column to tasks table (for maintenance tickets)

---

### Step 2: Project Form Update (~20 min)

**2.1 - Mode Selector**
- [ ] Update `components/ProjectForm.tsx`:
  - Change from toggle to 3-option selector
  - Options: Waterfall, Agile, Maintenance
  - Add description for each mode
  - Style as segmented control or card selection

**2.2 - Mode Transition Warning**
- [ ] When switching modes on existing project:
  - Show confirmation modal
  - Explain what happens to existing data
  - "Your tasks will be preserved. Sprint data will be archived."

---

### Step 3: Maintenance Dashboard (~45 min)

**3.1 - Create MaintenanceDashboard Component**
- [ ] Create `components/dashboards/MaintenanceDashboard.tsx`:
  - Header with project health/stats
  - Issue queue by category (Bugs, Enhancements, Support)
  - Priority-sorted task list
  - Quick filters (by category, priority, status)

**3.2 - Dashboard Stats Cards**
- [ ] Open Issues count
- [ ] Critical/High priority count
- [ ] Resolved this week
- [ ] Average resolution time (placeholder)

**3.3 - Issue Queue View**
- [ ] Grouped by category with counts
- [ ] Collapsible sections
- [ ] Priority indicators
- [ ] Status badges

---

### Step 4: Task Form for Maintenance (~20 min)

**4.1 - Category Picker**
- [ ] Update `components/TaskForm.tsx`:
  - Show category picker when project is Maintenance type
  - Options: Bug, Enhancement, Support, Other
  - Icon + label for each category
  - Default to "Bug"

**4.2 - Hide Agile Fields**
- [ ] Hide project phase picker for Maintenance projects
- [ ] Keep priority, due date, assignee

---

### Step 5: Project Detail Integration (~20 min)

**5.1 - Update Project Detail Page**
- [ ] Add MaintenanceDashboard to view options
- [ ] Show correct dashboard based on project_type
- [ ] Update header badge to show "Maintenance"

**5.2 - Update Project Card**
- [ ] Show "Maintenance" badge for maintenance projects
- [ ] Use wrench/tools icon for maintenance

---

### Step 6: Mode Transitions (~20 min)

**6.1 - Transition Handler**
- [ ] Create helper function `handleProjectModeChange`:
  - Archive sprint data when switching from Agile
  - Clear project phases from tasks when switching from Agile
  - Set default category when switching to Maintenance

**6.2 - Transition Modal**
- [ ] Create confirmation modal for mode changes
- [ ] List what will happen
- [ ] "Keep" vs "Archive" options for existing data

---

## ⏱️ Estimated Timeline

| Step | Task | Est. Time |
|------|------|-----------|
| 1 | Database & Types | 15 min |
| 2 | Project Form Update | 20 min |
| 3 | Maintenance Dashboard | 45 min |
| 4 | Task Form for Maintenance | 20 min |
| 5 | Project Detail Integration | 20 min |
| 6 | Mode Transitions | 20 min |
| **Total** | | **~2.5 hours** |

---

## ✅ Success Criteria

1. [ ] Can create a new Maintenance project
2. [ ] Maintenance dashboard shows issue queue by category
3. [ ] Tasks in Maintenance projects have category field
4. [ ] Can switch existing project to Maintenance mode
5. [ ] Project cards show correct mode badge
6. [ ] Task form shows category picker for Maintenance projects

---

## 📁 Files to Create/Modify

### New Files
- `supabase-maintenance-mode-migration.sql`
- `components/dashboards/MaintenanceDashboard.tsx`

### Modified Files
- `types/index.ts`
- `lib/db/schema.ts`
- `lib/db/models/Task.ts`
- `store/taskStore.ts`
- `components/ProjectForm.tsx`
- `components/ProjectCard.tsx`
- `components/TaskForm.tsx`
- `app/project/[id].tsx`

---

## 🎨 Visual Design

### Mode Selector (Project Form)
```
┌─────────────────────────────────────────────────────────┐
│  Project Type                                           │
├─────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌─────────────┐         │
│  │ 📊        │  │ 🔄        │  │ 🔧          │         │
│  │ Waterfall │  │ Agile     │  │ Maintenance │         │
│  │           │  │           │  │             │         │
│  │ Sequential│  │ Sprints & │  │ Bug queue & │         │
│  │ phases    │  │ Kanban    │  │ issue track │         │
│  └───────────┘  └───────────┘  └─────────────┘         │
│       ○              ○              ●                   │
└─────────────────────────────────────────────────────────┘
```

### Maintenance Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  Project: Support Portal                    🔧 Maint.   │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Open     │ │ Critical │ │ Resolved │ │ Avg Time │   │
│  │    12    │ │    3     │ │    8     │ │   2.3d   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│  🐛 Bugs (5)                              [+ Add Bug]   │
│  ├─ Login timeout issue            P1 ● In Progress    │
│  ├─ Dashboard not loading          P2 ● To Do          │
│  └─ Export fails on large files    P3 ● To Do          │
│                                                         │
│  ✨ Enhancements (4)                                    │
│  ├─ Add dark mode toggle           P2 ● In Progress    │
│  └─ Improve search performance     P3 ● To Do          │
│                                                         │
│  🎧 Support (3)                                         │
│  └─ User cannot reset password     P1 ● To Do          │
└─────────────────────────────────────────────────────────┘
```

---

## ❓ Questions Before Starting

1. **Category Icons**: Use these icons?
   - 🐛 Bug
   - ✨ Enhancement  
   - 🎧 Support
   - 📋 Other

2. **Stats Calculation**: Should "Avg Resolution Time" be:
   - (A) Actually calculated from completed tasks
   - (B) Placeholder showing "Coming soon"

3. **Mode Transition**: When switching from Agile to Maintenance:
   - (A) Clear all project phases from tasks
   - (B) Keep phases but hide them in UI

---

## 🟡 Awaiting Your Sign-Off

Please review and answer the questions, then say **"approve"** to proceed!
