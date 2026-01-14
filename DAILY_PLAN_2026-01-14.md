# Daily Development Plan - January 14, 2026

> **Status:** 🟡 AWAITING APPROVAL  
> **Focus:** Priority 1 - Standard Web Page Framework / Layout Shell

---

## 🎯 Today's Goal

Implement a consistent, plug-and-play layout framework for all web pages that eliminates UI inconsistencies and makes adding new pages effortless.

---

## 📋 Priority 1: Standard Web Page Framework / Layout Shell

### Overview

Create a unified layout system with:
- Thin top navbar with logo and dropdowns
- Expandable/collapsible left sidebar
- Slim footer for system messages
- Consistent content container with proper margins
- Per-page content headers with action buttons

---

## 🔨 Implementation Steps

### Step 1: Create Core Layout Components

**1.1 - TopNavbar Component** (~30 min)
- [ ] Create `components/layout/TopNavbar.tsx`
- [ ] Logo icon + "BarkItDone" title (left-aligned, links to dashboard)
- [ ] Right-aligned dropdown menus:
  - Team dropdown (placeholder for now)
  - Profile dropdown (link to profile page)
  - Account dropdown (settings, logout)
- [ ] Fixed height (~48-56px)
- [ ] Consistent styling for light/dark themes

**1.2 - Sidebar Enhancement** (~45 min)
- [ ] Refactor existing `components/ui/Sidebar.tsx`
- [ ] Two states: Collapsed (icons only, ~60px) and Expanded (icons + labels, ~240px)
- [ ] Toggle button to expand/collapse
- [ ] Pin option to keep expanded
- [ ] Push content when expanded (not overlay)
- [ ] Persist state in localStorage/store
- [ ] Navigation items:
  - Dashboard
  - Tasks (Today, Upcoming, All)
  - Projects
  - Calendar
  - Labels
  - Resources

**1.3 - Footer Component** (~15 min)
- [ ] Create `components/layout/Footer.tsx`
- [ ] Slim 18px height
- [ ] Placeholder for system messages/status
- [ ] Sync status indicator (future)
- [ ] Fixed to bottom

**1.4 - PageHeader Component** (~30 min)
- [ ] Create `components/layout/PageHeader.tsx`
- [ ] Left side: "Section: Page Name" format
- [ ] Right side: Action buttons (configurable per page)
- [ ] Props interface:
  ```typescript
  interface PageHeaderProps {
    section: string;        // e.g., "Projects"
    pageName: string;       // e.g., "Active Backlog"
    actions?: ActionButton[];
  }
  ```
- [ ] Common action presets: Add Task, Add Project, Share, Upload

---

### Step 2: Create Master Layout Wrapper

**2.1 - AppLayout Component** (~45 min)
- [ ] Create `components/layout/AppLayout.tsx`
- [ ] Compose: TopNavbar + Sidebar + Main Content + Footer
- [ ] CSS Grid/Flexbox structure:
  ```
  +------------------------------------------+
  |              TopNavbar (fixed)            |
  +--------+----------------------------------+
  |        |                                  |
  | Side   |        Main Content              |
  | bar    |   (10px top, 20px left margin)   |
  |        |                                  |
  +--------+----------------------------------+
  |              Footer (fixed, 18px)         |
  +------------------------------------------+
  ```
- [ ] Responsive: Sidebar auto-collapses on tablet
- [ ] Content area adjusts based on sidebar state

**2.2 - Layout CSS Variables** (~20 min)
- [ ] Add to `global.css` or create `layout.css`:
  ```css
  --navbar-height: 56px;
  --sidebar-collapsed-width: 60px;
  --sidebar-expanded-width: 240px;
  --footer-height: 18px;
  --content-margin-top: 10px;
  --content-margin-left: 20px;
  ```
- [ ] Easy maintenance and consistency

---

### Step 3: Integrate Layout Into App

**3.1 - Update WebLayout** (~30 min)
- [ ] Replace existing `components/layout/WebLayout.tsx` with new AppLayout
- [ ] Ensure backward compatibility
- [ ] Test with existing pages

