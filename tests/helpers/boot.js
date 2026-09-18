/**
 * Boots the real app inside jsdom.
 *
 * index.html keeps its markup and its logic in one file, so the only way to
 * test the behaviour rather than a copy of it is to load that file and run it.
 * The body markup goes into the document, then lib.js and the inline script are
 * evaluated in the global scope — which is where the app expects to live, since
 * its onclick attributes resolve against it.
 *
 * Top-level `function` declarations in an indirect eval land on the global, so
 * tests call app functions directly. `let` bindings do not, so a small accessor
 * object is appended to reach and reset state.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

const STATE_GLUE = `
;globalThis.__app = {
    get lists() { return lists; },
    set lists(v) { lists = v; },
    get trash() { return trash; },
    set trash(v) { trash = v; },
    get tagDefs() { return tagDefs; },
    set tagDefs(v) { tagDefs = v; },
    get currentListId() { return currentListId; },
    get currentView() { return currentView; },
    get detailTaskId() { return detailTaskId; },
    get pomodoroTaskId() { return pomodoroTaskId; },
    get paletteOpen() { return paletteOpen; },
    get paletteItems() { return paletteItems; },
    get focusMode() { return focusMode; },
    get compactMode() { return compactMode; },
    // const bindings live in the declarative global record, not on globalThis
    get TASK_ACTIONS() { return TASK_ACTIONS; },
    get TASK_KEYS() { return TASK_KEYS; },
    get RECURRENCES() { return RECURRENCES; }
};
`;

function boot() {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const lib = fs.readFileSync(path.join(ROOT, 'lib.js'), 'utf8');

    const appSrc = html.match(/<script>([\s\S]*)<\/script>/)[1];
    const body = html.match(/<body>([\s\S]*)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g, '');

    document.body.innerHTML = body;

    // The app starts two pollers; hold their ids so the suite can exit.
    const intervals = [];
    const realSetInterval = globalThis.setInterval;
    globalThis.setInterval = function (fn, ms) {
        const id = realSetInterval(fn, ms);
        intervals.push(id);
        return id;
    };

    try {
        (0, eval)(lib + '\n' + appSrc + '\n' + STATE_GLUE);
    } finally {
        globalThis.setInterval = realSetInterval;
    }

    return {
        stop() { intervals.forEach(clearInterval); }
    };
}

/** A clean slate between tests, without re-evaluating the app. */
function reset() {
    localStorage.clear();
    globalThis.__app.lists = [
        { id: 1, name: 'Personal', icon: 'P', tasks: [] },
        { id: 2, name: 'Work', icon: 'W', tasks: [] }
    ];
    globalThis.__app.trash = [];
    globalThis.__app.tagDefs = [];
    globalThis.selectList(1);
    globalThis.switchView('all');
    if (globalThis.__app.detailTaskId !== null) globalThis.closeDetail();
}

/** Adds a task through the real input path, returning the created task. */
function addTaskText(text) {
    document.getElementById('task-input').value = text;
    globalThis.addTask();
    const tasks = globalThis.__app.lists.find(l => l.id === globalThis.__app.currentListId).tasks;
    return tasks[tasks.length - 1];
}

module.exports = { boot, reset, addTaskText };
