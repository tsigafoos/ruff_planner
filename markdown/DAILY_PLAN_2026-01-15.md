# Daily Plan - January 15, 2026
## BarkItDone Development Sprint

> Based on morning brainstorming session transcription

---

## Today's Mission

Transform BarkItDone from a collection of hard-coded pages into a component-driven, dynamic dashboard system. Fix the core UX issues and lay the groundwork for a production-ready product.

---

## Priority 1: Full Component Sweep (Target: Morning)

### Goal
Extract ALL reusable UI elements into standalone components. This is the foundation for everything else today.

### Components to Extract/Create

| Component Name | Description | Used In |
|---------------|-------------|---------|
| `TaskCard` | Individual task display with status, priority, dates | Dashboard, Kanban, Task lanes |
| `TaskLane` | Status-based task container (horizontal scroll fix!) | Dashboard, Status views |
| `DragHandle` | Individual task drag handler (NOT whole lane) | Kanban, Task lanes |
| `KanbanColumn` | Single Kanban column with header + task list | Agile dashboard |
| `StatusLane` | Horizontal status-based lane | Dashboard, Status views |
| `GanttChart` | Gantt visualization block | Waterfall dashboard |
| `BurndownChart` | Sprint burndown visualization | Agile dashboard |
| `InfoCard` | Metric display card (title + number) | All dashboards |
| `ProjectCard` | Project summary card | Projects list, Home |
| `ChartWrapper` | Generic chart container | All dashboards |
| `CalendarWidget` | Task calendar display | Calendar view, Dashboard |
| `TeamWidget` | Team member display/actions | Team views |

### Critical Fixes During Sweep

1. **Task Lane Overflow Bug**
   - Lanes overflow off screen with no horizontal scroll
   - Fix: Proper `overflow-x-auto` on container, not individual items

2. **Drag-and-Drop Bug**
   - Currently grabs entire lane/block instead of individual task
   - Fix: Attach drag handlers to TaskCard, not lane container
   - Kanban works (card-to-column), but task lanes broken

3. **Front Page Button Mess**
   - Too many buttons, looks amateur
   - Fix: Extract into clean navigation components

### Acceptance Criteria
- [ ] Every repeated UI element is now a reusable component
- [ ] Horizontal scrolling works on all task lanes
- [ ] Drag-and-drop grabs individual tasks, not whole lanes
- [ ] Changes in one component reflect everywhere
- [ ] No duplicate code blocks across pages

---

## Priority 2: Dynamic Dashboard System (Target: Late Morning)

### Goal
Replace hard-coded dashboard layouts with a configurable, drag-and-drop dashboard builder.

### Layout Engine Design

```
┌─────────────────────────────────────────────────────────────┐
│ [Edit Dashboard]                              [Reset Layout] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│ │      Widget A           │ │        Widget B             │ │
│ │      (50% width)        │ │        (50% width)          │ │
│ └─────────────────────────┘ └─────────────────────────────┘ │
│ ┌───────────────────────────────────────────────────────────┤
│ │                    Widget C (100% width)                  │ │
│ └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Templates

| Template | Default Widgets | Use Case |
|----------|----------------|----------|
| Agile | Kanban, Burndown, Sprint Stats, Team Capacity | Scrum/Sprint teams |
| Waterfall | Gantt, Milestones, Risks, Deliverables | Sequential projects |
| Maintenance | Bug Queue, Issue Categories, SLA Stats | Support/Ops |
| Blank | Empty grid | Custom setups |

### Widget Catalog

**Must Build Today:**
1. **Gantt Card** - Already exists, extract as widget
2. **Task Dependency Flowchart** - Visual blocked-by relationships
3. **Task Calendar** - Calendar with task dots
4. **Kanban Drag Lanes** - 5-column Kanban board
5. **Status Drag Lane** - Horizontal status lanes
6. **Info Cards Block** - Configurable: horizontal, vertical, or grid
   - Title + 5 metrics per card
   - Task count, done count, to-do count, overdue, blocked

**Build Today (Basic Version):**
7. **Quick Add Team Widget** - Supervisory team actions
8. **Team Waiting List Widget** - Who's waiting on what
   - Name, task waiting on, due time
   - "Mark Done" or "Assign to Me" buttons
   - Clean scrollable list, no alerts/popups

**Placeholder for Later:**
9. **Team Production Widget** - Who did what, who's stuck, who's idle

### Data Model

```typescript
interface DashboardLayout {
  id: string;
  name: string;
  template: 'agile' | 'waterfall' | 'maintenance' | 'custom';
  rows: DashboardRow[];
}

