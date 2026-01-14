# BarkItDone Testing Checklist

> **Testing Guide for All Features Implemented in the Brainstorming Session**
> 
> Use this checklist to verify all new functionality works correctly across web and mobile platforms.

---

## Prerequisites

- [ ] App builds without errors: `npm run web` or `npx expo start`
- [ ] Logged in with a valid user account
- [ ] Have at least one Agile project and one Waterfall project created
- [ ] Have some tasks in each project (mix of completed and pending)

---

## Phase 1: Foundation (Data Model)

### Task Status Field
- [ ] Create a new task - verify it defaults to `to_do` status
- [ ] Edit a task and change status to `in_progress`
- [ ] Edit a task and change status to `blocked`
- [ ] Edit a task and change status to `on_hold`
- [ ] Complete a task - verify status changes to `completed`
- [ ] Verify status persists after page refresh

### Project Phase Field (Agile Only)
- [ ] Create a task in an Agile project - verify phase picker appears
- [ ] Verify phase defaults to `brainstorm` for new tasks
- [ ] Change phase to `design` - verify it saves
- [ ] Change phase to `logic` - verify it saves
- [ ] Change phase to `polish` - verify it saves
- [ ] Change phase to `done` - verify status auto-changes to `completed`
- [ ] Create a task in a Waterfall project - verify NO phase picker appears

---

## Phase 2: Waterfall Dashboard

### Summary Cards (Top Section)
- [ ] **Project Health card** displays (Healthy/At Risk/Critical)
- [ ] **Task Progress card** shows correct count and progress bar
- [ ] **Days Remaining card** shows correct calculation
- [ ] **Risks card** shows count with color-coded severity
- [ ] Cards update when tasks are completed

### Gantt Chart
- [ ] Tasks display as horizontal bars on timeline
- [ ] **Priority colors** match legend (P1=green, P2=blue, P3=amber, P4=red)
- [ ] **Today marker** (vertical line) appears at correct position
- [ ] **Completed tasks** show:
  - [ ] Check icon next to title
  - [ ] Strikethrough on title text
  - [ ] Faded/semi-transparent bar
- [ ] Date axis shows start and end dates
- [ ] Scrolling works if many tasks

### Milestones Section
- [ ] Milestones display in numbered list
- [ ] Progress bar shows overall milestone completion
- [ ] Status badges show (Complete/In Progress/Upcoming)
- [ ] Status badges have correct colors (green/blue/gray)

### Risks Section
- [ ] Severity legend displays (High/Medium/Low)
- [ ] Risks show with color-coded badges
- [ ] Risk icons match severity (warning triangle)
- [ ] "+X more" indicator shows if >5 risks

### Deliverables Section
- [ ] Deliverables display in numbered list
- [ ] Checkbox icons show completion status
- [ ] Estimated completion status displays

---

## Phase 3: Agile Dashboard

### Three-Tier Layout
- [ ] **Top tier**: Sprint overview cards visible
- [ ] **Middle tier**: Kanban board is main focus
- [ ] **Bottom tier**: Burndown chart (collapsible)

### Sprint Overview Cards
- [ ] **Sprint Health** card with status indicator
- [ ] **Progress** card with percentage and task count
- [ ] **Velocity** card with trend indicator (↑/↓/→)
- [ ] **Blocked** card with count (red if >0)

### Kanban Board - Lanes
- [ ] **5 lanes display**: Brainstorm, Design, Logic, Polish, Done
- [ ] Each lane has distinct header color
- [ ] Task count shows in each lane header
- [ ] "+" button in each lane header works
- [ ] Tasks appear in correct lanes based on `projectPhase`

### Kanban Board - Task Cards
- [ ] Task title displays
- [ ] Priority badge with color
- [ ] Due date displays (if set)
- [ ] Blocked indicator shows (if status=blocked)
- [ ] Completed tasks appear in Done lane

