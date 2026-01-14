# BarkItDone Implementation Plan

> Based on Brainstorming Session: January 13, 2026  
> **Philosophy:** Build for solo first → scale to multi-user later. No bloat.

---

## Overview

This plan follows the energy-based, short sprint approach discussed. Each phase is broken into small, celebratable wins.

**Estimated Timeline:** 2-week sprint with flexible pacing

---

## Phase 1: Data Model Update (Foundation) ✅ COMPLETE

> **Goal:** Add `project_phase` field to enable Agile Kanban lanes without breaking Waterfall

### Step 1.1: Database Migration ✅
- [x] Create `supabase-project-phase-migration.sql` with:
  - Add `project_phase` column to `tasks` table (nullable string/enum)
  - Values: `brainstorm`, `design`, `logic`, `polish`, `done`, or `NULL`
  - Only used when `project_type = 'agile'`

### Step 1.2: Update TypeScript Types ✅
- [x] Update `types/index.ts` - Add `projectPhase` to Task interface
- [x] Update `lib/db/schema.ts` - Add project_phase to WatermelonDB schema
- [x] Update `lib/db/models/Task.ts` - Add projectPhase field

### Step 1.3: Update Task Store ✅
- [x] Update `store/taskStore.ts`:
  - Handle `project_phase` in createTask
  - Handle `project_phase` in updateTask
  - Add `updateTaskPhase()` helper for Kanban drag

### Step 1.4: Update Task Form ✅
- [x] Update `components/TaskForm.tsx`:
  - Show phase picker only for Agile projects
  - Default to `brainstorm` when creating task in Agile project

---

## Phase 2: Waterfall Dashboard Polish ✅ COMPLETE

> **Goal:** Polish the existing Waterfall dashboard (already further along)

### Step 2.1: Summary Cards Enhancement ✅
- [x] Review `components/dashboards/WaterfallDashboard.tsx`
- [x] Ensure summary cards show:
  - Total tasks / completed / remaining
  - Project health indicator (green/yellow/red)
  - Days remaining until deadline
  - Top risks count

### Step 2.2: Gantt Chart Polish ✅
- [x] Verify Gantt displays tasks with proper date ranges
- [x] Add subtle priority color coding
- [x] Ensure milestone markers are visible
- [x] Improve date labels readability
- [x] Add "Today" marker line
- [x] Add completion indicators

### Step 2.3: Risk & Milestone Sections ✅
- [x] Clean up risks display (top 5 with severity levels)
- [x] Add milestone progress indicators
- [x] Ensure deliverables section is clear with numbered items

---

## Phase 3: Agile Dashboard Redesign ✅ COMPLETE

> **Goal:** Implement three-tiered Agile dashboard with proper Kanban

### Step 3.1: Dashboard Layout Structure ✅
- [x] Redesign `components/dashboards/AgileDashboard.tsx` with three tiers:
  - **Top tier:** Sprint status cards (quick overview)
  - **Middle tier:** Kanban board (main focus)
  - **Bottom tier:** Insights (burndown, velocity - collapsible)

### Step 3.2: Kanban Board Implementation ✅
- [x] Create Kanban lanes for phases:
  - Brainstorm (pale lavender tint)
  - Design (soft blue)
  - Logic (soft green)
  - Polish (soft amber)
  - Done (gray)
- [x] Display tasks in correct lanes based on `project_phase`
- [x] Filter: Only show `in_progress` and `to_do` tasks in phase lanes
- [x] Completed tasks go to Done lane (status = completed)

### Step 3.3: Drag & Drop (Web) ✅
- [x] Implement drag between lanes (updates `project_phase`)
- [x] When dropped in Done → set status = `completed`, phase = `null`
- [x] Visual feedback during drag (highlighting, opacity)

### Step 3.4: Mobile Kanban (Simplified) ✅
- [x] Tap task → show "Move to next phase" button
- [x] Long-press → show all phase options via Alert

### Step 3.5: Burndown Chart ✅
- [x] Create enhanced burndown visualization:
  - Gray markers: Ideal burn rate
  - Colored bars: Actual remaining (blue=on track, red=behind)
  - Status badge: On Track / Behind
- [x] Summary stats: Total / Done / Remaining
- [x] Y-axis labels and grid lines
- [x] Today marker line

### Step 3.6: Sprint Overview Cards ✅
- [x] Sprint Health card with status
- [x] Progress percentage and task count
- [x] Velocity with trend indicator
- [x] Blocked items count

