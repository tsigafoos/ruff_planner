# BarkItDone Brainstorming Agenda
## Morning Session - January 15, 2026

> *"A minimalist project manager that only grows when you feed it. No features until you need them, then they bloom."*

---

## Session Overview

**Current Project Status:** ~55-60% complete  
**Recent Progress:** All 6 implementation phases from January 13th sprint complete  
**Today's Fixes:** Waterfall Dashboard rendering, CSV import, Gantt drag handles

---

## Agenda

### 1. Quick Wins Review (5 min)

**Yesterday's Accomplishments:**
- Fixed critical "Objects are not valid as a React child" error in Waterfall Dashboard
- Enhanced CSV import with inline error correction and additional columns
- Fixed Gantt chart drag handles with real-time visual feedback
- Resolved TypeScript compilation errors
- Organized project file structure (markdown/, sql/)

**Questions to Consider:**
- Are there any remaining bugs from yesterday's fixes that need attention?
- Should we deploy these fixes before moving forward?

---

### 2. Major Gaps to Discuss (20 min)

#### Gap A: Voice & AI Features (0% Complete) - HIGH PRIORITY

The original vision includes voice input and AI assistance, but neither is started:

| Feature | Status | Discussion Needed |
|---------|--------|------------------|
| Voice input for tasks | Not started | What voice API? (Web Speech API, Whisper, etc.) |
| Voice notes | Not started | Record + store vs transcribe only? |
| LLM integration (opt-in) | Not started | Which model? OpenAI, Anthropic, local? |
| AI task suggestions | Not started | Based on what context? |
| Meeting notes → text | Not started | Priority vs other AI features? |

**Brainstorm Questions:**
1. Is voice input essential for the minimalist philosophy, or is it feature bloat?
2. If we add AI, should it be server-side (API calls) or offer local model options for privacy?
3. What's the MVP for voice? Just quick task creation?

---

#### Gap B: External Integrations (0% Complete) - HIGH PRIORITY

No connector ecosystem exists yet:

| Feature | Status | Impact |
|---------|--------|--------|
| Slack integration | Not started | Team notifications, task creation from Slack |
| Teams integration | Not started | Enterprise adoption barrier |
| Plugin architecture | Not started | Extensibility foundation |
| Webhook support | Not started | Custom integrations |

**Brainstorm Questions:**
1. Which integration is most valuable for your workflow?
2. Should we build a plugin API first, then integrations as plugins?
3. Is two-way sync needed, or just notifications/task creation?

---

#### Gap C: Multi-User Collaboration (Partially Designed, Not Implemented)

Priority 4 plan exists but isn't fully implemented:

| Feature | Status | Notes |
|---------|--------|-------|
| Team creation | Designed | SQL migration ready |
| Role-based permissions | Designed | Owner/Admin/Member/Guest |
| Magic link invites | Designed | 8-char tokens |
| Project sharing | Designed | Not coded |
| Real-time collaboration | Not started | Supabase subscriptions |

**Brainstorm Questions:**
1. Should we finish team features before or after voice/AI?
2. What's the minimum viable collaboration? Just invite + view?
3. Is real-time collaborative editing needed, or just async?

---

#### Gap D: Task Dependencies (Designed, Not Implemented)

Priority 2 plan exists for blocked-by relationships:

| Feature | Status | Notes |
|---------|--------|-------|
| `blocked_by` field | Migration ready | Not applied |
| Dependency arrows on Gantt | Designed | Not coded |
| Visual task mapping canvas | Designed | Complex feature |
| Auto-unblock on completion | Designed | Not coded |

**Brainstorm Questions:**
1. How critical are dependencies for your current projects?
2. Should we start simple (just blocked-by UI) before the canvas?
3. Is this higher priority than collaboration features?

---

### 3. Technical Debt & Quality Concerns (10 min)

#### Testing Gap
- Only one test file exists: `StyledText-test.js`
- No integration tests
- No e2e tests for critical flows
- Testing checklist created but not executed

**Questions:**
1. Should we pause features and write tests?
2. What's the minimum test coverage we need?
3. Which flows are most critical to test?

#### TypeScript Strictness
- `strict: false`, `noImplicitAny: false` in current config
- Technical debt accumulating with `any` types
- Potential runtime errors hidden by loose types

**Questions:**
1. Should we gradually enable strict mode?
2. Which files/stores are highest priority to type properly?