**3.2 - Update Tab Pages** (~45 min)
- [ ] Add PageHeader to each tab page:
  - [ ] `app/(tabs)/dashboard.tsx` → "Overview: Dashboard"
  - [ ] `app/(tabs)/tasks.tsx` → "Tasks: All Tasks"
  - [ ] `app/(tabs)/today.tsx` → "Tasks: Today"
  - [ ] `app/(tabs)/upcoming.tsx` → "Tasks: Upcoming"
  - [ ] `app/(tabs)/projects.tsx` → "Projects: All Projects"
  - [ ] `app/(tabs)/calendar.tsx` → "Calendar: Month View"
  - [ ] `app/(tabs)/labels.tsx` → "Settings: Labels"
- [ ] Add appropriate action buttons to each

**3.3 - Update Project Detail Page** (~20 min)
- [ ] `app/project/[id].tsx` → "Projects: {Project Name}"
- [ ] Actions: Add Task, Share, Settings

---

### Step 4: Testing & Polish

**4.1 - Visual QA** (~30 min)
- [ ] Test collapsed sidebar state
- [ ] Test expanded sidebar state
- [ ] Test sidebar toggle animation
- [ ] Verify margins are consistent
- [ ] Test light mode
- [ ] Test dark mode
- [ ] Test tablet viewport (sidebar auto-collapse)

**4.2 - Interaction QA** (~15 min)
- [ ] Logo links to dashboard
- [ ] All sidebar navigation works
- [ ] Dropdowns open/close correctly
- [ ] Sidebar state persists on refresh

---

## ⏱️ Estimated Timeline

| Step | Task | Est. Time |
|------|------|-----------|
| 1.1 | TopNavbar Component | 30 min |
| 1.2 | Sidebar Enhancement | 45 min |
| 1.3 | Footer Component | 15 min |
| 1.4 | PageHeader Component | 30 min |
| 2.1 | AppLayout Component | 45 min |
| 2.2 | Layout CSS Variables | 20 min |
| 3.1 | Update WebLayout | 30 min |
| 3.2 | Update Tab Pages | 45 min |
| 3.3 | Update Project Detail | 20 min |
| 4.1 | Visual QA | 30 min |
| 4.2 | Interaction QA | 15 min |
| **Total** | | **~5.5 hours** |

---

## ✅ Success Criteria

1. [ ] All pages use the same layout structure
2. [ ] Sidebar toggles between collapsed (60px) and expanded (240px)
3. [ ] Content margins are consistent (10px top, 20px left)
4. [ ] Every page has a PageHeader with section:name format
5. [ ] Action buttons are contextual per page
6. [ ] Works in both light and dark modes
7. [ ] Tablet viewports auto-collapse sidebar
8. [ ] New pages can be added with minimal boilerplate

---

## 📁 Files to Create/Modify

### New Files
- `components/layout/TopNavbar.tsx`
- `components/layout/Footer.tsx`
- `components/layout/PageHeader.tsx`
- `components/layout/AppLayout.tsx`

### Modified Files
- `components/ui/Sidebar.tsx` (refactor)
- `components/layout/WebLayout.tsx` (integrate AppLayout)
- `app/(tabs)/dashboard.tsx`
- `app/(tabs)/tasks.tsx`
- `app/(tabs)/today.tsx`
- `app/(tabs)/upcoming.tsx`
- `app/(tabs)/projects.tsx`
- `app/(tabs)/calendar.tsx`
- `app/(tabs)/labels.tsx`
- `app/project/[id].tsx`
- `global.css` (layout variables)
- `store/themeStore.ts` (sidebar state)

---

## 🚫 Out of Scope (For Later Priorities)

These are noted but NOT part of today's work:
- Task dependencies / blocked by (Priority 2)
- Project stages / Maintenance mode (Priority 3)
- Team & Collaboration (Priority 4)
- User profiles enhancement (Priority 5)
- Task assignment & communication (Priority 6)
- Meeting scheduling (Priority 7)
- Email integration (Priority 8)
- Internal calendar (Priority 9)

---

## ✅ Decisions Made

| Question | Answer |
|----------|--------|
| **Logo** | Generic SVG house shape |
| **Sidebar Items** | Include Resources (Dashboard, Tasks, Projects, Calendar, Resources, Labels) |
| **Color Scheme** | Keep current minimalistic style |
| **Mobile** | Web-only focus for now, mobile is future work |

---

## 🟡 Awaiting Final Sign-Off

Plan updated with your feedback. Ready to proceed?

- ✅ **Approve** - Say "go" or "approved" and I'll start with Step 1.1
- 🔄 **Revise** - Any other changes needed?