interface DashboardRow {
  id: string;
  widgets: DashboardWidget[];
}

interface DashboardWidget {
  id: string;
  type: WidgetType;
  width: '25%' | '33%' | '50%' | '66%' | '75%' | '100%';
  config?: Record<string, any>;
}

type WidgetType = 
  | 'gantt'
  | 'dependency-flow'
  | 'calendar'
  | 'kanban'
  | 'status-lane'
  | 'info-cards'
  | 'team-quick'
  | 'team-waiting'
  | 'team-production'
  | 'burndown'
  | 'velocity';
```

### Acceptance Criteria
- [ ] User can enter "edit mode" on dashboard
- [ ] Widgets can be dragged to different positions
- [ ] Widget width can be adjusted
- [ ] Layout saves to database
- [ ] Layout loads on return
- [ ] Template dashboards work as starting points

---

## Priority 3: Project Starter Templates (Target: Early Afternoon)

### Goal
Leverage existing CSV import to provide ready-made project templates.

### Entry Points

1. **Public Request Form**
   - Anonymous link: `barkitdone.com/request`
   - Simple form: title, description, requester email, due date
   - Lands in owner's inbox as "Requested" project
   - Owner approves/rejects

2. **Internal Creation** (existing)
   - User creates project manually
   - Tagged as "Internal"

3. **Template Import** (new)
   - "New Project > From Template"
   - Pick from template list
   - Preview tasks with checkboxes
   - Approve/skip individual tasks
   - Creates project with selected tasks

### Template Categories

| Category | Templates |
|----------|-----------|
| Software Dev | Launch MVP, Bug Fix Sprint, Feature Rollout |
| Marketing | Campaign Launch, Content Calendar, Product Launch |
| Operations | Onboarding Checklist, Quarterly Review, Office Move |
| Personal | Vacation Planning, Home Renovation, Event Planning |

### Template Format (CSV-based)

```csv
title,description,priority,due_offset_days,phase,category
"Define requirements","Gather stakeholder requirements",1,7,brainstorm,
"Create wireframes","Design initial mockups",2,14,design,
"Build prototype","Develop MVP features",1,30,logic,
...
```

### Flow

```
[+ New Project] → [From Scratch | From Template | From Request]
                         ↓
              [Select Template Category]
                         ↓
              [Preview Tasks (checkboxes)]
                         ↓
              [Select Dashboard Type]
                         ↓
              [Create Project with Tasks]
