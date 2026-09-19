/**
 * Integration tests: the real index.html running in jsdom.
 *
 * lib.test.js covers the pure helpers. These cover the wiring — the parts that
 * until now were only ever checked by hand in a browser.
 */
const { boot, reset, addTaskText } = require('./helpers/boot.js');

let app;

beforeAll(() => {
    app = boot();
});

afterAll(() => {
    app.stop();
});

beforeEach(() => {
    reset();
});

const list = (id) => __app.lists.find((l) => l.id === id);
const activeTasks = () => list(__app.currentListId).tasks;

describe('the app boots', () => {
    test('renders its lists and a task container', () => {
        expect(document.getElementById('lists-container').children.length).toBe(2);
        expect(document.getElementById('tasks-all')).not.toBeNull();
    });

    test('fills every static icon slot', () => {
        const empty = [...document.querySelectorAll('[data-icon]')].filter((e) => !e.innerHTML);
        expect(empty).toHaveLength(0);
    });
});

describe('adding tasks', () => {
    test('adds a plain task and clears the input', () => {
        const task = addTaskText('Buy milk');
        expect(task.text).toBe('Buy milk');
        expect(task.completed).toBe(false);
        expect(document.getElementById('task-input').value).toBe('');
    });

    test('applies quick-add syntax end to end', () => {
        const task = addTaskText('Call the bank #work !today * ^');
        expect(task.text).toBe('Call the bank');
        expect(task.tags).toEqual(['work']);
        expect(task.dueDate).toBe(getTodayStr());
        expect(task.priority).toBe(true);
        expect(task.pinned).toBe(true);
        expect(task.today).toBe(true);
    });

    test('registers a colour for a tag invented in the input', () => {
        addTaskText('Ship it #release');
        expect(__app.tagDefs.map((d) => d.name)).toContain('release');
        expect(JSON.parse(localStorage.getItem('tagDefs'))).toHaveLength(1);
    });

    test('refuses a task that is only markers', () => {
        document.getElementById('task-input').value = '#work *';
        addTask();
        expect(activeTasks()).toHaveLength(0);
    });

    test('renders the new task into the list', () => {
        addTaskText('Visible task');
        expect(document.getElementById('tasks-all').textContent).toContain('Visible task');
    });
});