#### WatermelonDB Sync
- Native sync logic exists but needs testing
- Conflict resolution is "last-write-wins" (simple but may lose data)
- No real-time Supabase subscriptions yet

**Questions:**
1. Is native mobile support critical, or is web-first acceptable?
2. Should we invest in better conflict resolution?

---

### 4. UX & Usability Gaps (10 min)

#### Missing Quality-of-Life Features

| Feature | Status | User Impact |
|---------|--------|-------------|
| Export to markdown/JSON | Not started | Data portability |
| Keyboard shortcuts | Not started | Power user productivity |
| Bulk task operations | Not started | Managing many tasks |
| Undo/redo | Not started | Error recovery |
| Search across all content | Not started | Finding things fast |
| Notifications/reminders | Not started | Task due date alerts |
| Recurring tasks UI | Field exists, UI incomplete | Repeated tasks |

**Brainstorm Questions:**
1. Which of these do you find yourself wishing for most?
2. What's blocking productivity in the current app?
3. Any UX annoyances we should prioritize fixing?

---

#### Accessibility Gaps

- Keyboard navigation for Gantt chart: Not started
- Screen reader support: Minimal
- ARIA labels: Incomplete
- Color contrast: Untested

**Questions:**
1. How important is accessibility for your use case?
2. Should we do an accessibility audit?

---

### 5. Strategic Direction Discussion (15 min)

#### Philosophy Check
The guiding principle is "minimalist" - but we have many planned features. Let's review:

| Feature Category | Aligns with Minimalism? | Discussion |
|-----------------|------------------------|------------|
| Voice input | ? | Simplifies entry or adds complexity? |
| AI assistance | ? | Helps reduce manual work or bloat? |
| Team collaboration | Yes if opt-in | Don't force social features |
| Integrations | ? | Essential for workflow or scope creep? |
| Templates marketplace | ? | Helpful or unnecessary complexity? |

**Key Strategic Questions:**
1. What differentiates BarkItDone from Todoist, Asana, Linear?
2. What's the "one thing" the app should do better than anyone else?
3. Should we launch a public beta before adding more features?
4. Is the app "useful enough" for daily use today?

---

#### Monetization (If Applicable)

| Potential Model | Status | Notes |
|----------------|--------|-------|
| Free tier + Premium | Not designed | What goes in premium? |
| Team/Enterprise tier | Not designed | Multi-user features? |
| Self-hosted option | Not started | OSS core + cloud offering? |

**Questions:**
1. Is monetization a goal for this project?
2. What features would justify a paid tier?

---

### 6. Priority Stack Ranking (10 min)

Based on the gaps identified, let's rank what to work on next:

**Current Priority Candidates:**

| Priority | Feature/Gap | Estimated Effort | Value |
|----------|------------|-----------------|-------|
| ? | Execute testing checklist | 1-2 hours | Stability |
| ? | Task dependencies (blocked-by) | 5.5 hours | Core PM feature |
| ? | Export functionality | 2-3 hours | User safety |
| ? | Real-time subscriptions | 3-4 hours | Multi-device sync |
| ? | Voice input (basic) | 4-6 hours | Differentiation |
| ? | Team collaboration | 4-5 hours | Scaling use case |
| ? | Slack integration | 4-6 hours | Workflow integration |
| ? | Keyboard shortcuts | 2-3 hours | Power users |
| ? | Maintenance mode dashboard | 2.5 hours | Already designed |

**Discussion:**
- What would have the biggest impact on your daily use?
- What would make the app "recommendable" to others?
- What's blocking us from a public launch?

---

### 7. Quick Action Items (5 min)

Let's end with 3-5 concrete next steps to tackle today/this week:

| Action | Owner | Target |
|--------|-------|--------|
| 1. | | |
| 2. | | |
| 3. | | |
| 4. | | |
| 5. | | |

---

## Summary: Key Questions to Answer Today

1. **What's the #1 priority gap?** Voice, AI, collaboration, or something else?
2. **Should we pause for testing/stabilization?** Or push forward with features?
3. **What makes BarkItDone special?** How do we double down on that?
4. **What's the MVP for launch?** What needs to work before going public?
5. **Timeline check:** Any deadlines or milestones we're aiming for?

---

## Notes Section

*(Use this space to capture discussion points, decisions, and new ideas)*

### Ideas:

### Decisions Made:

### Parking Lot (Future Consideration):

---

*Agenda prepared for brainstorming session*  
*Project: BarkItDone*  
*Date: January 15, 2026*
