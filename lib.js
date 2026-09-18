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
function getTodayStr() {
    return new Date().toISOString().split('T')[0];
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
    const pad = n => String(n).padStart(2, '0');
    const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (v === 'today' || v === 'td') return fmt(today);
    if (v === 'tomorrow' || v === 'tmr' || v === 'tom') { const d = new Date(today); d.setDate(d.getDate() + 1); return fmt(d); }
    const relMatch = v.match(/^\+?(\d+)\s*([dw])$/);
    if (relMatch) {
        const n = parseInt(relMatch[1], 10);
        const d = new Date(today);
        d.setDate(d.getDate() + (relMatch[2] === 'w' ? n * 7 : n));
        return fmt(d);
    }
    // Pass through YYYY-MM-DD or any parseable date
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return fmt(parsed);
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
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
        formatDueDate, parseNaturalDate, parseQuickAdd, pickMyDaySuggestions, renderMarkdown
    };
}