describe('completing tasks', () => {
    test('records when it was completed and clears it on undo', () => {
        const task = addTaskText('Write the report');
        toggleTask(task.id);
        expect(task.completed).toBe(true);
        expect(task.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        toggleTask(task.id);
        expect(task.completed).toBe(false);
        expect(task.completedAt).toBeNull();
    });

    test('a completed task leaves My Day but stays in All', () => {
        const task = addTaskText('Errand !today');
        toggleTask(task.id);
        switchView('today');
        expect(document.getElementById('tasks-today').textContent).not.toContain('Errand');
        switchView('all');
        expect(document.getElementById('tasks-all').textContent).toContain('Errand');
    });

    test('shows up in the Done view', () => {
        const task = addTaskText('Finished thing');
        toggleTask(task.id);
        switchView('done');
        expect(document.getElementById('tasks-done').textContent).toContain('Finished thing');
    });
});

describe('deleting and restoring', () => {
    test('a deleted task goes to the trash, not away', () => {
        const task = addTaskText('Oops');
        deleteTask(task.id);
        expect(activeTasks()).toHaveLength(0);
        expect(__app.trash).toHaveLength(1);
        expect(__app.trash[0].task.text).toBe('Oops');
    });

    test('restoring puts it back in the list it came from', () => {
        selectList(2);
        const task = addTaskText('Work item');
        deleteTask(task.id);
        selectList(1);
        restoreFromTrash(task.id);
        expect(__app.trash).toHaveLength(0);
        expect(list(2).tasks.map((t) => t.text)).toContain('Work item');
        expect(list(1).tasks).toHaveLength(0);
    });

    test('restoring a task whose list is gone does not lose it', () => {
        selectList(2);
        const task = addTaskText('Homeless');
        deleteTask(task.id);
        __app.lists = __app.lists.filter((l) => l.id !== 2);
        selectList(1);
        restoreFromTrash(task.id);
        expect(list(1).tasks.map((t) => t.text)).toContain('Homeless');
    });

    test('clearing completed tasks routes them through the trash too', () => {
        const a = addTaskText('One');
        addTaskText('Two');
        toggleTask(a.id);
        clearCompleted();
        modalConfirm();
        expect(activeTasks().map((t) => t.text)).toEqual(['Two']);
        expect(__app.trash.map((e) => e.task.text)).toEqual(['One']);
    });

    test('the trash survives a reload', () => {
        const task = addTaskText('Persisted');
        deleteTask(task.id);
        expect(JSON.parse(localStorage.getItem('taskTrash'))[0].task.text).toBe('Persisted');
    });
});

describe('recurrence', () => {
    test('completing a recurring task creates the next one', () => {
        const task = addTaskText('Standup');
        task.dueDate = '2026-09-18';
        task.recurrence = 'daily';
        toggleTask(task.id);
        const pending = activeTasks().filter((t) => !t.completed);
        expect(pending).toHaveLength(1);
        expect(pending[0].dueDate).toBe('2026-09-19');
        expect(pending[0].text).toBe('Standup');
    });

    test('the next instance starts clean', () => {
        const task = addTaskText('Weekly review');
        task.dueDate = '2026-09-18';
        task.recurrence = 'weekly';
        task.pomodoros = 4;
        task.subtasks = [{ id: 1, text: 'x', completed: true }];
        toggleTask(task.id);
        const next = activeTasks().find((t) => !t.completed);
        expect(next.dueDate).toBe('2026-09-25');
        expect(next.pomodoros).toBe(0);
        expect(next.completedAt).toBeNull();
        expect(next.subtasks).toEqual([]);
        expect(next.id).not.toBe(task.id);
    });

    test('a monthly task on the 31st lands on the last day of the next month', () => {
        const task = addTaskText('Rent');
        task.dueDate = '2026-01-31';
        task.recurrence = 'monthly';
        toggleTask(task.id);
        expect(activeTasks().find((t) => !t.completed).dueDate).toBe('2026-02-28');
    });

    test('no due date means no next instance', () => {
        const task = addTaskText('Someday habit');
        task.recurrence = 'daily';
        toggleTask(task.id);
        expect(activeTasks()).toHaveLength(1);
    });
});

describe('My Day', () => {
    test('clears itself when the date changes', () => {
        const task = addTaskText('Today only !today');
        expect(task.today).toBe(true);
        localStorage.setItem('myDayDate', '2020-01-01');
        expect(resetMyDayIfNewDay()).toBe(true);
        expect(task.today).toBe(false);
    });

    test('keeps what is there on the first run after an upgrade', () => {
        const task = addTaskText('Keep me !today');
        localStorage.removeItem('myDayDate');
        expect(resetMyDayIfNewDay()).toBe(false);
        expect(task.today).toBe(true);
    });

    test('suggests an overdue task and drops it once added', () => {
        const overdue = addTaskText('Late thing !2020-01-01');
        switchView('today');
        expect(document.querySelector('.myday-suggestions').textContent).toContain('Late thing');
        toggleToday(overdue.id);
        expect(document.querySelector('.myday-suggestions')).toBeNull();
        expect(document.getElementById('tasks-today').textContent).toContain('Late thing');
    });
});

describe('the detail panel', () => {
    test('opens on a task and shows its fields', () => {
        const task = addTaskText('Detailed task #work !today');
        openDetail(task.id);
        const panel = document.getElementById('detail-panel');
        expect(panel.classList.contains('open')).toBe(true);
        expect(panel.querySelector('.detail-title').value).toBe('Detailed task');
        expect(panel.textContent).toContain('work');
    });

    test('renaming from the panel updates the list', () => {
        const task = addTaskText('Old name');
        openDetail(task.id);
        saveDetailTitle(task.id, '  New name  ');
        expect(task.text).toBe('New name');
        expect(document.getElementById('tasks-all').textContent).toContain('New name');
    });

    test('an empty title is refused', () => {
        const task = addTaskText('Keeps its name');
        openDetail(task.id);
        saveDetailTitle(task.id, '   ');
        expect(task.text).toBe('Keeps its name');
    });

    test('changing a task from the menu refreshes the panel', () => {
        const task = addTaskText('Repeating');
        openDetail(task.id);
        expect(document.getElementById('detail-panel').textContent).toContain('Never');
        runTaskAction('repeat', task.id);
        expect(document.getElementById('detail-panel').textContent).toContain('daily');
    });

    test('closes itself when its task is deleted', () => {
        const task = addTaskText('Doomed');
        openDetail(task.id);
        deleteTask(task.id);
        renderDetail();
        expect(document.getElementById('detail-panel').classList.contains('open')).toBe(false);
        expect(__app.detailTaskId).toBeNull();
    });
});

describe('the task menu and its shortcuts', () => {
    test('every action renders with a label', () => {
        const task = addTaskText('Menu target');
        openTaskMenu(task.id, document.querySelector('[data-task-id="' + task.id + '"] .menu-btn'));
        const labels = [...document.querySelectorAll('.task-menu-item span')].map(
            (e) => e.textContent
        );
        expect(labels).toContain('Add to My Day');
        expect(labels).toContain('Delete');
        expect(labels.every((l) => l.trim().length > 0)).toBe(true);
        closeTaskMenu();
    });

    test('labels reflect the current state', () => {
        const task = addTaskText('Stateful');
        toggleToday(task.id);
        openTaskMenu(task.id, document.querySelector('[data-task-id="' + task.id + '"] .menu-btn'));
        expect(document.getElementById('task-menu').textContent).toContain('Remove from My Day');
        closeTaskMenu();
    });

    test('every key the menu advertises maps to a real action', () => {
        const ids = __app.TASK_ACTIONS.filter((a) => !a.sep).map((a) => a.id);
        Object.values(__app.TASK_KEYS).forEach((id) => expect(ids).toContain(id));
        __app.TASK_ACTIONS.filter((a) => !a.sep && a.keys).forEach((a) => {
            expect(Object.values(__app.TASK_KEYS)).toContain(a.id);
        });
    });

    test('f is focus mode, not a task action', () => {
        expect(__app.TASK_KEYS.f).toBeUndefined();
        expect(__app.TASK_KEYS.F).toBe('pomodoro');
    });

    test('running an action from the menu applies it', () => {
        const task = addTaskText('Act on me');
        runTaskAction('priority', task.id);
        expect(task.priority).toBe(true);
        runTaskAction('pin', task.id);
        expect(task.pinned).toBe(true);
    });
});

describe('the command palette', () => {
    test('lists global commands when empty', () => {
        openPalette();
        const labels = __app.paletteItems.map((i) => i.label);
        expect(labels).toContain('Go to My Day');
        expect(labels).toContain('Print this list');
        closePalette();
    });

    test('offers to create, then finds matching tasks', () => {
        addTaskText('Pagar a renda');
        addTaskText('Outra coisa');
        openPalette();
        document.getElementById('palette-input').value = 'renda';
        renderPalette();
        const items = __app.paletteItems;
        expect(items[0].group).toBe('Create');
        expect(items[0].label).toContain('renda');
        expect(items.filter((i) => i.group === 'Tasks').map((i) => i.label)).toEqual([
            'Pagar a renda',
        ]);
        closePalette();
    });

    test('searches across every list, not just the current one', () => {
        selectList(2);
        addTaskText('Work only item');
        selectList(1);
        openPalette();
        document.getElementById('palette-input').value = 'Work only';
        renderPalette();
        expect(__app.paletteItems.filter((i) => i.group === 'Tasks')).toHaveLength(1);
        closePalette();
    });

    test('creating from the palette understands quick-add syntax', () => {
        openPalette();
        document.getElementById('palette-input').value = 'Nova tarefa #casa *';
        renderPalette();
        __app.paletteItems[0].run();
        closePalette();
        const task = activeTasks()[0];
        expect(task.text).toBe('Nova tarefa');
        expect(task.tags).toEqual(['casa']);
        expect(task.priority).toBe(true);
    });

    test('opening a task result shows its panel and switches list', () => {
        selectList(2);
        const task = addTaskText('Find me');
        selectList(1);
        openPalette();
        document.getElementById('palette-input').value = 'Find me';
        renderPalette();
        __app.paletteItems.find((i) => i.group === 'Tasks').run();
        expect(__app.detailTaskId).toBe(task.id);
        expect(__app.currentListId).toBe(2);
    });
});

describe('escaping', () => {
    test('a task name cannot inject markup into the list', () => {
        addTaskText('<img src=x onerror=alert(1)>');
        const container = document.getElementById('tasks-all');
        expect(container.querySelector('img')).toBeNull();
        expect(container.textContent).toContain('<img src=x onerror=alert(1)>');
    });

    test('a tag name cannot break out of an inline handler', () => {
        const task = addTaskText('Target');
        __app.tagDefs = [{ name: 'x" onmouseover=window.__XSS=1//', color: '#e22134' }];
        openTagPicker(task.id);
        const picker = document.getElementById('tag-picker-div');
        expect(picker.querySelectorAll('[onmouseover]')).toHaveLength(0);
        expect(picker.textContent).toContain('onmouseover');
        promptCancel();
    });

    test('a list name is escaped in the sidebar', () => {
        __app.lists = [{ id: 9, name: '<b>bold</b>', icon: '', tasks: [] }];
        renderLists();
        const container = document.getElementById('lists-container');
        expect(container.querySelector('b')).toBeNull();
        expect(container.textContent).toContain('<b>bold</b>');
    });
});