---

## Phase 4: Resources Enhancement ✅ COMPLETE

> **Goal:** Global user resources with tagging (not per-project)

### Step 4.1: Evaluate Current Resources ✅
- [x] Review `components/resources/ResourcesView.tsx`
- [x] Review `components/resources/ResourceCreator.tsx`
- [x] Identify what needs to change for global approach

### Step 4.2: Update Resource Model ✅
- [x] Resources already user-scoped (via user_id in storage paths)
- [x] Add tags field (array of strings)
- [x] Add created_at timestamp

### Step 4.3: Resource Tagging UI ✅
- [x] Add tag input when creating resources (ResourceCreator)
- [x] Add tag input when uploading files (Upload modal)
- [x] Tag-based filtering with multi-select chips
- [x] Search by tag or filename
- [x] Edit tags on existing resources via modal
- [x] Suggested tags from existing resources
- [x] Results count when filtering

### Step 4.4: Resource Linking (Deferred)
- [ ] Allow attaching resources to tasks (future enhancement)
- [ ] Allow attaching resources to projects (future enhancement)
- [ ] Same resource can be attached to multiple items
- [ ] Show linked resources in task/project views

> **Note:** Resource linking deferred to focus on core features first. Current tagging system provides organization without complex linking.

---

## Phase 5: Documentation Polish ✅ COMPLETE

> **Goal:** Improve document creation tools (Mermaid, charts, workflows)

### Step 5.1: Review Documentation Components ✅
- [x] Review `components/documentation/DocumentationEditor.tsx`
- [x] Review `components/documentation/MermaidRenderer.tsx`
- [x] Review `components/documentation/DocumentationView.tsx`
- [x] Identify UX improvements needed

### Step 5.2: Template Starters ✅
- [x] Add quick-start templates for Mermaid diagrams:
  - Flowchart template
  - Sequence diagram template
  - Class Diagram template
  - Gantt chart template
  - Pie chart template
  - State diagram template
  - ER Diagram template
  - Mind Map template
- [x] Add quick-start templates for Markdown:
  - Meeting Notes template
  - Feature Spec template
  - Daily Standup template
- [x] Template grid with icons and descriptions
- [x] One-click insert templates
- [x] "Start from scratch" option

### Step 5.3: Preview Improvements ✅
- [x] Better error handling for Mermaid with user-friendly messages
- [x] Syntax hints for common errors (parse errors, lexical errors, etc.)
- [x] "Show Raw Syntax" toggle for debugging
- [x] Quick syntax tips when content is empty
- [x] Improved themed chart colors
- [x] Inline preview toggle in DocumentationView
- [x] Fixed markdown rendering (was showing as plain text)
- [x] Expandable preview per documentation item

---

## Phase 6: UI/UX Polish (Throughout)

> **Goal:** Maintain minimalist aesthetic across all changes

### Step 6.1: Color Consistency
- [ ] Verify mood-based colors are subtle
- [ ] Ensure dark/light theme works with new components
- [ ] Phase lane colors: pale/muted (not saturated)

### Step 6.2: White Space & Layout
- [ ] Adequate spacing between sections
- [ ] Cards not too cramped
- [ ] Glanceable at a distance

### Step 6.3: Mobile Responsiveness
- [ ] Test all new components on mobile
- [ ] Ensure touch targets are adequate
- [ ] Simplified views where needed

---

## Implementation Order (Recommended)

1. **Phase 1** (Foundation) - Must do first
2. **Phase 2** (Waterfall Polish) - Already ahead, quick wins
3. **Phase 3** (Agile Dashboard) - Core feature work
4. **Phase 4** (Resources) - After dashboards stable
5. **Phase 5** (Documentation) - Final polish
6. **Phase 6** (UI/UX) - Ongoing throughout

---

## Notes

- **No AI/Connectors yet** - Focus on core experience first
- **Solo-first** - All features work for single user before team scaling
- **No formal subtasks** - Use rich-text checklists in notes instead
- **One truth, two lenses** - Same task data, different views (Kanban vs Gantt)

---

## Success Metrics

- [ ] Can create task and see it flow through Agile Kanban lanes
- [ ] Waterfall dashboard shows clear project health at a glance
- [ ] Burndown chart clearly shows on-track vs behind
- [ ] Resources can be tagged and linked to multiple projects
- [ ] Dark/light theme works consistently
- [ ] Mobile experience is usable (not just desktop)
