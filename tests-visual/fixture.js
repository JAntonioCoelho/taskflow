/**
 * A fixed app state, so a screenshot only changes when the layout changes.
 *
 * Everything that would otherwise drift — the clock, the task ids, the tag
 * colours, the pomodoro history — is pinned here before the page loads.
 */
const { test: base, expect } = require('@playwright/test');

const NOW = new Date('2026-09-18T09:24:00');
const TODAY = '2026-09-18';

const LISTS = [
    {
        id: 1,
        name: 'Personal',
        icon: '',
        color: null,
        tasks: [
            task(101, 'Entregar o relatório trimestral', {
                dueDate: '2026-09-10',
                tags: ['work'],
                subtasks: [
                    { id: 1011, text: 'Reunir os números', completed: true },
                    { id: 1012, text: 'Rever com a equipa', completed: false }
                ]
            }),
            task(102, 'Rever o PR de faturação', {
                dueDate: TODAY,
                remindTime: '09:30',
                priority: true,
                today: true,
                pomodoros: 3,
                tags: ['work'],
                notes: 'Atenção ao **IVA a 6%** nas linhas isentas.',
                subtasks: [
                    { id: 1021, text: 'Ler o diff', completed: true },
                    { id: 1022, text: 'Correr os testes', completed: false }
                ]
            }),
            task(103, 'Tomar o comprimido', {
                dueDate: TODAY,
                recurrence: 'daily',
                streak: 12,
                today: true
            }),
            task(104, 'Escrever a introdução da apresentação', {}),
            task(105, 'Marcar consulta no dentista', {
                completed: true,
                completedAt: '2026-09-18T08:10:00.000Z'
            })
        ]
    },
    { id: 2, name: 'Work', icon: '', color: '#2196f3', tasks: [] },
    { id: 3, name: 'Study', icon: '', color: '#9c27b0', tasks: [] }
];

const TAG_DEFS = [{ name: 'work', color: '#e22134' }];

function task(id, text, extra) {
    return Object.assign(
        {
            id,
            text,
            completed: false,
            completedAt: null,
            priority: false,
            today: false,
            pinned: false,
            dueDate: null,
            remindTime: null,
            recurrence: null,
            streak: 0,
            lastStreakDate: null,
            pomodoros: 0,
            notes: '',
            subtasks: [],
            tags: [],
            notesOpen: false,
            subtasksOpen: false,
            createdAt: '2026-09-15T10:00:00.000Z'
        },
        extra
    );
}

const test = base.extend({
    page: async ({ page }, use) => {
        // A pinned clock keeps "Today", "Sep 10" and the header date stable.
        await page.clock.install({ time: NOW });

        await page.addInitScript(
            ([lists, tagDefs, today]) => {
                localStorage.clear();
                localStorage.setItem('taskLists', JSON.stringify(lists));
                localStorage.setItem('tagDefs', JSON.stringify(tagDefs));
                localStorage.setItem('currentListId', '1');
                localStorage.setItem('myDayDate', today);
                localStorage.setItem('taskIdCounter', '900');
                localStorage.setItem('lastExportAt', '2026-09-17T12:00:00.000Z');
                localStorage.setItem('taskTrash', JSON.stringify([]));
                localStorage.setItem(
                    'pomodoroData',
                    JSON.stringify({
                        history: [
                            { date: '2026-09-14', count: 2 },
                            { date: '2026-09-16', count: 5 },
                            { date: '2026-09-17', count: 3 },
                            { date: today, count: 4 }
                        ]
                    })
                );
            },
            [LISTS, TAG_DEFS, TODAY]
        );

        await use(page);
    }
});

/** Loads the app and waits until it is actually painted. */
async function openApp(page, { theme = 'dark' } = {}) {
    await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
    await page.goto('/index.html');
    await page.waitForSelector('.task-wrapper');
    // The webfont arrives after first paint and reflows every label.
    await page.evaluate(() => document.fonts.ready);
    // The radio bars animate; the pomodoro ring does not, but both settle here.
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
}

module.exports = { test, expect, openApp, TODAY };
