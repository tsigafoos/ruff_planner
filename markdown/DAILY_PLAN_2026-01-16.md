# Daily Plan - January 16, 2026
## BarkItDone Development Sprint

> Based on morning brainstorming session
> Philosophy: "Strip. Not add. Strip." — Keep it stupid simple.

---

## Today's Priority List

From the brainstorming session, here are the items to tackle, ordered by what can be completed today and what aligns with the "strip, not add" philosophy:

### Priority 1: Theme Options (Dark/Light Only) ✅ FOCUS TODAY
**Branch: `cursor/dark-light-theme-options-3581`**

Strip the theme system down to basics:
- **Dark** (default for most users)
- **Light**

No colorful/fancy themes. No custom palettes. No gradients. No "fun" modes.
Simple toggle in settings. Global preference only (no per-project override for now).

**Tasks:**
- [ ] Update themeStore to only support 'dark' | 'light' (remove 'system')
- [ ] Create simple toggle UI in settings
- [ ] Persist preference to localStorage
- [ ] Apply theme class on app load

---

### Priority 2: Icon Packages (Simple / Colorful / None)

Three choices. User picks one:
- **Simple** — Line/minimal icons, clean & professional
- **Colorful** — Vibrant, filled, fun/engaging  
- **None** — Text-only, zero icons for maximum minimalism

Store as user preference. Apply globally.

---

### Priority 3: "Get Daily Bark" Toggle (Daily Status Report)

Keep it stupid simple. One toggle: **"Get daily bark"** — On or Off.

Every night at midnight, run:
- **Projects:** new tasks, done tasks, % complete
- **People:** tasks assigned, tasks late
- **Tomorrow:** five overdue tasks in a list

Send as plain text email. No HTML. No images. Just text.

User wakes up, checks mail, done. No dashboard for reporting.

---

### Priority 4: Request New Project Form

Public-facing, simple form. No login required.
Two questions:
1. **What's the project?**
2. **By when?**

Submit → lands in owner's inbox as raw project blob.
Owner picks it up, shapes it, names it, assigns it.
If no one picks it, it dies.

---

### Priority 5: Meetings as First-Class Objects (with CYA Email)

Meeting is a card:
- Who was there
- What was said (notes)
- What got decided (checkboxes)
- What's due next (tasks)

End meeting → hit "done":
- Checkbox list becomes tasks
- Auto-send plain text recap email to all attendees

Email format:
```
Attendees: Alice, Bob
Time: 9am
Decided: Launch date 12/2
Action: Alice designs logo by Monday
        Bob books venue by Friday
Notes: Alice will test three color schemes.

Sent by BarkItDone. No more excuses.
```

End of meeting triggers task to the person who scheduled it.

---

### Priority 6: Communication Center (Standalone)

Lives outside projects/tasks. One area with:
- Agenda builder
- Recap sender
- Status reporter
- Meeting scheduler
- Follow-up generator

All one-click. All plain text. All CYA-proof.
No formatting. No drag-and-drop. Fill a form, it talks for you.

---

### Priority 7: Task Assignee Field

Simple type-to-search. Auto-add user to project team if not already there.
One field, one action.

---

### Priority 8: Real-time Comments on Tasks

Flat stream. WhatsApp/iMessage style.
- @mentions
- Avatars
- Live updates

No threading. No complexity. Just chat.

---

### Priority 9: Team Tab/View per Project

Quick list of everyone on the project:
- Add/remove members
- Tweak roles
- See their active tasks at a glance

---

### Priority 10: UI Spacing Overhaul

Airy. Generous breathing room everywhere.
Especially important once comments/meetings stack.

---

## Not Today (Backlog)

- Syllabus import (PDF/email → auto-tasks)
- Voice input/notes
- AI/LLM features
- External integrations

---

## Today's Commits Target

1. Theme options: dark/light only with simple toggle
2. Foundation for icon package selection
3. If time: daily bark toggle (email preference)

---

## Philosophy Reminders

- **Strip, not add**
- **One path, one flow**
- **Reporting is not in the face — it's in your mailbox**
- **Don't whisper, bark**
- **Workers don't care about dashboards — they care about getting heard**

---

*Plan created: January 16, 2026*