```

### Acceptance Criteria
- [ ] Template selection modal works
- [ ] Tasks preview with approve/skip checkboxes
- [ ] Project created with approved tasks only
- [ ] Default dashboard auto-applied based on type
- [ ] At least 3 starter templates created

---

## Priority 4: Email Receipt Functionality (Target: Mid-Afternoon)

### Goal
Enable reading incoming emails and parsing them into tasks/projects.

### Current State
- Email send functionality exists
- SMTP settings in account preferences
- No IMAP/receive functionality yet

### Implementation

1. **IMAP Connection**
   - Read from configured email account
   - Pull unread messages
   - Display in settings/inbox view

2. **Email Parser**
   - Extract subject → task title
   - Extract body → description
   - Detect dates, priorities, project references
   - Parse bullet lists as subtasks

3. **Import Flow**
   - Show parsed emails in list
   - "Add as Task" or "Create Project" buttons
   - Confirmation with edits allowed

### Acceptance Criteria
- [ ] Can connect IMAP account in settings
- [ ] Unread emails display in app
- [ ] Can parse email into task
- [ ] Can create project from email

---

## Priority 5: Recurring Tasks UI (Target: Late Afternoon)

### Goal
Complete the recurring tasks interface (field exists, UI incomplete).

### Recurrence Options

| Pattern | Example |
|---------|---------|
| Daily | Every day, Every 2 days |
| Weekly | Every Monday, Every Mon/Wed/Fri |
| Monthly | 1st of month, Last Friday |
| Custom | Every 3 weeks on Tuesday |

### UI Components

1. **Recurrence Picker** in TaskForm
   - Toggle: "Repeat this task"
   - Frequency selector
   - End date (optional)
   - Preview: "Repeats every Monday until Dec 31"

2. **Recurring Task Badge** on TaskCard
   - Small repeat icon
   - Hover shows next occurrence

3. **Auto-generation Logic**
   - When task completed, create next occurrence
   - Or pre-generate X occurrences

### Acceptance Criteria
- [ ] Recurrence picker works in TaskForm
- [ ] Recurring tasks display badge
- [ ] Completing recurring task creates next instance
- [ ] Works well with Maintenance mode projects

---

## Priority 6: Mobile Wireframe (Target: End of Day)

### Goal
Create visual wireframe for mobile app to ensure we don't lose mobile while focusing on web.

### Screen Layout

```
┌─────────────────────────┐
│ ≡  BarkItDone     [+]   │  ← Header with menu & quick add
├─────────────────────────┤
│                         │
│    [Screen Content]     │  ← Main content area
│                         │
│                         │
├─────────────────────────┤
│ 🏠   📋   ➕   📅   ⚙️  │  ← Bottom nav
│Home Tasks Add  Cal  Set │
└─────────────────────────┘
```

### Screens to Wireframe

1. **Home / Projects List**
   - Big tile cards per project
   - Swipe left → archive
   - Swipe right → mark done
   - Tap → open project

2. **Task List** (within project)
   - Scrollable task feed
   - Title, due date, assignee
   - Quick checkbox to complete
   - Long-press to edit

3. **Add Task**
   - Simple pop-up form
   - Title, due date, priority, project
   - Keyboard-friendly, thumb-reachable

4. **Today View**
   - Just what's due today
   - Simple list, quick actions

5. **Settings**
   - Account, sync, theme
   - Email configuration

### Design Principles
- One-hand operation
- Thumb-friendly touch targets (44px+)
- Minimal text entry
- Swipe gestures for common actions
- No complex dashboards on mobile (link to web)

### Deliverable
- [ ] Figma or paper sketches for all 5 screens
- [ ] Component mapping to web components
- [ ] Notes on mobile-specific behaviors

---

## Summary: Today's Hit List

| # | Priority | Task | Target Time | Est. Duration |
|---|----------|------|-------------|---------------|
| 1 | **CRITICAL** | Full Component Sweep | Morning | 2-3 hours |
| 2 | **HIGH** | Dynamic Dashboard System | Late Morning | 2-3 hours |
| 3 | **HIGH** | Widget Catalog (8 widgets) | With #2 | Included |
| 4 | **MEDIUM** | Project Starter Templates | Early Afternoon | 1-1.5 hours |
| 5 | **MEDIUM** | Email Receipt Functionality | Mid-Afternoon | 1-1.5 hours |
| 6 | **MEDIUM** | Recurring Tasks UI | Late Afternoon | 1 hour |
| 7 | **LOW** | Mobile Wireframe | End of Day | 30-45 min |

---

## Success Metrics for Today

By end of day, we should be able to say:

1. ✅ "Every UI element is a reusable component"
2. ✅ "Drag-and-drop works on individual tasks everywhere"
3. ✅ "Task lanes scroll horizontally without overflow"
4. ✅ "Users can customize their dashboard layout"
5. ✅ "New projects can start from templates"
6. ✅ "Recurring tasks have a working UI"
7. ✅ "We have a clear mobile design direction"

---

## Notes

- **Don't whisper, don't talk over** - Clear communication
- **One and done** - Fix it once, works everywhere
- **Eat our own dog food** - Track this in BarkItDone
- **Mobile parity** - Don't forget native while building web

---

*Plan created from brainstorming session transcript*
*Date: January 15, 2026*
