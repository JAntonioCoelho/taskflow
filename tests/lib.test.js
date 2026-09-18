/**
 * TaskFlow — tests for the real helpers in lib.js.
 * Unlike taskflow.test.js (which asserts on object literals it builds itself),
 * every expectation here runs actual shipped code.
 */

const {
    escapeHtml,
    getTodayStr,
    isDueOverdue,
    isDueToday,
    formatDueDate,
    parseNaturalDate,
    parseQuickAdd,
    renderMarkdown,
} = require('../lib.js');

const dayOffset = (n) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    const pad = (x) => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

describe('escapeHtml', () => {
    test('neutralises tags and quotes', () => {
        expect(escapeHtml('<img src=x onerror=alert(1)>')).not.toContain('<img');
        expect(escapeHtml('say "hi"')).toBe('say &quot;hi&quot;');
    });

    test('leaves plain text alone', () => {
        expect(escapeHtml('Buy milk')).toBe('Buy milk');
    });
});

describe('due date helpers', () => {
    test('getTodayStr returns an ISO date', () => {
        expect(getTodayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('a past date is overdue, today is not', () => {
        expect(isDueOverdue({ dueDate: '2020-01-01', completed: false })).toBe(true);
        expect(isDueOverdue({ dueDate: getTodayStr(), completed: false })).toBe(false);
    });

    test('completed tasks are never overdue or due today', () => {
        expect(isDueOverdue({ dueDate: '2020-01-01', completed: true })).toBe(false);
        expect(isDueToday({ dueDate: getTodayStr(), completed: true })).toBe(false);
    });

    test('a task with no due date is neither', () => {
        expect(isDueOverdue({ dueDate: null, completed: false })).toBe(false);
        expect(isDueToday({ dueDate: null, completed: false })).toBe(false);
    });

    test('formatDueDate names today and tomorrow, formats the rest', () => {
        expect(formatDueDate(getTodayStr())).toBe('Today');
        expect(formatDueDate(dayOffset(1))).toBe('Tomorrow');
        expect(formatDueDate('2026-03-14')).toBe('Mar 14');
        expect(formatDueDate(null)).toBe('');
    });
});

describe('parseNaturalDate', () => {
    test('resolves relative words', () => {
        expect(parseNaturalDate('today')).toBe(dayOffset(0));
        expect(parseNaturalDate('TOMORROW')).toBe(dayOffset(1));
        expect(parseNaturalDate('tmr')).toBe(dayOffset(1));
    });

    test('resolves day and week offsets', () => {
        expect(parseNaturalDate('+3d')).toBe(dayOffset(3));
        expect(parseNaturalDate('2w')).toBe(dayOffset(14));
    });

    test('passes ISO dates straight through', () => {
        expect(parseNaturalDate('2026-12-25')).toBe('2026-12-25');
    });

    test('returns unparseable input untouched', () => {
        expect(parseNaturalDate('sometime')).toBe('sometime');
    });
});

describe('parseQuickAdd', () => {
    test('plain text stays plain', () => {
        expect(parseQuickAdd('Buy milk')).toEqual({
            text: 'Buy milk',
            tags: [],
            dueDate: null,
            priority: false,
            pinned: false,
        });
    });

    test('pulls out tags, due date, priority and pin', () => {
        const r = parseQuickAdd('Call the bank #work #urgent !tomorrow * ^');
        expect(r.text).toBe('Call the bank');
        expect(r.tags).toEqual(['work', 'urgent']);
        expect(r.dueDate).toBe(dayOffset(1));
        expect(r.priority).toBe(true);
        expect(r.pinned).toBe(true);
    });

    test('does not repeat a tag', () => {
        expect(parseQuickAdd('Ship it #dev #dev').tags).toEqual(['dev']);
    });

    test('only the first due date wins, the rest stay as text', () => {
        const r = parseQuickAdd('Plan !today !tomorrow');
        expect(r.dueDate).toBe(dayOffset(0));
        expect(r.text).toBe('Plan !tomorrow');
    });

    test('an unparseable ! token is kept as literal text', () => {
        const r = parseQuickAdd('Fix this now!  !whenever');
        expect(r.dueDate).toBeNull();
        expect(r.text).toBe('Fix this now! !whenever');
    });

    test('a bare # or ! is not a marker', () => {
        const r = parseQuickAdd('Rank # and ! signs');
        expect(r.tags).toEqual([]);
        expect(r.text).toBe('Rank # and ! signs');
    });

    test('markers-only input yields no text, so nothing gets added', () => {
        expect(parseQuickAdd('#work *').text).toBe('');
        expect(parseQuickAdd('   ').text).toBe('');
    });
});

describe('renderMarkdown', () => {
    test('renders bold, italic and lists', () => {
        expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>');
        expect(renderMarkdown('*soft*')).toContain('<em>soft</em>');
        expect(renderMarkdown('- one\n- two')).toContain('<li>one</li>');
    });

    test('renders http links', () => {
        const out = renderMarkdown('[docs](https://example.com)');
        expect(out).toContain('href="https://example.com"');
        expect(out).toContain('rel="noopener noreferrer"');
    });

    test('refuses javascript: links', () => {
        const out = renderMarkdown('[click](javascript:alert(1))');
        expect(out).not.toContain('href');
        expect(out).toContain('javascript:alert(1)');
    });

    test('escapes HTML before formatting', () => {
        expect(renderMarkdown('<script>x</script>')).not.toContain('<script>');
    });

    test('empty input renders nothing', () => {
        expect(renderMarkdown('')).toBe('');
        expect(renderMarkdown(null)).toBe('');
    });
});