### Web Drag & Drop
- [ ] Can drag task card (cursor changes, opacity reduces)
- [ ] Lane highlights when dragging over it
- [ ] Dropping in new lane updates task phase
- [ ] Dropping in Done lane:
  - [ ] Sets phase to `done`
  - [ ] Sets status to `completed`
- [ ] Drag cancelled if dropped outside lanes
- [ ] UI updates immediately after drop

### Mobile Tap-to-Move
- [ ] Tap task shows phase navigation buttons
- [ ] "← Previous" button moves to previous phase
- [ ] "Next →" button moves to next phase
- [ ] Long-press shows all phase options in Alert
- [ ] Selecting phase from Alert updates task

### Burndown Chart
- [ ] Chart displays with Y-axis (task count)
- [ ] X-axis shows day markers (Day 1, Day 7, Day 14)
- [ ] Gray markers show ideal burn rate
- [ ] Blue bars show actual remaining (on track)
- [ ] Red bars show actual remaining (behind)
- [ ] **Today indicator** line appears
- [ ] Status badge shows "On Track" or "Behind"
- [ ] Summary stats show (Total/Done/Remaining)

---

## Phase 4: Resources Enhancement

### Search & Filter Bar
- [ ] Search input appears above resource list
- [ ] Search icon visible in input
- [ ] Typing filters resources by name
- [ ] Typing filters resources by tag
- [ ] Clear button (X) appears when text entered
- [ ] Clicking clear resets search

### Tag Filter Chips
- [ ] Tag chips appear if resources have tags
- [ ] Clicking chip toggles selection (changes color)
- [ ] Multiple chips can be selected
- [ ] Resources filter to show only matching tags
- [ ] "Clear all" button appears when filters active
- [ ] Results count shows "X of Y resources"

### Resource Tagging
- [ ] **Tag edit button** (tag icon) on each resource
- [ ] Clicking opens tag edit modal
- [ ] Modal shows resource name
- [ ] Comma-separated tag input works
- [ ] Suggested tags appear (from existing tags)
- [ ] Clicking suggested tag adds it
- [ ] Saving tags updates resource
- [ ] Tags appear on resource item (max 3 shown)
- [ ] "+X more" shows if >3 tags

### Create Resource with Tags
- [ ] Tags input appears in ResourceCreator header
- [ ] Tag suggestions show existing tags
- [ ] Tags saved with new resource

### Upload Files with Tags
- [ ] Tags input appears in upload modal
- [ ] Tag suggestions show existing tags
- [ ] Uploaded files include tags

### Empty/Filtered States
- [ ] "No resources yet" shows when empty
- [ ] "No matching resources" shows when filter has no results
- [ ] "Clear filters" button works

---

## Phase 5: Documentation Polish

### Template Selection (New Document)
- [ ] Template grid appears for new documents
- [ ] Templates show icon, name, description

### Mermaid Templates (8 total)
- [ ] Flowchart template works
- [ ] Sequence diagram template works
- [ ] Class Diagram template works
- [ ] Gantt chart template works
- [ ] Pie chart template works
- [ ] State diagram template works
- [ ] ER Diagram template works
- [ ] Mind Map template works
- [ ] Clicking template populates content
- [ ] Title auto-fills with template name

### Markdown Templates (3 total)
- [ ] Meeting Notes template works
- [ ] Feature Spec template works
- [ ] Daily Standup template works
- [ ] Date auto-populates in templates

### Template UI
- [ ] "Start from scratch" link works
- [ ] Templates hidden when editing existing doc
- [ ] "Templates" button shows when content empty
- [ ] Switching type shows relevant templates

### Syntax Hints
- [ ] Quick syntax tips show for empty Mermaid content
- [ ] Tips include node shapes and arrow syntax

### Mermaid Error Handling
- [ ] Invalid syntax shows error container
- [ ] Error message is user-friendly
- [ ] **Hint section** with fix suggestion
- [ ] "Show Raw Syntax" toggle works
- [ ] Error details (technical) shown at bottom
- [ ] Fixing syntax and re-rendering works

