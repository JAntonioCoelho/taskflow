/**
 * TaskFlow — pure helpers.
 * Loaded as a classic script by index.html (functions become globals)
 * and required directly by tests/lib.test.js.
 */

// ESCAPE HTML — reuse a single element for performance
const _escapeEl = (typeof document !== 'undefined') ? document.createElement('div') : null;

function escapeHtml(text) {
    if (_escapeEl) {
        _escapeEl.textContent = text;
        return _escapeEl.innerHTML.replace(/"/g, '&quot;');
    }
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// DUE DATE HELPERS
// Always format the LOCAL calendar day. toISOString() shifts to UTC, which east
// of Greenwich reports yesterday just after midnight and made daily recurrence
// land on the day it started from.
function fmtDate(d) {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getTodayStr() {
    return fmtDate(new Date());
}

function isDueOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    return task.dueDate < getTodayStr();
}

function isDueToday(task) {
    if (!task.dueDate || task.completed) return false;
    return task.dueDate === getTodayStr();
}

function formatDueDate(dueDate) {
    if (!dueDate) return '';
    const today = getTodayStr();
    if (dueDate === today) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dueDate === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    const d = new Date(dueDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// NATURAL LANGUAGE DATE PARSING — returns YYYY-MM-DD, or the input untouched
function parseNaturalDate(value) {
    const v = String(value).trim().toLowerCase();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (v === 'today' || v === 'td') return fmtDate(today);
    if (v === 'tomorrow' || v === 'tmr' || v === 'tom') { const d = new Date(today); d.setDate(d.getDate() + 1); return fmtDate(d); }
    const relMatch = v.match(/^\+?(\d+)\s*([dw])$/);
    if (relMatch) {
        const n = parseInt(relMatch[1], 10);
        const d = new Date(today);
        d.setDate(d.getDate() + (relMatch[2] === 'w' ? n * 7 : n));
        return fmtDate(d);
    }
    // Pass through YYYY-MM-DD or any parseable date
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return fmtDate(parsed);
    return value;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * QUICK-ADD SYNTAX — "Buy milk #home !tomorrow * ^"
 *   #tag   → tag (repeatable)     !date → due date (first one wins)
 *   *      → priority             ^     → pin to top
 * Anything that does not parse stays in the text, so a literal "Hey!" survives.
 */
function parseQuickAdd(raw) {
    const result = { text: '', tags: [], dueDate: null, priority: false, pinned: false };
    const kept = [];
    String(raw || '').trim().split(/\s+/).forEach(function(word) {
        if (word.length > 1 && word[0] === '#') {
            const tag = word.slice(1);
            if (!result.tags.includes(tag)) result.tags.push(tag);
        } else if (word.length > 1 && word[0] === '!' && !result.dueDate) {
            const parsed = parseNaturalDate(word.slice(1));
            if (ISO_DATE.test(parsed)) result.dueDate = parsed;
            else kept.push(word);
        } else if (word === '*') {
            result.priority = true;
        } else if (word === '^') {
            result.pinned = true;
        } else if (word) {
            kept.push(word);
        }
    });
    result.text = kept.join(' ');
    return result;
}

function addDays(isoDate, days) {
    const d = new Date(isoDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return fmtDate(d);
}

const RECURRENCES = ['daily', 'weekly', 'monthly', 'yearly'];

/**
 * The occurrence after isoDate. Month and year steps clamp to the end of the
 * target month, so the 31st recurs as the 28th/30th instead of skipping a month
 * the way plain setMonth() does.
 */
function nextRecurrence(isoDate, recurrence) {
    if (!isoDate || RECURRENCES.indexOf(recurrence) === -1) return null;
    const d = new Date(isoDate + 'T00:00:00');
    if (isNaN(d.getTime())) return null;
    if (recurrence === 'daily') return addDays(isoDate, 1);
    if (recurrence === 'weekly') return addDays(isoDate, 7);
    const day = d.getDate();
    const target = new Date(d.getFullYear(), d.getMonth(), 1);
    if (recurrence === 'monthly') target.setMonth(target.getMonth() + 1);
    else target.setFullYear(target.getFullYear() + 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(day, lastDay));
    return fmtDate(target);
}

// How long a habit streak survives between completions, per cadence.
const STREAK_WINDOW_DAYS = { daily: 2, weekly: 9, monthly: 38, yearly: 380 };

function streakContinues(recurrence, diffDays) {
    const limit = STREAK_WINDOW_DAYS[recurrence];
    return limit !== undefined && diffDays <= limit;
}

/**
 * MY DAY SUGGESTIONS — what is worth pulling into today.
 * Tasks already in My Day, or due today, are left out: they show up anyway.
 * Overdue first, then the nearest deadline, then priority.
 */
function pickMyDaySuggestions(tasks, todayStr, limit) {
    const weekStr = addDays(todayStr, 7);
    const isOverdue = t => !!t.dueDate && t.dueDate < todayStr;
    const picked = tasks.filter(function(t) {
        if (t.completed || t.today || t.dueDate === todayStr) return false;
        const soon = !!t.dueDate && t.dueDate > todayStr && t.dueDate <= weekStr;
        return isOverdue(t) || soon || !!t.priority;
    });
    picked.sort(function(a, b) {
        if (isOverdue(a) !== isOverdue(b)) return isOverdue(a) ? -1 : 1;
        if (!!a.dueDate !== !!b.dueDate) return a.dueDate ? -1 : 1;
        if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (!!a.priority !== !!b.priority) return a.priority ? -1 : 1;
        return 0;
    });
    return picked.slice(0, limit || 5);
}

const BACKUP_STALE_DAYS = 14;

/**
 * BACKUP FRESHNESS — localStorage is not durable storage, so an export is the
 * only copy that survives the browser clearing its data.
 * "empty" means there is nothing worth backing up yet.
 */
function backupStatus(lastExportAt, nowMs, taskCount) {
    if (!taskCount) return { state: 'empty', days: null };
    const then = lastExportAt ? new Date(lastExportAt).getTime() : NaN;
    if (isNaN(then)) return { state: 'never', days: null };
    const days = Math.floor((nowMs - then) / 86400000);
    return { state: days >= BACKUP_STALE_DAYS ? 'stale' : 'ok', days: Math.max(0, days) };
}

/**
 * ICONS — inline stroke SVG, 24px grid, currentColor.
 * Emoji were the previous iconography: they render differently on every
 * platform, cannot take the text colour, and cannot be sized consistently.
 * Only the path data lives here; icon() wraps it.
 */
const ICON_PATHS = {
    list:      '<path d="M3 5h18"/><path d="M3 12h18"/><path d="M3 19h12"/>',
    bolt:      '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
    calendar:  '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
    calendarSm:'<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18"/>',
    star:      '<path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9L6.7 19.6l1.1-6L3.4 9.4l6-.8L12 3z"/>',
    check:     '<polyline points="20 6 9 17 4 12"/>',
    checkCircle:'<circle cx="12" cy="12" r="9"/><polyline points="8.5 12.2 11 14.7 15.6 9.6"/>',
    circle:    '<circle cx="12" cy="12" r="9"/>',
    trash:     '<path d="M4 7h16"/><path d="M9 7V4.8h6V7"/><path d="M6.2 7l1 12.2h9.6l1-12.2"/>',
    chart:     '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
    search:    '<circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/>',
    plus:      '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    close:     '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
    more:      '<circle cx="5.5" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
    clock:     '<circle cx="12" cy="12" r="8.5"/><polyline points="12 7.5 12 12 15 13.6"/>',
    repeat:    '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7"/><path d="M20 4.2v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.3"/><path d="M4 19.8v-4.5h4.5"/>',
    flame:     '<path d="M12 21c3.9 0 6.5-2.6 6.5-6 0-4.5-4.5-6.5-4-12-3 2-6.5 5-6.5 9 0 1.5.5 2.5 1 3-1.5 0-2.5-1-3-2-.6 1-.5 2-.5 2.5 0 3.4 2.6 5.5 6.5 5.5z"/>',
    timer:     '<circle cx="12" cy="13.5" r="7.5"/><path d="M9.5 2.5h5"/><path d="M12 2.5v3.5"/>',
    tag:       '<path d="M3 11.5V5.5a2 2 0 0 1 2-2h6l9.5 9.5-8 8L3 11.5z"/><circle cx="7.8" cy="8.3" r="1.1"/>',
    note:      '<path d="M5 4.5h14v15H5z"/><path d="M8.5 9h7"/><path d="M8.5 13h7"/><path d="M8.5 17h4"/>',
    subtasks:  '<polyline points="3.5 7 5.5 9 9 5"/><polyline points="3.5 16 5.5 18 9 14"/><path d="M12 7h9"/><path d="M12 17h9"/>',
    pin:       '<path d="M9 3h6l-1 6 3.5 3.5H6.5L10 9 9 3z"/><path d="M12 12.5V21"/>',
    edit:      '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3z"/>',
    move:      '<path d="M4 12h15"/><polyline points="14 7 19.5 12 14 17"/>',
    template:  '<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8.5h8"/><path d="M8 12.5h8"/><path d="M8 16.5h4"/>',
    undo:      '<path d="M4 9h11a5 5 0 0 1 0 10h-6"/><polyline points="7.5 5.5 4 9 7.5 12.5"/>',
    printer:   '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="7" rx="2"/><path d="M7 14h10v6.5H7z"/>',
    focus:     '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.6"/>',
    compact:   '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
    globe:     '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.6 3.6 5.4 3.6 8.5S14.4 18.4 12 20.5c-2.4-2.1-3.6-5.4-3.6-8.5S9.6 6.1 12 3.5z"/>',
    bulb:      '<path d="M9 18h6"/><path d="M10 21.5h4"/><path d="M12 2.5a6 6 0 0 0-3.5 10.9V15h7v-1.6A6 6 0 0 0 12 2.5z"/>',
    play:      '<polygon points="7 4.5 19 12 7 19.5" fill="currentColor" stroke="none"/>',
    pause:     '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>',
    settings:  '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3"/><path d="M12 18.5v3"/><path d="M2.5 12h3"/><path d="M18.5 12h3"/><path d="M5.3 5.3l2.1 2.1"/><path d="M16.6 16.6l2.1 2.1"/><path d="M18.7 5.3l-2.1 2.1"/><path d="M7.4 16.6l-2.1 2.1"/>',
    command:   '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6z"/>',
    sun:       '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4"/><path d="M12 19.1v2.4"/><path d="M2.5 12h2.4"/><path d="M19.1 12h2.4"/><path d="M5.3 5.3 7 7"/><path d="M17 17l1.7 1.7"/><path d="M18.7 5.3 17 7"/><path d="M7 17l-1.7 1.7"/>',
    moon:      '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    lock:      '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    alert:     '<path d="M12 3.5 21 19.5H3z"/><path d="M12 10v4"/><circle cx="12" cy="17" r="0.7" fill="currentColor" stroke="none"/>',
    grip:      '<circle cx="9" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.1" fill="currentColor" stroke="none"/>',
    download:  '<path d="M12 3.5v12"/><polyline points="7.5 11 12 15.5 16.5 11"/><path d="M4.5 19.5h15"/>',
    upload:    '<path d="M12 20.5v-12"/><polyline points="7.5 13 12 8.5 16.5 13"/><path d="M4.5 4.5h15"/>',
    keyboard:  '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 9.5h.01"/><path d="M9.5 9.5h.01"/><path d="M13 9.5h.01"/><path d="M16.5 9.5h.01"/><path d="M7.5 14h9"/>',
    radio:     '<circle cx="12" cy="12" r="2.5"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4"/><path d="M16.2 16.2a6 6 0 0 0 0-8.4"/><path d="M5 5a10 10 0 0 0 0 14"/><path d="M19 19a10 10 0 0 0 0-14"/>'
};

function icon(name, size) {
    const d = ICON_PATHS[name];
    if (!d) return '';
    const s = size || 16;
    return '<svg class="icon" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ' +
        'aria-hidden="true" focusable="false">' + d + '</svg>';
}

// MARKDOWN NOTES RENDERER
function renderMarkdown(text) {
    if (!text) return '';
    // Escape HTML first, then apply markdown on the escaped string
    let s = escapeHtml(text);
    // Links: [label](url) — http/https/mailto only, so javascript: URLs stay inert text
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, label, url) {
        return /^\s*(https?:|mailto:)/i.test(url)
            ? `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer">${label}</a>`
            : match;
    });
    // Bold: **text**
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* (not preceded by another *)
    s = s.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Convert lines starting with "- " or "* " into list items, then wrap groups
    const lines = s.split('\n');
    const out = [];
    let inList = false;
    for (const line of lines) {
        const listMatch = line.match(/^[-*]\s(.+)/);
        if (listMatch) {
            if (!inList) { out.push('<ul>'); inList = true; }
            out.push(`<li>${listMatch[1]}</li>`);
        } else {
            if (inList) { out.push('</ul>'); inList = false; }
            out.push(line ? line : '<br>');
        }
    }
    if (inList) out.push('</ul>');
    return out.join('\n').replace(/\n(?!<)/g, '<br>').replace(/<br>\n/g, '<br>');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml, getTodayStr, isDueOverdue, isDueToday, addDays, backupStatus,
        fmtDate, nextRecurrence, streakContinues, RECURRENCES, icon, ICON_PATHS,
        formatDueDate, parseNaturalDate, parseQuickAdd, pickMyDaySuggestions, renderMarkdown
    };
}
