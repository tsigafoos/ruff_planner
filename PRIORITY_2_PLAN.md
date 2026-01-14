# Priority 2: Task Dependencies / Blocked By + Visual Mapping

> **Status:** ✅ COMPLETE  
> **Date:** January 14, 2026

---

## 🎯 Goal

Enable task dependencies with "blocked by" relationships, visual indicators, and a task mapping canvas for visualizing project workflows.

---

## 📋 Implementation Steps

### Step 1: Database & Type Updates (~30 min)

**1.1 - Database Migration**
- [ ] Create `supabase-task-dependencies-migration.sql`:
  - Add `assignee_id` column to tasks (UUID, references auth.users)
  - Add `blocked_by` column to tasks (JSONB array of task IDs)
  - Add index on `blocked_by` for query performance

**1.2 - Update TypeScript Types**
- [ ] Update `types/index.ts`:
  - Add `assigneeId?: string` to Task interface
  - Add `blockedBy?: string[]` to Task interface
- [ ] Update `lib/db/schema.ts` for WatermelonDB (native)
- [ ] Update `lib/db/models/Task.ts`

---

### Step 2: Task Store Updates (~45 min)

**2.1 - Add Assignee Support**
- [ ] Update `store/taskStore.ts`:
  - Handle `assignee_id` in createTask
  - Handle `assignee_id` in updateTask
  - Add `assignTask(taskId, userId)` helper

**2.2 - Add Blocked By Support**
- [ ] Update `store/taskStore.ts`:
  - Handle `blocked_by` in createTask/updateTask
  - Add `addBlocker(taskId, blockerTaskId)` helper
  - Add `removeBlocker(taskId, blockerTaskId)` helper
  - Add `getBlockingTasks(taskId)` - tasks that block this one
  - Add `getBlockedTasks(taskId)` - tasks blocked by this one

**2.3 - Auto-Unblock Logic**
- [ ] When a task is completed, check if it's blocking other tasks
- [ ] Emit notification/update for newly unblocked tasks

---

### Step 3: Task Form Updates (~30 min)

**3.1 - Assignee Picker**
- [ ] Update `components/TaskForm.tsx`:
  - Add assignee dropdown (for now, just current user)
  - Show user avatar/name in dropdown
  - Placeholder for future team members

**3.2 - Blocked By Multi-Select**
- [ ] Add "Blocked By" section to TaskForm:
  - Multi-select dropdown of tasks from same project
  - Show task titles in dropdown
  - Selected blockers shown as chips
  - Prevent circular dependencies (task can't block itself)

---

### Step 4: TaskCard Visual Indicators (~30 min)

**4.1 - Blocked Badge**
- [ ] Update `components/TaskCard.tsx`:
  - Show "Blocked by X" badge when task has blockers
  - Badge shows count of blocking tasks
  - Tooltip/press shows blocker task titles
  - Visual styling: amber/orange badge with lock icon

**4.2 - Assignee Display**
- [ ] Show assignee avatar/initials on TaskCard
- [ ] Position in top-right or meta section

**4.3 - Blocking Others Indicator**
- [ ] Small indicator if this task is blocking other tasks
- [ ] "Blocking X tasks" tooltip

---

### Step 5: Kanban Blocked Indicators (~30 min)

**5.1 - Agile Dashboard Updates**
- [ ] Update `components/dashboards/AgileDashboard.tsx`:
  - Tasks with unresolved blockers show blocked badge
  - Optional: Grey out blocked tasks slightly
  - Show "Waiting" indicator on blocked tasks

**5.2 - Dashboard Task Board**
- [ ] Update task board in `app/(tabs)/dashboard.tsx`:
  - Same blocked indicators as Kanban

---

### Step 6: Gantt Chart Dependencies (~45 min)

**6.1 - Dependency Arrows**
- [ ] Update `components/dashboards/WaterfallDashboard.tsx`:
  - Draw arrows from blocker task end to blocked task start
  - Finish-to-start relationship (default)
  - Arrow styling: curved or straight lines
  - Color coding: red for blocking, green for complete

**6.2 - Dependency Highlighting**
- [ ] Click task highlights its dependencies
- [ ] Show dependency chain on hover/select

---

### Step 7: Visual Task Mapping Canvas (~2 hours)

**7.1 - Create TaskMappingCanvas Component**
- [ ] Create `components/visualization/TaskMappingCanvas.tsx`:
  - Canvas area with pan/zoom support
  - Grid background for alignment

**7.2 - Task Nodes**
- [ ] Draggable task nodes from project tasks
- [ ] Node shows: title, status, priority color
- [ ] Different shapes for task types (if applicable)

**7.3 - Dependency Arrows**
- [ ] Draw arrows between connected tasks
- [ ] Click to add/remove dependency connections
- [ ] Arrow direction indicates dependency flow

**7.4 - Canvas Controls**
- [ ] Zoom in/out buttons
- [ ] Reset view button
- [ ] Auto-layout option (arrange tasks by dependencies)
- [ ] Toggle between Flowchart and Gantt-style views

**7.5 - Integration**
- [ ] Add "Task Map" tab/view in project detail
- [ ] Sync changes back to task dependencies

---

## ⏱️ Estimated Timeline

| Step | Task | Est. Time |
|------|------|-----------|
| 1 | Database & Types | 30 min |
| 2 | Task Store Updates | 45 min |
| 3 | Task Form Updates | 30 min |
| 4 | TaskCard Indicators | 30 min |
| 5 | Kanban Blocked Indicators | 30 min |
| 6 | Gantt Dependencies | 45 min |
| 7 | Task Mapping Canvas | 2 hours |
| **Total** | | **~5.5 hours** |

---

## ✅ Success Criteria

1. [ ] Tasks can have a single assignee
2. [ ] Tasks can be marked as "blocked by" other tasks
3. [ ] TaskCard shows blocked badge with blocker count
4. [ ] Kanban shows blocked indicators on task cards
5. [ ] Gantt chart shows dependency arrows
6. [ ] Task Mapping Canvas displays tasks as draggable nodes
7. [ ] Dependencies auto-sync between canvas and task data

---

## 📁 Files to Create/Modify

### New Files
- `supabase-task-dependencies-migration.sql`
- `components/visualization/TaskMappingCanvas.tsx`

### Modified Files
- `types/index.ts`
- `lib/db/schema.ts`
- `lib/db/models/Task.ts`
- `store/taskStore.ts`
- `components/TaskForm.tsx`
- `components/TaskCard.tsx`
- `components/dashboards/AgileDashboard.tsx`
- `components/dashboards/WaterfallDashboard.tsx`
- `app/(tabs)/dashboard.tsx`
- `app/project/[id].tsx`

---

## ❓ Questions Before Starting

1. **Assignee Scope**: For now, assignee is just current user (single-user mode). Should I add placeholder UI for future team members, or keep it minimal?

2. **Task Mapping Canvas Priority**: The canvas is complex (~2 hours). Should I:
   - (A) Build full canvas with both Flowchart and Gantt views
   - (B) Start with simpler Flowchart view only
   - (C) Defer canvas to later, focus on core dependency features first

3. **Circular Dependency Handling**: Should the system:
   - (A) Prevent circular dependencies entirely (Task A blocks B, B can't block A)
   - (B) Allow but warn about circular dependencies

---

## 🟡 Awaiting Your Sign-Off

Please review this plan and let me know:
- ✅ **Approve** - Proceed with implementation
- 🔄 **Revise** - Changes needed (specify what)
- ❌ **Hold** - Don't proceed yet

Also please answer the questions above so I can proceed correctly.
