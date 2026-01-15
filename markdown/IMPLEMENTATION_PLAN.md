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
- [x] Create `sql/supabase-project-phase-migration.sql` with:
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

## Phase 6: UI/UX Polish (Throughout) ✅ COMPLETE

> **Goal:** Maintain minimalist aesthetic across all changes

### Step 6.1: Color Consistency ✅
- [x] Added mood-based colors to theme (brainstorm, design, logic, polish, done)
- [x] Added priority colors (p1-p4) for consistent styling
- [x] Added status background colors (success, warning, error, info, neutral)
- [x] Improved dark mode with adjusted colors and contrast
- [x] Phase lane colors use pastel/muted variants (not saturated)

### Step 6.2: White Space & Layout ✅
- [x] TaskCard: Better spacing, status line indicator, improved meta section
- [x] ProjectCard: Progress bar, methodology badge, color accent line
- [x] Card component: Padding variants (none, small, medium, large)
- [x] Consistent border-radius (12px for cards, 8px for inputs/buttons)
- [x] Improved line heights for readability

### Step 6.3: Mobile Responsiveness ✅
- [x] Button: Size variants with platform-specific minHeight
- [x] Input: Size variants with adequate touch targets
- [x] TaskCard: hitSlop on checkbox and delete button
- [x] Platform-specific font sizes (slightly larger on mobile)
- [x] Minimum touch target heights (44-56px on mobile)

### Step 6.4: Component Enhancements ✅
- [x] Button: Added size, icon, danger variant, fullWidth options
- [x] Card: Added variant (default, elevated, outlined, flat) and padding options
- [x] Input: Added focus state, icon support, hint text, size variants

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

## Success Metrics ✅

- [x] Can create task and see it flow through Agile Kanban lanes
- [x] Waterfall dashboard shows clear project health at a glance
- [x] Burndown chart clearly shows on-track vs behind
- [x] Resources can be tagged and filtered by tags
- [x] Dark/light theme works consistently with mood colors
- [x] Mobile experience is usable (adequate touch targets, responsive sizing)

---

## Summary of Completed Work

### Phase 1: Foundation ✅
- Task status and project_phase fields added
- Database migrations created
- Store functions updated

### Phase 2: Waterfall Dashboard Polish ✅
- Summary cards with project health metrics
- Gantt chart with completion indicators and today marker
- Milestones with progress bar and status badges
- Risks with severity legend and color coding
- Deliverables with numbered list and status

### Phase 3: Agile Dashboard Redesign ✅
- Three-tier layout (overview, Kanban, insights)
- Functional Kanban with 5 phase lanes
- Web drag-and-drop with visual feedback
- Mobile tap-to-move and long-press options
- Enhanced burndown chart with trend indicators
- Sprint overview cards with key metrics

### Phase 4: Resources Enhancement ✅
- Tags field for resources
- Search and filter by name/tags
- Multi-select tag filter chips
- Tag editing modal
- Tag suggestions when creating/uploading

### Phase 5: Documentation Polish ✅
- 8 Mermaid templates + 3 Markdown templates
- Template grid with icons and descriptions
- Improved error handling with syntax hints
- Inline preview toggle in documentation list

### Phase 6: UI/UX Polish ✅
- Mood colors and priority colors in theme
- Enhanced TaskCard with status indicators
- Enhanced ProjectCard with progress bars
- Button/Card/Input components with variants
- Better touch targets and mobile responsiveness
