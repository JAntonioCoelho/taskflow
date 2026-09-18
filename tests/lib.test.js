/**
 * TaskFlow — tests for the real helpers in lib.js.
 * Unlike taskflow.test.js (which asserts on object literals it builds itself),
 * every expectation here runs actual shipped code.
 */

const {
    escapeHtml,
    attrJson,
    getTodayStr,
    isDueOverdue,
    isDueToday,
    formatDueDate,
    parseNaturalDate,
    parseQuickAdd,
    pickMyDaySuggestions,
    addDays,
    backupStatus,
    fmtDate,
    nextRecurrence,
    streakContinues,
    RECURRENCES,
    icon,
    ICON_PATHS,
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

describe('addDays', () => {
    test('moves forward and backward', () => {
        expect(addDays('2026-09-18', 7)).toBe('2026-09-25');
        expect(addDays('2026-09-18', -1)).toBe('2026-09-17');
    });

    test('crosses month and year boundaries', () => {
        expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
        expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    });

    test('handles a leap day', () => {
        expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    });
});

describe('pickMyDaySuggestions', () => {
    const TODAY = '2026-09-18';

    test('suggests overdue, due-soon and priority tasks', () => {
        const tasks = [
            { text: 'overdue', dueDate: '2026-09-10' },
            { text: 'soon', dueDate: '2026-09-21' },
            { text: 'starred', priority: true },
        ];
        expect(pickMyDaySuggestions(tasks, TODAY, 5).map((t) => t.text)).toEqual([
            'overdue',
            'soon',
            'starred',
        ]);
    });

    test('leaves out what is already in My Day or due today', () => {
        const tasks = [
            { text: 'already in', today: true, priority: true },
            { text: 'due today', dueDate: TODAY },
            { text: 'done', completed: true, priority: true },
        ];
        expect(pickMyDaySuggestions(tasks, TODAY, 5)).toEqual([]);
    });

    test('ignores tasks due beyond a week', () => {
        const tasks = [{ text: 'far', dueDate: '2026-12-01' }];
        expect(pickMyDaySuggestions(tasks, TODAY, 5)).toEqual([]);
    });

    test('includes the far edge of the week window', () => {
        const tasks = [{ text: 'edge', dueDate: addDays(TODAY, 7) }];
        expect(pickMyDaySuggestions(tasks, TODAY, 5).map((t) => t.text)).toEqual(['edge']);
    });

    test('orders overdue first, then by nearest deadline', () => {
        const tasks = [
            { text: 'later', dueDate: '2026-09-22' },
            { text: 'very overdue', dueDate: '2026-09-01' },
            { text: 'sooner', dueDate: '2026-09-19' },
            { text: 'just overdue', dueDate: '2026-09-17' },
        ];
        expect(pickMyDaySuggestions(tasks, TODAY, 5).map((t) => t.text)).toEqual([
            'very overdue',
            'just overdue',
            'sooner',
            'later',
        ]);
    });

    test('respects the limit', () => {
        const tasks = [1, 2, 3, 4, 5, 6, 7].map((n) => ({ text: 't' + n, priority: true }));
        expect(pickMyDaySuggestions(tasks, TODAY, 5)).toHaveLength(5);
    });

    test('an empty list suggests nothing', () => {
        expect(pickMyDaySuggestions([], TODAY, 5)).toEqual([]);
    });
});

describe('backupStatus', () => {
    const NOW = Date.parse('2026-09-18T12:00:00Z');
    const daysAgo = (n) => new Date(NOW - n * 86400000).toISOString();

    test('says nothing when there is nothing to lose', () => {
        expect(backupStatus(null, NOW, 0)).toEqual({ state: 'empty', days: null });
        expect(backupStatus(daysAgo(99), NOW, 0).state).toBe('empty');
    });

    test('flags tasks that have never been exported', () => {
        expect(backupStatus(null, NOW, 5)).toEqual({ state: 'never', days: null });
    });

    test('treats an unreadable timestamp as never exported', () => {
        expect(backupStatus('not a date', NOW, 5).state).toBe('never');
    });

    test('a recent export is fine', () => {
        expect(backupStatus(daysAgo(0), NOW, 5)).toEqual({ state: 'ok', days: 0 });
        expect(backupStatus(daysAgo(13), NOW, 5)).toEqual({ state: 'ok', days: 13 });
    });

    test('goes stale at two weeks', () => {
        expect(backupStatus(daysAgo(14), NOW, 5).state).toBe('stale');
        expect(backupStatus(daysAgo(60), NOW, 5)).toEqual({ state: 'stale', days: 60 });
    });

    test('a timestamp in the future does not report negative days', () => {
        expect(backupStatus(new Date(NOW + 86400000).toISOString(), NOW, 5)).toEqual({
            state: 'ok',
            days: 0,
        });
    });
});

describe('fmtDate', () => {
    test('formats the local calendar day, not the UTC one', () => {
        // Half past midnight local. toISOString() would report the previous day
        // anywhere east of Greenwich; fmtDate must not.
        const justAfterMidnight = new Date(2026, 8, 18, 0, 30);
        expect(fmtDate(justAfterMidnight)).toBe('2026-09-18');
    });

    test('pads single-digit months and days', () => {
        expect(fmtDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    });
});

describe('nextRecurrence', () => {
    test('daily moves to the following day', () => {
        expect(nextRecurrence('2026-09-18', 'daily')).toBe('2026-09-19');
    });

    test('daily crosses a month boundary', () => {
        expect(nextRecurrence('2026-09-30', 'daily')).toBe('2026-10-01');
    });

    test('weekly moves seven days', () => {
        expect(nextRecurrence('2026-09-18', 'weekly')).toBe('2026-09-25');
    });

    test('monthly keeps the day of the month', () => {
        expect(nextRecurrence('2026-09-15', 'monthly')).toBe('2026-10-15');
    });

    test('monthly clamps instead of skipping a month', () => {
        expect(nextRecurrence('2026-01-31', 'monthly')).toBe('2026-02-28');
        expect(nextRecurrence('2026-03-31', 'monthly')).toBe('2026-04-30');
        expect(nextRecurrence('2028-01-31', 'monthly')).toBe('2028-02-29');
    });

    test('monthly crosses the year boundary', () => {
        expect(nextRecurrence('2026-12-10', 'monthly')).toBe('2027-01-10');
    });

    test('yearly moves a year, clamping a leap day', () => {
        expect(nextRecurrence('2026-09-18', 'yearly')).toBe('2027-09-18');
        expect(nextRecurrence('2028-02-29', 'yearly')).toBe('2029-02-28');
    });

    test('rejects an unknown cadence or a missing date', () => {
        expect(nextRecurrence('2026-09-18', 'hourly')).toBeNull();
        expect(nextRecurrence('2026-09-18', null)).toBeNull();
        expect(nextRecurrence(null, 'daily')).toBeNull();
        expect(nextRecurrence('not a date', 'daily')).toBeNull();
    });

    test('every advertised cadence produces a later date', () => {
        RECURRENCES.forEach((r) => {
            expect(nextRecurrence('2026-09-18', r) > '2026-09-18').toBe(true);
        });
    });
});

describe('streakContinues', () => {
    test('allows a day of slack on a daily habit', () => {
        expect(streakContinues('daily', 1)).toBe(true);
        expect(streakContinues('daily', 2)).toBe(true);
        expect(streakContinues('daily', 3)).toBe(false);
    });

    test('scales the window to the cadence', () => {
        expect(streakContinues('weekly', 9)).toBe(true);
        expect(streakContinues('weekly', 10)).toBe(false);
        expect(streakContinues('monthly', 31)).toBe(true);
        expect(streakContinues('monthly', 39)).toBe(false);
        expect(streakContinues('yearly', 366)).toBe(true);
    });

    test('an unknown cadence never continues a streak', () => {
        expect(streakContinues('hourly', 1)).toBe(false);
        expect(streakContinues(null, 1)).toBe(false);
    });
});

describe('icon', () => {
    test('renders inline SVG at the requested size', () => {
        const svg = icon('calendar', 12);
        expect(svg).toContain('<svg');
        expect(svg).toContain('width="12"');
        expect(svg).toContain('stroke="currentColor"');
        expect(svg).toContain('aria-hidden="true"');
    });

    test('defaults to 16px', () => {
        expect(icon('star')).toContain('width="16"');
    });

    test('an unknown name renders nothing rather than a broken glyph', () => {
        expect(icon('no-such-icon')).toBe('');
    });

    test('every icon in the set has path data', () => {
        Object.keys(ICON_PATHS).forEach((name) => {
            expect(icon(name)).toContain('<svg');
        });
    });
});

describe('attrJson', () => {
    test('quotes a plain string as an entity-encoded JS literal', () => {
        expect(attrJson('work')).toBe('&quot;work&quot;');
    });

    test('a quote in the value cannot end the HTML attribute', () => {
        // The payload that escaped the onclick attribute and ran as an
        // injected onmouseover handler before this was fixed.
        const out = attrJson('x" onmouseover=window.__XSS=1//');
        expect(out).not.toMatch(/(^|[^&#a-z0-9])"/);
        expect(out.includes('"')).toBe(false);
    });

    test('angle brackets cannot open a tag', () => {
        const out = attrJson('</script><img src=x onerror=alert(1)>');
        expect(out).not.toContain('<');
        expect(out).not.toContain('>');
    });

    test('an apostrophe cannot end a single-quoted attribute', () => {
        expect(attrJson("it's").includes("'")).toBe(false);
    });

    test('ampersands are encoded first, so entities cannot be forged', () => {
        expect(attrJson('a&quot;b')).toBe('&quot;a&amp;quot;b&quot;');
    });

    test('decoding the entities yields the original JSON literal', () => {
        const decode = (s) =>
            s
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');
        ['work', 'x" onmouseover=1', "it's", '<b>', 'a&b'].forEach((raw) => {
            expect(JSON.parse(decode(attrJson(raw)))).toBe(raw);
        });
    });
});
