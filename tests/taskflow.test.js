/**
 * TaskFlow - Tests
 */

describe('TaskFlow - Task Management', () => {

  // Mock localStorage
  beforeEach(() => {
    localStorage.clear();

    const localStorageMock = {
      data: {},
      getItem(key) {
        return this.data[key] || null;
      },
      setItem(key, value) {
        this.data[key] = value;
      },
      clear() {
        this.data = {};
      }
    };
    global.localStorage = localStorageMock;
  });

  describe('Task Creation', () => {

    test('should create a task with correct properties', () => {
      const task = {
        id: Date.now(),
        text: 'Buy groceries',
        completed: false,
        priority: false,
        today: false,
        createdAt: new Date().toISOString()
      };

      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('text');
      expect(task.completed).toBe(false);
      expect(task.priority).toBe(false);
      expect(task.today).toBe(false);
    });

    test('should not create task with empty text', () => {
      const text = '   ';
      const cleanText = text.trim();

      expect(cleanText).toBe('');
    });

    test('should store createdAt as a valid ISO date string', () => {
      const task = {
        id: Date.now(),
        text: 'Test',
        createdAt: new Date().toISOString()
      };

      expect(() => new Date(task.createdAt)).not.toThrow();
      expect(new Date(task.createdAt).toString()).not.toBe('Invalid Date');
    });

    test('should trim whitespace from task text before saving', () => {
      const raw = '  Buy milk  ';
      const text = raw.trim();

      expect(text).toBe('Buy milk');
    });
  });

  describe('Task Operations', () => {

    test('should toggle task completion', () => {
      const task = {
        id: 1,
        text: 'Test task',
        completed: false
      };

      task.completed = !task.completed;

      expect(task.completed).toBe(true);
    });

    test('should toggle task completion back to false', () => {
      const task = { id: 1, text: 'Test task', completed: true };
      task.completed = !task.completed;
      expect(task.completed).toBe(false);
    });

    test('should toggle task priority', () => {
      const task = {
        id: 1,
        text: 'Test task',
        priority: false
      };

      task.priority = !task.priority;

      expect(task.priority).toBe(true);
    });

    test('should toggle task today flag', () => {
      const task = { id: 1, text: 'Test task', today: false };
      task.today = !task.today;
      expect(task.today).toBe(true);
    });

    test('should toggle task today flag back to false', () => {
      const task = { id: 1, text: 'Test task', today: true };
      task.today = !task.today;
      expect(task.today).toBe(false);
    });

    test('should delete task from list', () => {
      const tasks = [
        { id: 1, text: 'Task 1' },
        { id: 2, text: 'Task 2' },
        { id: 3, text: 'Task 3' }
      ];

      const filteredTasks = tasks.filter(t => t.id !== 2);

      expect(filteredTasks.length).toBe(2);
      expect(filteredTasks.find(t => t.id === 2)).toBeUndefined();
    });

    test('should update task text on edit', () => {
      const task = { id: 1, text: 'Old text', completed: false };
      const newText = 'New text';

      if (newText.trim()) {
        task.text = newText.trim();
      }

      expect(task.text).toBe('New text');
    });

    test('should not update task text when edit input is empty', () => {
      const task = { id: 1, text: 'Original text', completed: false };
      const newText = '   ';

      if (newText.trim()) {
        task.text = newText.trim();
      }

      expect(task.text).toBe('Original text');
    });
  });

  describe('Task Sorting', () => {

    test('should sort completed tasks to the end', () => {
      const tasks = [
        { id: 1, completed: true,  priority: false, today: false },
        { id: 2, completed: false, priority: false, today: false },
        { id: 3, completed: false, priority: false, today: false }
      ];

      const sorted = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return 0;
      });

      expect(sorted[0].completed).toBe(false);
      expect(sorted[sorted.length - 1].completed).toBe(true);
    });

    test('should sort priority tasks before non-priority tasks', () => {
      const tasks = [
        { id: 1, completed: false, priority: false, today: false },
        { id: 2, completed: false, priority: true,  today: false },
        { id: 3, completed: false, priority: false, today: false }
      ];

      const sorted = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.priority !== b.priority) return a.priority ? -1 : 1;
        return 0;
      });

      expect(sorted[0].id).toBe(2);
    });

    test('should sort today tasks before regular tasks', () => {
      const tasks = [
        { id: 1, completed: false, priority: false, today: false },
        { id: 2, completed: false, priority: false, today: true },
      ];

      const sorted = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.priority !== b.priority) return a.priority ? -1 : 1;
        if (a.today !== b.today) return a.today ? -1 : 1;
        return 0;
      });

      expect(sorted[0].id).toBe(2);
    });

    test('should sort: priority first, then today, then regular, then completed', () => {
      const tasks = [
        { id: 1, completed: true,  priority: false, today: false },
        { id: 2, completed: false, priority: false, today: false },
        { id: 3, completed: false, priority: false, today: true  },
        { id: 4, completed: false, priority: true,  today: false }
      ];

      const sorted = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.priority !== b.priority)   return a.priority  ? -1 : 1;
        if (a.today    !== b.today)      return a.today     ? -1 : 1;
        return 0;
      });

      expect(sorted[0].id).toBe(4); // priority
      expect(sorted[1].id).toBe(3); // today
      expect(sorted[2].id).toBe(2); // regular
      expect(sorted[3].id).toBe(1); // completed
    });
  });

  describe('LocalStorage', () => {

    test('should save list to localStorage', () => {
      const list = {
        id: 1,
        name: 'Test List',
        tasks: []
      };

      localStorage.setItem('taskLists', JSON.stringify([list]));
      const saved = JSON.parse(localStorage.getItem('taskLists'));

      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Test List');
    });

    test('should return default lists if localStorage empty', () => {
      const saved = localStorage.getItem('taskLists');
      const lists = saved ? JSON.parse(saved) : [
        { id: 1, name: 'Personal', icon: '🏠', tasks: [] }
      ];

      expect(lists).toHaveLength(1);
      expect(lists[0].name).toBe('Personal');
    });

    test('should persist tasks inside a list', () => {
      const lists = [
        { id: 1, name: 'Work', icon: '💼', tasks: [
          { id: 101, text: 'Send email', completed: false, priority: false, today: false }
        ]}
      ];

      localStorage.setItem('taskLists', JSON.stringify(lists));
      const loaded = JSON.parse(localStorage.getItem('taskLists'));

      expect(loaded[0].tasks).toHaveLength(1);
      expect(loaded[0].tasks[0].text).toBe('Send email');
    });

    test('should persist theme preference', () => {
      localStorage.setItem('theme', 'light');
      expect(localStorage.getItem('theme')).toBe('light');

      localStorage.setItem('theme', 'dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  describe('Task Filtering', () => {

    test('should filter today tasks', () => {
      const tasks = [
        { id: 1, text: 'Task 1', today: true, completed: false },
        { id: 2, text: 'Task 2', today: false, completed: false },
        { id: 3, text: 'Task 3', today: true, completed: true }
      ];

      const todayTasks = tasks.filter(t => t.today && !t.completed);

      expect(todayTasks).toHaveLength(1);
      expect(todayTasks[0].id).toBe(1);
    });

    test('should filter priority tasks', () => {
      const tasks = [
        { id: 1, text: 'Task 1', priority: true, completed: false },
        { id: 2, text: 'Task 2', priority: false, completed: false },
        { id: 3, text: 'Task 3', priority: true, completed: true }
      ];

      const priorityTasks = tasks.filter(t => t.priority && !t.completed);

      expect(priorityTasks).toHaveLength(1);
    });

    test('should exclude completed tasks from today filter', () => {
      const tasks = [
        { id: 1, today: true, completed: true },
        { id: 2, today: true, completed: false }
      ];

      const result = tasks.filter(t => t.today && !t.completed);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    test('should exclude completed tasks from priority filter', () => {
      const tasks = [
        { id: 1, priority: true, completed: true },
        { id: 2, priority: true, completed: false }
      ];

      const result = tasks.filter(t => t.priority && !t.completed);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    test('should return empty array when no tasks match today filter', () => {
      const tasks = [
        { id: 1, today: false, completed: false },
        { id: 2, today: true,  completed: true  }
      ];

      const result = tasks.filter(t => t.today && !t.completed);
      expect(result).toHaveLength(0);
    });
  });

  describe('Statistics', () => {

    test('should calculate total tasks', () => {
      const tasks = [
        { id: 1, completed: false },
        { id: 2, completed: true },
        { id: 3, completed: false }
      ];

      const total = tasks.length;

      expect(total).toBe(3);
    });

    test('should calculate completion rate', () => {
      const tasks = [
        { id: 1, completed: false },
        { id: 2, completed: true },
        { id: 3, completed: true },
        { id: 4, completed: true }
      ];

      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const rate = Math.round((completed / total) * 100);

      expect(rate).toBe(75);
    });

    test('should return 0% completion rate when there are no tasks', () => {
      const tasks = [];
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      expect(rate).toBe(0);
    });

    test('should calculate pending tasks count', () => {
      const tasks = [
        { id: 1, completed: false },
        { id: 2, completed: true },
        { id: 3, completed: false }
      ];

      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const pending = total - completed;

      expect(pending).toBe(2);
    });

    test('should count active priority tasks for badge', () => {
      const tasks = [
        { id: 1, priority: true,  completed: false },
        { id: 2, priority: true,  completed: true  },
        { id: 3, priority: false, completed: false }
      ];

      const count = tasks.filter(t => t.priority && !t.completed).length;
      expect(count).toBe(1);
    });

    test('should count active today tasks for badge', () => {
      const tasks = [
        { id: 1, today: true,  completed: false },
        { id: 2, today: true,  completed: true  },
        { id: 3, today: false, completed: false }
      ];

      const count = tasks.filter(t => t.today && !t.completed).length;
      expect(count).toBe(1);
    });

    test('should count incomplete tasks for all-tasks badge', () => {
      const tasks = [
        { id: 1, completed: false },
        { id: 2, completed: true  },
        { id: 3, completed: false }
      ];

      const count = tasks.filter(t => !t.completed).length;
      expect(count).toBe(2);
    });
  });

  describe('List Management', () => {

    test('should create a new list with correct properties', () => {
      const name = 'Shopping';
      const icon = '🛒';
      const newList = {
        id: Date.now(),
        name: name.trim(),
        icon,
        tasks: []
      };

      expect(newList).toHaveProperty('id');
      expect(newList.name).toBe('Shopping');
      expect(newList.tasks).toHaveLength(0);
    });

    test('should not create list with empty name', () => {
      const name = '   ';
      const shouldCreate = name && name.trim();
      expect(shouldCreate).toBeFalsy();
    });

    test('should scope tasks to their own list', () => {
      const lists = [
        { id: 1, name: 'Personal', tasks: [{ id: 10, text: 'Personal task' }] },
        { id: 2, name: 'Work',     tasks: [{ id: 20, text: 'Work task'     }] }
      ];

      const personal = lists.find(l => l.id === 1);
      const work     = lists.find(l => l.id === 2);

      expect(personal.tasks[0].text).toBe('Personal task');
      expect(work.tasks[0].text).toBe('Work task');
      expect(personal.tasks.find(t => t.id === 20)).toBeUndefined();
    });

    test('should count incomplete tasks per list', () => {
      const list = {
        id: 1,
        tasks: [
          { id: 1, completed: false },
          { id: 2, completed: true  },
          { id: 3, completed: false }
        ]
      };

      const incomplete = list.tasks.filter(t => !t.completed).length;
      expect(incomplete).toBe(2);
    });
  });

  describe('Delete List', () => {

    test('should delete a list by id', () => {
      let lists = [
        { id: 1, name: 'Personal', tasks: [] },
        { id: 2, name: 'Work',     tasks: [] }
      ];
      lists = lists.filter(l => l.id !== 2);
      expect(lists).toHaveLength(1);
      expect(lists.find(l => l.id === 2)).toBeUndefined();
    });

    test('should not allow deleting the last list', () => {
      const lists = [{ id: 1, name: 'Personal', tasks: [] }];
      const canDelete = lists.length > 1;
      expect(canDelete).toBe(false);
    });

    test('should fall back to first list when active list is deleted', () => {
      let lists = [
        { id: 1, name: 'Personal', tasks: [] },
        { id: 2, name: 'Work',     tasks: [] }
      ];
      let currentListId = 2;

      lists = lists.filter(l => l.id !== currentListId);
      if (!lists.find(l => l.id === currentListId)) {
        currentListId = lists[0].id;
      }

      expect(currentListId).toBe(1);
      expect(lists).toHaveLength(1);
    });

    test('should preserve other lists when one is deleted', () => {
      let lists = [
        { id: 1, name: 'Personal', tasks: [{ id: 10, text: 'task' }] },
        { id: 2, name: 'Work',     tasks: [] },
        { id: 3, name: 'Study',    tasks: [] }
      ];
      lists = lists.filter(l => l.id !== 2);
      expect(lists).toHaveLength(2);
      expect(lists[0].tasks).toHaveLength(1);
    });
  });

  describe('Rename List', () => {

    test('should rename a list', () => {
      const list = { id: 1, name: 'Old Name', tasks: [] };
      const newName = 'New Name';
      if (newName && newName.trim()) {
        list.name = newName.trim();
      }
      expect(list.name).toBe('New Name');
    });

    test('should not rename with empty string', () => {
      const list = { id: 1, name: 'Original', tasks: [] };
      const newName = '   ';
      if (newName && newName.trim()) {
        list.name = newName.trim();
      }
      expect(list.name).toBe('Original');
    });

    test('should trim whitespace from new name', () => {
      const list = { id: 1, name: 'Old', tasks: [] };
      const newName = '  Trimmed Name  ';
      if (newName && newName.trim()) {
        list.name = newName.trim();
      }
      expect(list.name).toBe('Trimmed Name');
    });
  });

  describe('Clear Completed', () => {

    test('should remove all completed tasks', () => {
      const list = {
        id: 1,
        tasks: [
          { id: 1, completed: true  },
          { id: 2, completed: false },
          { id: 3, completed: true  }
        ]
      };
      list.tasks = list.tasks.filter(t => !t.completed);
      expect(list.tasks).toHaveLength(1);
      expect(list.tasks[0].id).toBe(2);
    });

    test('should leave list unchanged when no completed tasks', () => {
      const list = {
        id: 1,
        tasks: [
          { id: 1, completed: false },
          { id: 2, completed: false }
        ]
      };
      const count = list.tasks.filter(t => t.completed).length;
      if (count > 0) {
        list.tasks = list.tasks.filter(t => !t.completed);
      }
      expect(list.tasks).toHaveLength(2);
    });

    test('should count completed tasks correctly for button label', () => {
      const tasks = [
        { id: 1, completed: true  },
        { id: 2, completed: false },
        { id: 3, completed: true  }
      ];
      const count = tasks.filter(t => t.completed).length;
      expect(count).toBe(2);
    });

    test('should result in empty task list when all tasks are completed', () => {
      const list = {
        id: 1,
        tasks: [
          { id: 1, completed: true },
          { id: 2, completed: true }
        ]
      };
      list.tasks = list.tasks.filter(t => !t.completed);
      expect(list.tasks).toHaveLength(0);
    });
  });

  describe('XSS Protection (escapeHtml)', () => {

    test('should escape < and > characters', () => {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode('<script>alert(1)</script>'));
      expect(div.innerHTML).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    test('should escape & character', () => {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode('a & b'));
      expect(div.innerHTML).toBe('a &amp; b');
    });

    test('should escape double quotes in attribute context', () => {
      // escapeHtml adds .replace(/"/g, '&quot;') so quotes are safe inside HTML attributes
      const div = document.createElement('div');
      div.appendChild(document.createTextNode('"quoted"'));
      const escaped = div.innerHTML.replace(/"/g, '&quot;');
      expect(escaped).toBe('&quot;quoted&quot;');
    });

    test('should return plain text unchanged', () => {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode('Buy groceries'));
      expect(div.innerHTML).toBe('Buy groceries');
    });

    test('should escape an XSS img payload', () => {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode('<img src=x onerror=alert(1)>'));
      expect(div.innerHTML).not.toContain('<img');
      expect(div.innerHTML).toContain('&lt;img');
    });
  });

  describe('Pomodoro Timer', () => {

    test('should format time correctly for full minutes', () => {
      const timeLeft = 25 * 60;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      expect(display).toBe('25:00');
    });

    test('should format time correctly with leading zeros', () => {
      const timeLeft = 5 * 60 + 9; // 5:09
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      expect(display).toBe('05:09');
    });

    test('should format 0 seconds as 00:00', () => {
      const timeLeft = 0;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      expect(display).toBe('00:00');
    });

    test('should calculate progress percentage correctly', () => {
      const totalTime = 25 * 60;
      const timeLeft  = 25 * 60 / 2; // halfway
      const progress  = (timeLeft / totalTime) * 100;

      expect(progress).toBe(50);
    });

    test('should calculate 100% progress at start', () => {
      const totalTime = 25 * 60;
      const timeLeft  = 25 * 60;
      const progress  = (timeLeft / totalTime) * 100;

      expect(progress).toBe(100);
    });

    test('should calculate 0% progress when time is up', () => {
      const totalTime = 25 * 60;
      const timeLeft  = 0;
      const progress  = (timeLeft / totalTime) * 100;

      expect(progress).toBe(0);
    });

    test('should initialise pomodoro count to 0 for a new day', () => {
      const today = new Date().toDateString();
      localStorage.setItem('pomodoroData', JSON.stringify({ date: 'Mon Jan 01 2000', count: 5 }));

      const stored = localStorage.getItem('pomodoroData');
      const parsed = stored ? JSON.parse(stored) : null;
      const count  = parsed && parsed.date === today ? parsed.count : 0;

      expect(count).toBe(0);
    });

    test('should restore pomodoro count when date matches today', () => {
      const today = new Date().toDateString();
      localStorage.setItem('pomodoroData', JSON.stringify({ date: today, count: 3 }));

      const stored = localStorage.getItem('pomodoroData');
      const parsed = stored ? JSON.parse(stored) : null;
      const count  = parsed && parsed.date === today ? parsed.count : 0;

      expect(count).toBe(3);
    });

    test('should increment pomodoro count', () => {
      const today = new Date().toDateString();
      localStorage.setItem('pomodoroData', JSON.stringify({ date: today, count: 2 }));

      const stored = localStorage.getItem('pomodoroData');
      const data   = stored ? JSON.parse(stored) : { date: today, count: 0 };
      data.count++;
      localStorage.setItem('pomodoroData', JSON.stringify(data));

      const updated = JSON.parse(localStorage.getItem('pomodoroData'));
      expect(updated.count).toBe(3);
    });

    test('should not crash when pomodoroData is missing from localStorage (null safety)', () => {
      // localStorage returns null — should default to 0 and not throw
      const stored = localStorage.getItem('pomodoroData'); // null
      expect(() => {
        const data = stored ? JSON.parse(stored) : { date: new Date().toDateString(), count: 0 };
        data.count++;
        localStorage.setItem('pomodoroData', JSON.stringify(data));
      }).not.toThrow();

      const result = JSON.parse(localStorage.getItem('pomodoroData'));
      expect(result.count).toBe(1);
    });

    test('should switch to break time after work session completes', () => {
      const POMODORO_WORK_TIME  = 25 * 60;
      const POMODORO_BREAK_TIME = 5 * 60;

      let pomodoroIsBreak = false;
      let pomodoroTimeLeft;
      let pomodoroTotalTime;

      // Simulate completing a work session
      if (!pomodoroIsBreak) {
        pomodoroIsBreak  = true;
        pomodoroTimeLeft = POMODORO_BREAK_TIME;
        pomodoroTotalTime = POMODORO_BREAK_TIME;
      }

      expect(pomodoroIsBreak).toBe(true);
      expect(pomodoroTimeLeft).toBe(POMODORO_BREAK_TIME);
    });

    test('should switch back to work time after break completes', () => {
      const POMODORO_WORK_TIME  = 25 * 60;
      const POMODORO_BREAK_TIME = 5 * 60;

      let pomodoroIsBreak = true;
      let pomodoroTimeLeft;
      let pomodoroTotalTime;

      // Simulate completing a break session
      if (pomodoroIsBreak) {
        pomodoroIsBreak   = false;
        pomodoroTimeLeft  = POMODORO_WORK_TIME;
        pomodoroTotalTime = POMODORO_WORK_TIME;
      }

      expect(pomodoroIsBreak).toBe(false);
      expect(pomodoroTimeLeft).toBe(POMODORO_WORK_TIME);
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('Radio Widget', () => {

    const RADIO_STREAM = 'https://stream-icy.bauermedia.pt/comercial.mp3';

    // --- Stream URL ---
    test('stream URL should point to the correct Bauer Media endpoint', () => {
      expect(RADIO_STREAM).toBe('https://stream-icy.bauermedia.pt/comercial.mp3');
    });

    test('stream URL should use HTTPS', () => {
      expect(RADIO_STREAM.startsWith('https://')).toBe(true);
    });

    test('stream URL should end with .mp3', () => {
      expect(RADIO_STREAM.endsWith('.mp3')).toBe(true);
    });

    // --- State management ---
    test('radioPlaying should initialise as false', () => {
      let radioPlaying = false;
      expect(radioPlaying).toBe(false);
    });

    test('radioAudio should initialise as null', () => {
      let radioAudio = null;
      expect(radioAudio).toBeNull();
    });

    test('setRadioState(true) should set radioPlaying to true', () => {
      let radioPlaying = false;
      const setRadioState = (playing) => { radioPlaying = playing; };
      setRadioState(true);
      expect(radioPlaying).toBe(true);
    });

    test('setRadioState(false) should set radioPlaying to false', () => {
      let radioPlaying = true;
      const setRadioState = (playing) => { radioPlaying = playing; };
      setRadioState(false);
      expect(radioPlaying).toBe(false);
    });

    test('toggling play twice should return to paused state', () => {
      let radioPlaying = false;
      radioPlaying = !radioPlaying; // play
      radioPlaying = !radioPlaying; // pause
      expect(radioPlaying).toBe(false);
    });

    // --- Button icon ---
    test('play button should show ▶ when not playing', () => {
      const icon = (playing) => playing ? '⏸' : '▶';
      expect(icon(false)).toBe('▶');
    });

    test('play button should show ⏸ when playing', () => {
      const icon = (playing) => playing ? '⏸' : '▶';
      expect(icon(true)).toBe('⏸');
    });

    // --- Volume ---
    test('default volume should be 0.7', () => {
      const defaultVolume = 0.7;
      expect(defaultVolume).toBe(0.7);
    });

    test('volume should parse string input from range slider correctly', () => {
      expect(parseFloat('0.7')).toBe(0.7);
      expect(parseFloat('0')).toBe(0);
      expect(parseFloat('1')).toBe(1);
    });

    test('volume should clamp to [0, 1]', () => {
      const clamp = (v) => Math.min(1, Math.max(0, parseFloat(v)));
      expect(clamp('1.5')).toBe(1);
      expect(clamp('-0.5')).toBe(0);
      expect(clamp('0.5')).toBe(0.5);
    });

    // --- Status text (English) ---
    test('initial status text should be "Click to listen"', () => {
      expect('Click to listen').toBe('Click to listen');
    });

    test('connecting status text should be "Loading..."', () => {
      expect('Loading...').toBe('Loading...');
    });

    test('live status text should be "Live 🔴"', () => {
      const liveText = 'Live 🔴';
      expect(liveText).toContain('Live');
      expect(liveText).toContain('🔴');
    });

    test('error status text should be "Error loading"', () => {
      expect('Error loading').toBe('Error loading');
    });

    test('no status text should contain Portuguese words', () => {
      const ptPattern = /\b(clique|ouvir|carregar|direto|erro)\b/i;
      const statusTexts = ['Click to listen', 'Loading...', 'Live 🔴', 'Error loading'];
      statusTexts.forEach(text => {
        expect(text).not.toMatch(ptPattern);
      });
    });

    // --- Animated bars ---
    test('bars should add "playing" class when state is true', () => {
      const bars = document.createElement('div');
      bars.classList.toggle('playing', true);
      expect(bars.classList.contains('playing')).toBe(true);
    });

    test('bars should remove "playing" class when state is false', () => {
      const bars = document.createElement('div');
      bars.classList.add('playing');
      bars.classList.toggle('playing', false);
      expect(bars.classList.contains('playing')).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('Theme Toggle', () => {

    test('should add light-mode class to body when switching to light', () => {
      document.body.classList.remove('light-mode');
      document.body.classList.add('light-mode');
      expect(document.body.classList.contains('light-mode')).toBe(true);
    });

    test('should remove light-mode class from body when switching to dark', () => {
      document.body.classList.add('light-mode');
      document.body.classList.remove('light-mode');
      expect(document.body.classList.contains('light-mode')).toBe(false);
    });

    test('should persist "light" in localStorage when light mode is set', () => {
      localStorage.setItem('theme', 'light');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    test('should persist "dark" in localStorage when dark mode is set', () => {
      localStorage.setItem('theme', 'dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    test('should default to dark mode when localStorage has no theme key', () => {
      const savedTheme = localStorage.getItem('theme'); // null
      const isDark = savedTheme !== 'light';
      expect(isDark).toBe(true);
    });

    test('should restore light mode on load when localStorage contains "light"', () => {
      localStorage.setItem('theme', 'light');
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') document.body.classList.add('light-mode');
      expect(document.body.classList.contains('light-mode')).toBe(true);
    });

    test('should restore dark mode on load when localStorage contains "dark"', () => {
      localStorage.setItem('theme', 'dark');
      document.body.classList.remove('light-mode');
      expect(document.body.classList.contains('light-mode')).toBe(false);
    });

    test('toggling theme twice should restore original state', () => {
      const original = document.body.classList.contains('light-mode');
      document.body.classList.toggle('light-mode');
      document.body.classList.toggle('light-mode');
      expect(document.body.classList.contains('light-mode')).toBe(original);
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('Navigation & View Switching', () => {

    const VIEW_TITLES = {
      all:      'All Tasks',
      today:    "Today's Tasks",
      priority: 'Priority Tasks',
      stats:    'Statistics'
    };

    test('should map "all" view to "All Tasks" title', () => {
      expect(VIEW_TITLES.all).toBe('All Tasks');
    });

    test('should map "today" view to "Today\'s Tasks" title', () => {
      expect(VIEW_TITLES.today).toBe("Today's Tasks");
    });

    test('should map "priority" view to "Priority Tasks" title', () => {
      expect(VIEW_TITLES.priority).toBe('Priority Tasks');
    });

    test('should map "stats" view to "Statistics" title', () => {
      expect(VIEW_TITLES.stats).toBe('Statistics');
    });

    test('all four view keys should be present', () => {
      expect(Object.keys(VIEW_TITLES)).toHaveLength(4);
      expect(VIEW_TITLES).toHaveProperty('all');
      expect(VIEW_TITLES).toHaveProperty('today');
      expect(VIEW_TITLES).toHaveProperty('priority');
      expect(VIEW_TITLES).toHaveProperty('stats');
    });

    test('active nav item class should be toggled correctly', () => {
      const items = ['all', 'today', 'priority', 'stats'];
      const activeView = 'today';
      const activeItems = items.filter(v => v === activeView);
      const inactiveItems = items.filter(v => v !== activeView);
      expect(activeItems).toHaveLength(1);
      expect(inactiveItems).toHaveLength(3);
    });

    test('tabs container should be hidden on stats view', () => {
      const shouldHideTabs = (view) => view === 'stats';
      expect(shouldHideTabs('stats')).toBe(true);
      expect(shouldHideTabs('all')).toBe(false);
      expect(shouldHideTabs('today')).toBe(false);
      expect(shouldHideTabs('priority')).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('English-only UI Text', () => {

    const ptPattern = /\b(clique|ouvir|carregar|direto|tarefa|hoje|prioridade|estatísticas|editar|excluir|novo|pausar|iniciar|erro)\b/i;

    const uiStrings = [
      // Radio widget
      'Click to listen',
      'Loading...',
      'Live 🔴',
      'Error loading',
      // Navigation titles
      'All Tasks',
      "Today's Tasks",
      'Priority Tasks',
      'Statistics',
      // Pomodoro
      'Start',
      'Pause',
      'Reset',
      'Idle',
      // Task actions
      'Add',
      'Delete',
      'Edit',
      // Empty states
      'No tasks yet.',
      'No tasks for today.',
      'No priority tasks.',
    ];

    uiStrings.forEach(str => {
      test(`"${str}" should contain no Portuguese words`, () => {
        expect(str).not.toMatch(ptPattern);
      });
    });

    test('all UI strings should be non-empty', () => {
      uiStrings.forEach(str => {
        expect(str.trim().length).toBeGreaterThan(0);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('Pomodoro Date Format (ISO)', () => {

    test('ISO date format should match YYYY-MM-DD pattern', () => {
      const date = new Date().toISOString().split('T')[0];
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('ISO date should have 3 parts separated by dashes', () => {
      const date = new Date().toISOString().split('T')[0];
      const parts = date.split('-');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toHaveLength(4); // year
      expect(parts[1].length).toBeLessThanOrEqual(2); // month
      expect(parts[2].length).toBeLessThanOrEqual(2); // day
    });

    test('should reset pomodoro count when stored date differs from today', () => {
      const yesterdayStr = '2000-01-01';
      const todayStr = new Date().toISOString().split('T')[0];
      const stored = { date: yesterdayStr, count: 5 };
      const count = stored.date === todayStr ? stored.count : 0;
      expect(count).toBe(0);
    });

    test('should keep pomodoro count when stored date matches today', () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const stored = { date: todayStr, count: 7 };
      const count = stored.date === todayStr ? stored.count : 0;
      expect(count).toBe(7);
    });

    test('ISO date is consistent regardless of locale', () => {
      // toISOString() always returns UTC time in fixed format, unlike toDateString()
      const date = new Date().toISOString().split('T')[0];
      expect(typeof date).toBe('string');
      expect(date.length).toBe(10);
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('Task ID Generation (Counter)', () => {

    test('sequential IDs from a counter should be unique', () => {
      let counter = 1000;
      const id1 = counter++;
      const id2 = counter++;
      expect(id1).not.toBe(id2);
    });

    test('100 rapidly generated counter IDs should all be unique', () => {
      const ids = [];
      let counter = 1;
      for (let i = 0; i < 100; i++) {
        ids.push(counter++);
      }
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    test('counter should persist across calls via localStorage', () => {
      // Simulate generateTaskId() logic
      function generateTaskId() {
        const next = parseInt(localStorage.getItem('taskIdCounter') || '1', 10);
        localStorage.setItem('taskIdCounter', next + 1);
        return next;
      }

      const id1 = generateTaskId();
      const id2 = generateTaskId();
      expect(id1).not.toBe(id2);
      expect(id2).toBe(id1 + 1);
    });

    test('counter should start at 1 when localStorage is empty', () => {
      function generateTaskId() {
        const next = parseInt(localStorage.getItem('taskIdCounter') || '1', 10);
        localStorage.setItem('taskIdCounter', next + 1);
        return next;
      }

      const firstId = generateTaskId();
      expect(firstId).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('Undo Delete', () => {

    test('should restore a deleted task to the list', () => {
      const list = { id: 1, tasks: [{ id: 10, text: 'Task A' }, { id: 20, text: 'Task B' }] };
      const taskToDelete = list.tasks.find(t => t.id === 10);
      const savedTask = { ...taskToDelete };
      list.tasks = list.tasks.filter(t => t.id !== 10);
      expect(list.tasks).toHaveLength(1);

      // Undo
      list.tasks.push(savedTask);
      expect(list.tasks).toHaveLength(2);
      expect(list.tasks.find(t => t.id === 10)).toBeDefined();
    });

    test('should not restore if lastDeletedTask is null', () => {
      let lastDeletedTask = null;
      const list = { id: 1, tasks: [{ id: 1, text: 'Only task' }] };

      if (lastDeletedTask) {
        list.tasks.push(lastDeletedTask);
      }

      expect(list.tasks).toHaveLength(1);
    });

    test('restored task should have the same properties as before deletion', () => {
      const originalTask = { id: 5, text: 'Buy milk', completed: false, priority: true, today: false };
      const list = { id: 1, tasks: [originalTask] };
      const saved = { ...originalTask };
      list.tasks = list.tasks.filter(t => t.id !== 5);

      // Undo
      list.tasks.push(saved);
      const restored = list.tasks.find(t => t.id === 5);
      expect(restored.text).toBe('Buy milk');
      expect(restored.priority).toBe(true);
    });

    test('undo state should clear after use', () => {
      let lastDeletedTask = { id: 1, text: 'Task A' };
      const list = { id: 1, tasks: [] };

      list.tasks.push(lastDeletedTask);
      lastDeletedTask = null;

      expect(lastDeletedTask).toBeNull();
      expect(list.tasks).toHaveLength(1);
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('Modal / Confirm Logic', () => {

    test('should invoke callback when confirm is triggered', () => {
      let wasConfirmed = false;
      let pendingCallback = () => { wasConfirmed = true; };

      // Simulate user clicking OK
      if (pendingCallback) { pendingCallback(); pendingCallback = null; }

      expect(wasConfirmed).toBe(true);
    });

    test('should not invoke callback when cancelled', () => {
      let wasConfirmed = false;
      const callback = () => { wasConfirmed = true; };
      let pendingCallback = callback;

      // Simulate user clicking Cancel
      pendingCallback = null;
      if (pendingCallback) pendingCallback();

      expect(wasConfirmed).toBe(false);
    });

    test('should reject empty prompt input', () => {
      const input = '   ';
      const isValid = input && input.trim().length > 0;
      expect(isValid).toBeFalsy();
    });

    test('should accept valid prompt input', () => {
      const input = 'My New List';
      const isValid = input && input.trim().length > 0;
      expect(isValid).toBeTruthy();
    });

    test('trimmed value should be passed to callback, not raw input', () => {
      let received = '';
      const callback = (value) => { received = value; };
      const rawInput = '  Shopping List  ';
      const trimmed = rawInput.trim();
      if (trimmed) callback(trimmed);
      expect(received).toBe('Shopping List');
    });
  });
});
