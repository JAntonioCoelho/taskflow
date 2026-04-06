# TaskFlow — Modern Task Manager

[![Tests](https://github.com/JAntonioCoelho/taskflow/workflows/Tests/badge.svg)](https://github.com/JAntonioCoelho/taskflow/actions)
[![Security](https://github.com/JAntonioCoelho/taskflow/workflows/Security/badge.svg)](https://github.com/JAntonioCoelho/taskflow/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A feature-rich, single-file task manager with Pomodoro timer, subtasks, tags, recurring tasks, drag-and-drop reordering, and more. No build step, no framework, no server — everything runs in the browser.

**Live Demo:** [https://JAntonioCoelho.github.io/taskflow/](https://JAntonioCoelho.github.io/taskflow/)

---

## Features

### Task Management
- Create, edit, and delete tasks
- Complete/incomplete toggle with visual strikethrough
- Undo deletion (5-second window)
- Drag-and-drop reordering
- Bulk select — complete or delete multiple tasks at once

### Task Properties
| Property | Description |
|----------|-------------|
| ⭐ Priority | Surfaces tasks in the Priority view |
| ⚡ Today | Marks task for the Today view |
| 📅 Due Date | Date picker with overdue highlights and "Today / Tomorrow" labels |
| ☑ Subtasks | Nested checklist with progress indicator (e.g. ☑ 2/5) |
| 📝 Notes | Expandable multi-line notes per task |
| 🏷 Tags | Up to 5 color-coded tags per task |
| 🔁 Recurrence | Daily or weekly repeat — auto-creates next instance on completion |

### Views
| View | Shows |
|------|-------|
| **All** | Every task in the active list |
| **Today** | Tasks due today or marked with ⚡ |
| **Priority** | Tasks flagged with ⭐ |
| **Statistics** | Stats cards, export/import, Pomodoro 7-day chart |

### Sorting & Filtering
- Sort by: Default, Due Date, Created Date, Alphabetical
- Real-time search (by text or date)
- Filter by tag (tap a tag pill at the top of the list)

### Lists
- Create, rename, and delete custom lists
- Default lists: Personal 🏠 and Work 💼
- Each list has its own tasks and task count badge

### Pomodoro Timer
- 25-minute work / 5-minute break cycle (fully customizable)
- Start, Pause, Reset controls
- Browser notification and audio beep on completion
- Status display: Idle / Running / Paused / Break Time
- Progress bar and MM:SS countdown
- 7-day history bar chart in the Statistics view

### Radio Player
- Streams Rádio Comercial
- Play/pause with volume slider
- Animated bars and live indicator while playing

### Statistics
- Total tasks, completed, priority, for today, completion rate, pending (with overdue count)
- Pomodoro bar chart for the last 7 days

### Data & Privacy
- All data stored in `localStorage` — nothing leaves your device
- Export all lists as a timestamped JSON file
- Import a previously exported JSON to restore data
- No tracking, no analytics, no external servers

### Theme
- Dark mode by default
- Light mode toggle (🌙 / ☀️ button in sidebar)
- Auto-detects system `prefers-color-scheme` on first load
- Persists your preference in `localStorage`

### PWA (Installable)
- Works offline via service worker
- Installable on Android (Chrome), iOS (Add to Home Screen), and desktop
- Standalone display mode (no browser chrome)

### Accessibility
- Full keyboard navigation (see shortcuts below)
- ARIA labels, roles, and live regions throughout
- `prefers-reduced-motion` support (disables all animations)
- Large touch targets on mobile (44px+)
- WCAG AA color contrast

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | Focus task input (switches to All view) |
| `Ctrl/Cmd + K` or `Ctrl/Cmd + /` | Focus search bar |
| `Escape` | Close modals / clear search focus / close sidebar |
| `Arrow Up / Down` | Navigate between tasks |
| `Delete` | Delete the focused task |

---

## Quick Start

### Run Locally

```bash
git clone https://github.com/JAntonioCoelho/taskflow.git
cd taskflow

# Python
python -m http.server 8000

# Node.js
npx serve
```

Open `http://localhost:8000`

### Run Tests

```bash
npm install
npm test
```

Tests run automatically on every push via GitHub Actions.

### Deploy to GitHub Pages

1. Fork this repository
2. Go to **Settings → Pages**
3. Source: **GitHub Actions**
4. Push any change to `main` — your site will be live at `https://<your-username>.github.io/taskflow/`

---

## Tech Stack

| | |
|---|---|
| Language | Vanilla JavaScript (ES6+) |
| Markup / Styling | HTML5, CSS3 (Variables, Flexbox, Grid) |
| Storage | Browser `localStorage` |
| PWA | Service Worker + Web App Manifest |
| Testing | Jest + jsdom |
| CI/CD | GitHub Actions (tests, security scan, deploy) |
| Hosting | GitHub Pages |
| Build | None — single `index.html` |

---

## Security

Automated security scanning on every push and weekly:
- `npm audit` for dependency vulnerabilities
- CodeQL static analysis
- XSS and injection pattern detection
- Secret scanning

---

## Contributing

1. Fork the project
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Author

**José Coelho** · [@JAntonioCoelho](https://github.com/JAntonioCoelho)

Found a bug? [Open an issue](https://github.com/JAntonioCoelho/taskflow/issues) with steps to reproduce.
Have an idea? Open an issue with the `enhancement` label.

---

⭐ If you find this project useful, please consider giving it a star!
