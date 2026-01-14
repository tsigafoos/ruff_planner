# BarkItDone Implementation Plan

> Based on Brainstorming Session: January 13, 2026  
> **Philosophy:** Build for solo first → scale to multi-user later. No bloat.

---

## Overview

This plan follows the energy-based, short sprint approach discussed. Each phase is broken into small, celebratable wins.

**Estimated Timeline:** 2-week sprint with flexible pacing

---

## Phase 1: Data Model Update (Foundation)

> **Goal:** Add `project_phase` field to enable Agile Kanban lanes without breaking Waterfall

### Step 1.1: Database Migration
- [ ] Create `supabase-project-phase-migration.sql` with:
  - Add `project_phase` column to `tasks` table (nullable string/enum)
  - Values: `brainstorm`, `design`, `logic`, `polish`, `done`, or `NULL`
  - Only used when `project_type = 'agile'`

### Step 1.2: Update TypeScript Types
- [ ] Update `types/index.ts` - Add `projectPhase` to Task interface
- [ ] Update `lib/db/schema.ts` - Add project_phase to WatermelonDB schema
- [ ] Update `lib/db/models/Task.ts` - Add projectPhase field

### Step 1.3: Update Task Store
- [ ] Update `store/taskStore.ts`:
  - Handle `project_phase` in createTask
  - Handle `project_phase` in updateTask
  - Add `updateTaskPhase()` helper for Kanban drag

### Step 1.4: Update Task Form
- [ ] Update `components/TaskForm.tsx`:
  - Show phase picker only for Agile projects
  - Default to `brainstorm` when creating task in Agile project

---

## Phase 2: Waterfall Dashboard Polish

> **Goal:** Polish the existing Waterfall dashboard (already further along)

### Step 2.1: Summary Cards Enhancement
- [ ] Review `components/dashboards/WaterfallDashboard.tsx`
- [ ] Ensure summary cards show:
  - Total tasks / completed / remaining
  - Project health indicator (green/yellow/red)
  - Days remaining until deadline
  - Top risks count

### Step 2.2: Gantt Chart Polish
- [ ] Verify Gantt displays tasks with proper date ranges
- [ ] Add subtle priority color coding
- [ ] Ensure milestone markers are visible
- [ ] Improve date labels readability

### Step 2.3: Risk & Milestone Sections
- [ ] Clean up risks display (top 5 with severity)
- [ ] Add milestone progress indicators
- [ ] Ensure deliverables section is clear

---

## Phase 3: Agile Dashboard Redesign

> **Goal:** Implement three-tiered Agile dashboard with proper Kanban

### Step 3.1: Dashboard Layout Structure
- [ ] Redesign `components/dashboards/AgileDashboard.tsx` with three tiers:
  - **Top tier:** Sprint status cards (quick overview)
  - **Middle tier:** Kanban board (main focus)
  - **Bottom tier:** Insights (burndown, velocity - can be collapsed)

### Step 3.2: Kanban Board Implementation
- [ ] Create Kanban lanes for phases:
  - Brainstorm (pale lavender tint)
  - Design (soft blue)
  - Logic (soft green)
  - Polish (soft amber)
  - Done (gray)
- [ ] Display tasks in correct lanes based on `project_phase`
- [ ] Filter: Only show `in_progress` and `to_do` tasks in phase lanes
- [ ] Completed tasks go to Done lane (status = completed)

### Step 3.3: Drag & Drop (Web)
- [ ] Implement drag between lanes (updates `project_phase`)
- [ ] When dropped in Done → set status = `completed`, phase = `null`
- [ ] Visual feedback during drag

### Step 3.4: Mobile Kanban (Simplified)
- [ ] Tap task → show "Move to next phase" button
- [ ] Swipe gesture optional (future enhancement)

### Step 3.5: Burndown Chart
- [ ] Create stacked area chart component:
  - Gray line: Ideal burn rate
  - Colored area: Actual remaining
  - Show above/below ideal line clearly
- [ ] Side totals: Remaining points/tasks per day
- [ ] Keep it glanceable - no clutter

### Step 3.6: Sprint Overview Cards
- [ ] Sprint name and dates
- [ ] Tasks remaining / completed
- [ ] Velocity trend (simple up/down indicator)
- [ ] Days left in sprint

---

## Phase 4: Resources Enhancement

> **Goal:** Global user resources with tagging (not per-project)

### Step 4.1: Evaluate Current Resources
- [ ] Review `components/resources/ResourcesView.tsx`
- [ ] Review `components/resources/ResourceCreator.tsx`
- [ ] Identify what needs to change for global approach

### Step 4.2: Update Resource Model (if needed)
- [ ] Resources should be user-scoped (not project-scoped)
- [ ] Add tags field (array of strings)
- [ ] Allow linking resources to multiple projects/tasks

### Step 4.3: Resource Tagging UI
- [ ] Add tag input when uploading/creating resources
- [ ] Tag-based filtering in resource list
- [ ] Search by tag or filename

### Step 4.4: Resource Linking
- [ ] Allow attaching resources to tasks
- [ ] Allow attaching resources to projects
- [ ] Same resource can be attached to multiple items
- [ ] Show linked resources in task/project views

---

## Phase 5: Documentation Polish

> **Goal:** Improve document creation tools (Mermaid, charts, workflows)

### Step 5.1: Review Documentation Components
- [ ] Review `components/documentation/DocumentationEditor.tsx`
- [ ] Review `components/documentation/MermaidRenderer.tsx`
- [ ] Identify UX improvements needed

### Step 5.2: Template Starters
- [ ] Add quick-start templates for common diagrams:
  - Flowchart template
  - Sequence diagram template
  - Gantt template
- [ ] One-click insert templates

### Step 5.3: Preview Improvements
- [ ] Better live preview for Mermaid
- [ ] Syntax highlighting in editor
- [ ] Error messaging for invalid diagrams

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