### Documentation View
- [ ] Documents list in card-based layout
- [ ] Type icon shows (sitemap/file-text/file)
- [ ] **Eye icon** toggles preview
- [ ] Preview expands inline
- [ ] Mermaid renders in preview
- [ ] Markdown renders properly (not plain text)
- [ ] Collapse preview works
- [ ] Download button works
- [ ] Edit button opens editor
- [ ] Delete button removes document

---

## Phase 6: UI/UX Polish

### Theme - Mood Colors
- [ ] Toggle to dark mode - verify it works
- [ ] Toggle to light mode - verify it works
- [ ] Colors adjust appropriately for each mode

### TaskCard Improvements
- [ ] **Status line** on left edge (colored by status)
- [ ] Completed tasks:
  - [ ] Strikethrough on title
  - [ ] Reduced opacity
  - [ ] Green status line
- [ ] Blocked tasks show "Blocked" badge
- [ ] **Overdue dates** highlighted in red
- [ ] Priority badge uses theme priority colors
- [ ] Checkbox touch target adequate (try tapping edge)
- [ ] Delete button touch target adequate

### ProjectCard Improvements
- [ ] **Color accent line** on left edge
- [ ] **Methodology badge** shows (Agile/Waterfall)
- [ ] **Progress bar** appears if tasks exist
- [ ] Progress percentage displays
- [ ] "No tasks yet" shows for empty projects
- [ ] Chevron indicator on right

### Button Component
- [ ] Primary variant (blue background, white text)
- [ ] Secondary variant (border, gray background)
- [ ] Ghost variant (transparent)
- [ ] Danger variant (red background) - if used anywhere
- [ ] Size: small (compact)
- [ ] Size: medium (default)
- [ ] Size: large (prominent)
- [ ] Loading state shows spinner
- [ ] Disabled state reduces opacity

### Card Component
- [ ] Default variant (border, white background)
- [ ] Elevated variant (shadow, no border)
- [ ] Outlined variant (border only, transparent)
- [ ] Flat variant (gray background, no border)

### Input Component
- [ ] Focus state shows blue border
- [ ] Error state shows red border + icon
- [ ] Hint text shows below input
- [ ] Icon support (if used)
- [ ] Size variants work

### Mobile Responsiveness
- [ ] Test on mobile viewport (Chrome DevTools or real device)
- [ ] Touch targets are at least 44px
- [ ] Text is readable without zooming
- [ ] Kanban lanes scroll horizontally on mobile
- [ ] Forms are usable on small screens

---

## Cross-Cutting Concerns

### Data Persistence
- [ ] All changes persist after page refresh
- [ ] Logging out and back in shows saved data
- [ ] Web and mobile show same data (sync works)

### Performance
- [ ] Dashboard loads in <3 seconds
- [ ] Kanban drag-drop is smooth
- [ ] No visible lag when completing tasks
- [ ] Resource filtering is instant

### Error Handling
- [ ] Network error shows user-friendly message
- [ ] Invalid data entry shows validation errors
- [ ] App doesn't crash on unexpected data

---

## Browser/Platform Testing

### Web Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile (if applicable)
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Expo Go app

---

## Accessibility

- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are visible
- [ ] Color contrast is sufficient (use browser inspector)
- [ ] Screen reader can navigate main elements

---

## Test Completion Sign-off

| Tester | Date | Platform | Pass/Fail | Notes |
|--------|------|----------|-----------|-------|
|        |      |          |           |       |

---

## Known Issues / Bugs Found

| Issue | Severity | Phase | Status |
|-------|----------|-------|--------|
|       |          |       |        |

---

## Notes

- This checklist covers all features implemented in the brainstorming session phases
- Some features may require database migrations to be run first
- Test in both light and dark modes where applicable
- Mobile testing can use Chrome DevTools device emulation or real devices
