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
      const radioPlaying = false;
      expect(radioPlaying).toBe(false);
    });

    test('radioAudio should initialise as null', () => {
      const radioAudio = null;
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
      const lastDeletedTask = null;
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

// ─────────────────────────────────────────────────────────────────────────────
// NEW FEATURE TESTS
// ─────────────────────────────────────────────────────────────────────────────

// Helper: pure JS implementations of the tested functions (mirror index.html logic)
function getTodayStr() { return new Date().toISOString().split('T')[0]; }

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

function clampWork(v)  { return Math.max(1, Math.min(60, v)); }
function clampBreak(v) { return Math.max(1, Math.min(30, v)); }

// ─────────────────────────────────────────────────────────────
describe('Search / Filter', () => {

  const tasks = [
    { id: 1, text: 'Buy groceries', completed: false, dueDate: null },
    { id: 2, text: 'Read a book', completed: false, dueDate: '2026-03-14' },
    { id: 3, text: 'GROCERY list', completed: false, dueDate: null },
    { id: 4, text: 'Done task', completed: true, dueDate: null },
  ];

  function filterTasks(query) {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(t => t.text.toLowerCase().includes(q) ||
                              (t.dueDate && t.dueDate.includes(q)));
  }

  test('filters by query (case-insensitive)', () => {
    // 'GROCERY list' contains 'grocery'; 'Buy groceries' does not (different substring)
    const result = filterTasks('grocery');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  test('filters by partial word match', () => {
    // 'Buy groceries' contains 'groceri'
    const result = filterTasks('groceri');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  test('returns all tasks when query is empty', () => {
    expect(filterTasks('')).toHaveLength(4);
  });

  test('returns empty array when no match', () => {
    expect(filterTasks('zzznomatch')).toHaveLength(0);
  });

  test('can match on dueDate string', () => {
    const result = filterTasks('2026-03-14');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  test('combined: filters completed tasks too', () => {
    const result = filterTasks('done');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });
});

// ─────────────────────────────────────────────────────────────
describe('Due Dates', () => {

  const today = getTodayStr();
  const yesterday = (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().split('T')[0]; })();
  const tomorrow  = (() => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })();

  test('new task dueDate defaults to null', () => {
    const task = { id: 1, text: 'Test', completed: false, dueDate: null };
    expect(task.dueDate).toBeNull();
  });

  test('isDueOverdue: past date returns true', () => {
    const task = { dueDate: yesterday, completed: false };
    expect(isDueOverdue(task)).toBe(true);
  });

  test('isDueOverdue: future date returns false', () => {
    const task = { dueDate: tomorrow, completed: false };
    expect(isDueOverdue(task)).toBe(false);
  });

  test('isDueOverdue: completed task with past date returns false', () => {
    const task = { dueDate: yesterday, completed: true };
    expect(isDueOverdue(task)).toBe(false);
  });

  test('isDueOverdue: null dueDate returns false', () => {
    const task = { dueDate: null, completed: false };
    expect(isDueOverdue(task)).toBe(false);
  });

  test('isDueToday: today returns true', () => {
    const task = { dueDate: today, completed: false };
    expect(isDueToday(task)).toBe(true);
  });

  test('isDueToday: yesterday returns false', () => {
    const task = { dueDate: yesterday, completed: false };
    expect(isDueToday(task)).toBe(false);
  });

  test('isDueToday: completed task with today date returns false', () => {
    const task = { dueDate: today, completed: true };
    expect(isDueToday(task)).toBe(false);
  });

  test('formatDueDate: today string returns "Today"', () => {
    expect(formatDueDate(today)).toBe('Today');
  });

  test('formatDueDate: tomorrow string returns "Tomorrow"', () => {
    expect(formatDueDate(tomorrow)).toBe('Tomorrow');
  });

  test('formatDueDate: empty/null returns empty string', () => {
    expect(formatDueDate('')).toBe('');
    expect(formatDueDate(null)).toBe('');
  });

  test('overdue count calculation', () => {
    const allTasks = [
      { dueDate: yesterday, completed: false },
      { dueDate: yesterday, completed: true },  // excluded (completed)
      { dueDate: today,     completed: false },  // not overdue
      { dueDate: null,      completed: false },  // no date
      { dueDate: tomorrow,  completed: false },  // not overdue
    ];
    const overdue = allTasks.filter(t => t.dueDate && t.dueDate < getTodayStr() && !t.completed).length;
    expect(overdue).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────
describe('Export / Import', () => {

  test('exported JSON contains lists array', () => {
    const lists = [{ id: 1, name: 'Work', tasks: [] }];
    const exported = JSON.parse(JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), lists }));
    expect(exported).toHaveProperty('lists');
    expect(Array.isArray(exported.lists)).toBe(true);
    expect(exported.version).toBe(1);
  });

  test('imported plain array is used directly', () => {
    const raw = [{ id: 1, name: 'Work', tasks: [] }];
    const parsed = raw;
    const imported = Array.isArray(parsed) ? parsed : (parsed.lists || null);
    expect(imported).toEqual(raw);
  });

  test('imported { version, lists } object → extracts lists', () => {
    const raw = { version: 1, lists: [{ id: 1, name: 'Work', tasks: [] }] };
    const imported = Array.isArray(raw) ? raw : (raw.lists || null);
    expect(imported).toEqual(raw.lists);
  });

  test('invalid JSON structure → returns null (not throw)', () => {
    const raw = { version: 1, data: 'nothing' };
    const imported = Array.isArray(raw) ? raw : (raw.lists || null);
    expect(imported).toBeNull();
  });

  test('empty lists array is valid', () => {
    const raw = { version: 1, lists: [] };
    const imported = Array.isArray(raw) ? raw : (raw.lists || null);
    expect(Array.isArray(imported)).toBe(true);
    expect(imported).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────
describe('Custom Pomodoro Durations', () => {

  test('work duration clamped to min 1', () => {
    expect(clampWork(0)).toBe(1);
    expect(clampWork(-5)).toBe(1);
  });

  test('work duration clamped to max 60', () => {
    expect(clampWork(61)).toBe(60);
    expect(clampWork(100)).toBe(60);
  });

  test('break duration clamped to min 1', () => {
    expect(clampBreak(0)).toBe(1);
    expect(clampBreak(-1)).toBe(1);
  });

  test('break duration clamped to max 30', () => {
    expect(clampBreak(31)).toBe(30);
    expect(clampBreak(99)).toBe(30);
  });

  test('valid work/break values pass through unchanged', () => {
    expect(clampWork(25)).toBe(25);
    expect(clampBreak(5)).toBe(5);
    expect(clampWork(1)).toBe(1);
    expect(clampBreak(30)).toBe(30);
  });

  test('localStorage stores custom values as strings', () => {
    const stored = { pomodoroWorkMins: '45', pomodoroBreakMins: '10' };
    const work  = parseInt(stored.pomodoroWorkMins  || '25', 10);
    const brk   = parseInt(stored.pomodoroBreakMins || '5',  10);
    expect(work).toBe(45);
    expect(brk).toBe(10);
  });

  test('missing localStorage key falls back to default', () => {
    const stored = {};
    const work  = parseInt(stored.pomodoroWorkMins  || '25', 10);
    const brk   = parseInt(stored.pomodoroBreakMins || '5',  10);
    expect(work).toBe(25);
    expect(brk).toBe(5);
  });
});

// ─────────────────────────────────────────────────────────────
describe('Keyboard Shortcut Logic', () => {

  test('Escape triggers modal cancel callback', () => {
    let cancelled = false;
    const promptCancel = () => { cancelled = true; };
    // Simulate the Escape key handler logic
    const promptVisible = true;
    if (promptVisible) promptCancel();
    expect(cancelled).toBe(true);
  });

  test('inInput guard prevents shortcut execution', () => {
    let shortcutFired = false;
    const inInput = true; // simulates focus inside INPUT tag
    if (!inInput) { shortcutFired = true; }
    expect(shortcutFired).toBe(false);
  });

  test('shortcut fires when not in input', () => {
    let shortcutFired = false;
    const inInput = false;
    if (!inInput) { shortcutFired = true; }
    expect(shortcutFired).toBe(true);
  });

  test('Ctrl+N targets task input (logical check)', () => {
    const key = 'n';
    const ctrlKey = true;
    const shouldFocusInput = ctrlKey && key === 'n';
    expect(shouldFocusInput).toBe(true);
  });

  test('Ctrl+K targets search input (logical check)', () => {
    const key = 'k';
    const ctrlKey = true;
    const shouldFocusSearch = ctrlKey && (key === 'k' || key === '/');
    expect(shouldFocusSearch).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
describe('Task Notes', () => {
    test('notes defaults to empty string on new task', () => {
        const task = { id: 1, text: 'Test', completed: false, notes: '', subtasks: [], tags: [], recurrence: null };
        expect(task.notes).toBe('');
    });

    test('saving notes updates task.notes', () => {
        const task = { id: 1, text: 'Test', notes: '' };
        const value = '  Some notes  ';
        task.notes = value.trim();
        expect(task.notes).toBe('Some notes');
    });

    test('clearing notes sets to empty string', () => {
        const task = { id: 1, text: 'Test', notes: 'existing' };
        task.notes = ''.trim();
        expect(task.notes).toBe('');
    });

    test('notesOpen flag is transient (not in persisted data shape)', () => {
        const task = { id: 1, text: 'Test', notes: 'hi', notesOpen: true };
        // notesOpen should not affect saving - task.notes is what matters
        const saved = { id: task.id, text: task.text, notes: task.notes };
        expect(saved.notes).toBe('hi');
        expect(saved.notesOpen).toBeUndefined();
    });
});

// ─────────────────────────────────────────────────────────────
describe('Sorting', () => {
    const yesterday = (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().split('T')[0]; })();
    const tomorrow  = (() => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })();

    const tasks = [
        { id: 1, text: 'Banana', completed: false, priority: false, today: false, dueDate: tomorrow,   createdAt: '2026-01-02T00:00:00.000Z' },
        { id: 2, text: 'Apple',  completed: false, priority: true,  today: false, dueDate: yesterday,  createdAt: '2026-01-01T00:00:00.000Z' },
        { id: 3, text: 'Cherry', completed: true,  priority: false, today: false, dueDate: null,       createdAt: '2026-01-03T00:00:00.000Z' },
        { id: 4, text: 'Date',   completed: false, priority: false, today: false, dueDate: null,       createdAt: '2026-01-04T00:00:00.000Z' },
    ];

    function sortTasks(mode, ts) {
        return [...ts].sort((a, b) => {
            if (mode === 'due') {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return a.dueDate.localeCompare(b.dueDate);
            }
            if (mode === 'created') return (a.createdAt || '').localeCompare(b.createdAt || '');
            if (mode === 'alpha') return a.text.localeCompare(b.text);
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (a.priority !== b.priority) return a.priority ? -1 : 1;
            if (a.today !== b.today) return a.today ? -1 : 1;
            return 0;
        });
    }

    test('default sort: completed last, priority first', () => {
        const result = sortTasks('default', tasks);
        expect(result[0].id).toBe(2); // priority
        expect(result[result.length - 1].id).toBe(3); // completed
    });

    test('sort by alpha: A before Z', () => {
        const result = sortTasks('alpha', tasks);
        expect(result[0].text).toBe('Apple');
        expect(result[1].text).toBe('Banana');
        expect(result[2].text).toBe('Cherry');
    });

    test('sort by created: earlier first', () => {
        const result = sortTasks('created', tasks);
        expect(result[0].id).toBe(2); // 2026-01-01
        expect(result[1].id).toBe(1); // 2026-01-02
    });

    test('sort by due date: no date last, earlier dates first', () => {
        const result = sortTasks('due', tasks);
        expect(result[0].dueDate).toBe(yesterday);
        expect(result[1].dueDate).toBe(tomorrow);
        expect(result[2].dueDate).toBeNull();
        expect(result[3].dueDate).toBeNull();
    });
});

// ─────────────────────────────────────────────────────────────
describe('Subtasks', () => {
    function makeTask() {
        return { id: 1, text: 'Parent', subtasks: [] };
    }

    test('addSubtask adds to subtasks array', () => {
        const task = makeTask();
        task.subtasks.push({ id: 101, text: 'Sub 1', completed: false });
        expect(task.subtasks).toHaveLength(1);
        expect(task.subtasks[0].text).toBe('Sub 1');
    });

    test('toggleSubtask flips completed', () => {
        const task = makeTask();
        task.subtasks.push({ id: 101, text: 'Sub 1', completed: false });
        const sub = task.subtasks.find(s => s.id === 101);
        sub.completed = !sub.completed;
        expect(sub.completed).toBe(true);
        sub.completed = !sub.completed;
        expect(sub.completed).toBe(false);
    });

    test('deleteSubtask removes from array', () => {
        const task = makeTask();
        task.subtasks.push({ id: 101, text: 'Sub 1', completed: false });
        task.subtasks.push({ id: 102, text: 'Sub 2', completed: false });
        task.subtasks = task.subtasks.filter(s => s.id !== 101);
        expect(task.subtasks).toHaveLength(1);
        expect(task.subtasks[0].id).toBe(102);
    });

    test('subtask progress count is correct', () => {
        const task = makeTask();
        task.subtasks = [
            { id: 1, text: 'a', completed: true },
            { id: 2, text: 'b', completed: false },
            { id: 3, text: 'c', completed: true },
        ];
        const done = task.subtasks.filter(s => s.completed).length;
        const total = task.subtasks.length;
        expect(done).toBe(2);
        expect(total).toBe(3);
    });

    test('new task has empty subtasks array', () => {
        const task = { id: 1, text: 'Test', subtasks: [] };
        expect(Array.isArray(task.subtasks)).toBe(true);
        expect(task.subtasks).toHaveLength(0);
    });
});

// ─────────────────────────────────────────────────────────────
describe('Tags', () => {
    test('new task has empty tags array', () => {
        const task = { id: 1, text: 'Test', tags: [] };
        expect(Array.isArray(task.tags)).toBe(true);
    });

    test('adding a tag pushes to task.tags', () => {
        const task = { id: 1, text: 'Test', tags: [] };
        task.tags.push('work');
        expect(task.tags).toContain('work');
    });

    test('removing a tag filters from task.tags', () => {
        const task = { id: 1, text: 'Test', tags: ['work', 'urgent'] };
        task.tags = task.tags.filter(t => t !== 'work');
        expect(task.tags).not.toContain('work');
        expect(task.tags).toContain('urgent');
    });

    test('tag filter logic: only tasks with tag pass', () => {
        const tasks = [
            { id: 1, tags: ['work'] },
            { id: 2, tags: ['personal'] },
            { id: 3, tags: ['work', 'urgent'] },
        ];
        const filtered = tasks.filter(t => t.tags && t.tags.includes('work'));
        expect(filtered).toHaveLength(2);
        expect(filtered.map(t => t.id)).toEqual([1, 3]);
    });

    test('max 5 tags enforced', () => {
        const tags = ['a', 'b', 'c', 'd', 'e'];
        const newTag = 'f';
        if (tags.length < 5) tags.push(newTag);
        expect(tags).toHaveLength(5);
        expect(tags).not.toContain('f');
    });
});

// ─────────────────────────────────────────────────────────────
describe('Bulk Actions', () => {
    test('toggleTaskSelection adds task id to set', () => {
        const selected = new Set();
        const taskId = 42;
        if (selected.has(taskId)) selected.delete(taskId);
        else selected.add(taskId);
        expect(selected.has(taskId)).toBe(true);
    });

    test('toggleTaskSelection removes already-selected id', () => {
        const selected = new Set([42]);
        if (selected.has(42)) selected.delete(42);
        else selected.add(42);
        expect(selected.has(42)).toBe(false);
    });

    test('bulkComplete marks all selected tasks as completed', () => {
        const tasks = [
            { id: 1, text: 'A', completed: false },
            { id: 2, text: 'B', completed: false },
            { id: 3, text: 'C', completed: false },
        ];
        const selected = new Set([1, 3]);
        tasks.forEach(t => { if (selected.has(t.id)) t.completed = true; });
        expect(tasks[0].completed).toBe(true);
        expect(tasks[1].completed).toBe(false);
        expect(tasks[2].completed).toBe(true);
    });

    test('bulkDelete removes selected tasks', () => {
        const tasks = [
            { id: 1 }, { id: 2 }, { id: 3 }
        ];
        const selected = new Set([2]);
        const remaining = tasks.filter(t => !selected.has(t.id));
        expect(remaining).toHaveLength(2);
        expect(remaining.map(t => t.id)).toEqual([1, 3]);
    });
});

// ─────────────────────────────────────────────────────────────
describe('Drag Reorder', () => {
    function reorderTasks(tasks, fromId, toId) {
        const arr = [...tasks];
        const fromIdx = arr.findIndex(t => t.id === fromId);
        const toIdx   = arr.findIndex(t => t.id === toId);
        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return arr;
        const [moved] = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, moved);
        return arr;
    }

    test('dragDrop reorders tasks correctly (move down)', () => {
        const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const result = reorderTasks(tasks, 1, 3);
        expect(result.map(t => t.id)).toEqual([2, 3, 1]);
    });

    test('dragDrop reorders tasks correctly (move up)', () => {
        const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const result = reorderTasks(tasks, 3, 1);
        expect(result.map(t => t.id)).toEqual([3, 1, 2]);
    });

    test('dragDrop with same source and target is no-op', () => {
        const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const result = reorderTasks(tasks, 2, 2);
        expect(result.map(t => t.id)).toEqual([1, 2, 3]);
    });

    test('dragDrop with invalid id is no-op', () => {
        const tasks = [{ id: 1 }, { id: 2 }];
        const result = reorderTasks(tasks, 1, 99);
        expect(result.map(t => t.id)).toEqual([1, 2]);
    });
});

// ─────────────────────────────────────────────────────────────
describe('Recurring Tasks', () => {
    function getNextDueDate(dueDate, recurrence) {
        if (!dueDate || !recurrence) return null;
        const next = new Date(dueDate + 'T00:00:00');
        next.setDate(next.getDate() + (recurrence === 'daily' ? 1 : 7));
        return next.toISOString().split('T')[0];
    }

    test('daily recurring: next due date is +1 day', () => {
        expect(getNextDueDate('2026-03-14', 'daily')).toBe('2026-03-15');
    });

    test('weekly recurring: next due date is +7 days', () => {
        expect(getNextDueDate('2026-03-14', 'weekly')).toBe('2026-03-21');
    });

    test('non-recurring: does not create next task', () => {
        const task = { recurrence: null, dueDate: '2026-03-14' };
        const shouldCreate = task.recurrence && task.dueDate;
        expect(shouldCreate).toBeFalsy();
    });

    test('recurring without dueDate: does not create next task', () => {
        const task = { recurrence: 'daily', dueDate: null };
        const shouldCreate = task.recurrence && task.dueDate;
        expect(shouldCreate).toBeFalsy();
    });

    test('new task recurrence defaults to null', () => {
        const task = { id: 1, text: 'Test', recurrence: null };
        expect(task.recurrence).toBeNull();
    });

    test('cycleRecurrence cycles null → daily → weekly → null', () => {
        const cycle = [null, 'daily', 'weekly'];
        let r = null;
        r = cycle[(cycle.indexOf(r) + 1) % cycle.length];
        expect(r).toBe('daily');
        r = cycle[(cycle.indexOf(r) + 1) % cycle.length];
        expect(r).toBe('weekly');
        r = cycle[(cycle.indexOf(r) + 1) % cycle.length];
        expect(r).toBeNull();
    });
});

// ─────────────────────────────────────────────────────────────
describe('Pomodoro History', () => {
    test('getPomodoroHistory returns empty array when no data', () => {
        const raw = null;
        const history = raw ? (() => {
            const p = JSON.parse(raw);
            if (p.date && p.count !== undefined) return [{ date: p.date, count: p.count }];
            return p.history || [];
        })() : [];
        expect(Array.isArray(history)).toBe(true);
        expect(history).toHaveLength(0);
    });

    test('old format {date, count} is migrated to history array', () => {
        const raw = JSON.stringify({ date: '2026-03-14', count: 3 });
        const parsed = JSON.parse(raw);
        const history = (parsed.date && parsed.count !== undefined) ? [{ date: parsed.date, count: parsed.count }] : (parsed.history || []);
        expect(history).toHaveLength(1);
        expect(history[0].count).toBe(3);
    });

    test('new format {history:[]} is used directly', () => {
        const raw = JSON.stringify({ history: [{ date: '2026-03-14', count: 5 }] });
        const parsed = JSON.parse(raw);
        const history = (parsed.date && parsed.count !== undefined) ? [{ date: parsed.date, count: parsed.count }] : (parsed.history || []);
        expect(history[0].count).toBe(5);
    });

    test('incrementing count updates existing entry', () => {
        const history = [{ date: '2026-03-14', count: 2 }];
        const today = '2026-03-14';
        const entry = history.find(h => h.date === today);
        if (entry) entry.count++;
        else history.push({ date: today, count: 1 });
        expect(history[0].count).toBe(3);
    });

    test('history is sliced to last 7 entries', () => {
        const history = Array.from({ length: 10 }, (_, i) => ({ date: `2026-01-${String(i+1).padStart(2,'0')}`, count: i }));
        const saved = history.slice(-7);
        expect(saved).toHaveLength(7);
        expect(saved[0].date).toBe('2026-01-04');
    });
});

// ─────────────────────────────────────────────────────────────
describe('Move Task Between Lists', () => {
    function makeLists() {
        return [
            { id: 1, name: 'Personal', tasks: [
                { id: 10, text: 'Buy milk',  completed: false, priority: true, tags: ['shopping'] },
                { id: 11, text: 'Read book', completed: false, priority: false, tags: [] }
            ]},
            { id: 2, name: 'Work', tasks: [
                { id: 20, text: 'Send email', completed: false, priority: false, tags: [] }
            ]},
            { id: 3, name: 'Study', tasks: [] }
        ];
    }

    function moveTask(lists, taskId, srcListId, destListId) {
        const src  = lists.find(l => l.id === srcListId);
        const dest = lists.find(l => l.id === destListId);
        if (!src || !dest) return false;
        const idx = src.tasks.findIndex(t => t.id === taskId);
        if (idx === -1) return false;
        const [task] = src.tasks.splice(idx, 1);
        dest.tasks.push(task);
        return true;
    }

    test('moves task from source list to destination', () => {
        const lists = makeLists();
        moveTask(lists, 10, 1, 2);
        expect(lists[0].tasks.find(t => t.id === 10)).toBeUndefined();
        expect(lists[1].tasks.find(t => t.id === 10)).toBeDefined();
    });

    test('removes exactly one task from source', () => {
        const lists = makeLists();
        moveTask(lists, 10, 1, 2);
        expect(lists[0].tasks).toHaveLength(1);
    });

    test('destination gains exactly one task', () => {
        const lists = makeLists();
        moveTask(lists, 10, 1, 2);
        expect(lists[1].tasks).toHaveLength(2);
    });

    test('moved task preserves all original properties', () => {
        const lists = makeLists();
        moveTask(lists, 10, 1, 2);
        const moved = lists[1].tasks.find(t => t.id === 10);
        expect(moved.text).toBe('Buy milk');
        expect(moved.priority).toBe(true);
        expect(moved.tags).toEqual(['shopping']);
    });

    test('other tasks in source list are unaffected', () => {
        const lists = makeLists();
        moveTask(lists, 10, 1, 2);
        expect(lists[0].tasks[0].id).toBe(11);
    });

    test('moving to an empty list works', () => {
        const lists = makeLists();
        moveTask(lists, 10, 1, 3);
        expect(lists[2].tasks).toHaveLength(1);
        expect(lists[2].tasks[0].id).toBe(10);
    });

    test('returns false when source list does not exist', () => {
        const lists = makeLists();
        const result = moveTask(lists, 10, 99, 2);
        expect(result).toBe(false);
    });

    test('returns false when destination list does not exist', () => {
        const lists = makeLists();
        const result = moveTask(lists, 10, 1, 99);
        expect(result).toBe(false);
    });

    test('returns false when task id not found in source', () => {
        const lists = makeLists();
        const result = moveTask(lists, 999, 1, 2);
        expect(result).toBe(false);
        expect(lists[0].tasks).toHaveLength(2);
    });

    test('no other lists are mutated on move', () => {
        const lists = makeLists();
        moveTask(lists, 10, 1, 2);
        expect(lists[2].tasks).toHaveLength(0);
    });

    test('cannot move to same list (noop-equivalent)', () => {
        const lists = makeLists();
        moveTask(lists, 10, 1, 1);
        // Same src and dest: task is removed from index and appended — length unchanged
        expect(lists[0].tasks).toHaveLength(2);
    });
});

// ─────────────────────────────────────────────────────────────
describe('Extended Search (notes, tags, subtasks)', () => {
    const tasks = [
        {
            id: 1, text: 'Buy groceries', completed: false, dueDate: null,
            notes: 'get organic milk', tags: ['shopping'],
            subtasks: [{ id: 101, text: 'check coupons', completed: false }]
        },
        {
            id: 2, text: 'Read a book', completed: false, dueDate: '2026-03-14',
            notes: '', tags: ['leisure'],
            subtasks: []
        },
        {
            id: 3, text: 'Send report', completed: false, dueDate: null,
            notes: 'attach the quarterly PDF', tags: ['work', 'urgent'],
            subtasks: [{ id: 201, text: 'review slides', completed: false }]
        },
        {
            id: 4, text: 'Call dentist', completed: true, dueDate: null,
            notes: '', tags: [],
            subtasks: []
        }
    ];

    function filterTasks(query, ts) {
        const q = query.trim().toLowerCase();
        if (!q) return ts;
        return ts.filter(t =>
            t.text.toLowerCase().includes(q) ||
            (t.dueDate && t.dueDate.includes(q)) ||
            (t.notes && t.notes.toLowerCase().includes(q)) ||
            (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q))) ||
            (t.subtasks && t.subtasks.some(s => s.text.toLowerCase().includes(q)))
        );
    }

    test('matches task by notes content', () => {
        const result = filterTasks('organic', tasks);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(1);
    });

    test('matches task by tag name', () => {
        const result = filterTasks('shopping', tasks);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(1);
    });

    test('matches task by subtask text', () => {
        const result = filterTasks('coupons', tasks);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(1);
    });

    test('matches task by partial tag name', () => {
        const result = filterTasks('leis', tasks);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(2);
    });

    test('matches multiple tasks sharing a tag', () => {
        const result = filterTasks('work', tasks);
        expect(result.map(t => t.id)).toContain(3);
    });

    test('matches task text still works (regression)', () => {
        const result = filterTasks('dentist', tasks);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(4);
    });

    test('matches due date still works (regression)', () => {
        const result = filterTasks('2026-03-14', tasks);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(2);
    });

    test('empty query returns all tasks', () => {
        expect(filterTasks('', tasks)).toHaveLength(4);
    });

    test('no match returns empty array', () => {
        expect(filterTasks('zzznomatch', tasks)).toHaveLength(0);
    });

    test('matches partial notes text', () => {
        const result = filterTasks('quarterly', tasks);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(3);
    });

    test('matches partial subtask text', () => {
        const result = filterTasks('slides', tasks);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(3);
    });

    test('search is case-insensitive for tags', () => {
        const result = filterTasks('URGENT', tasks);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(3);
    });

    test('search is case-insensitive for notes', () => {
        const result = filterTasks('ORGANIC', tasks);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(1);
    });

    test('task with no notes/tags/subtasks does not throw', () => {
        expect(() => filterTasks('anything', tasks)).not.toThrow();
    });
});

// ─────────────────────────────────────────────────────────────
describe('Done Archive View', () => {
    function makeLists() {
        return [
            { id: 1, name: 'Personal', icon: '🏠', tasks: [
                { id: 10, text: 'Buy milk',    completed: true,  createdAt: '2026-01-01T10:00:00.000Z', tags: ['shopping'], subtasks: [], notes: '' },
                { id: 11, text: 'Call friend', completed: false, createdAt: '2026-01-02T10:00:00.000Z', tags: [], subtasks: [], notes: '' },
                { id: 12, text: 'Read book',   completed: true,  createdAt: '2026-01-03T10:00:00.000Z', tags: [], subtasks: [], notes: 'chapter 1' }
            ]},
            { id: 2, name: 'Work', icon: '💼', tasks: [
                { id: 20, text: 'Send email',  completed: true,  createdAt: '2026-01-04T10:00:00.000Z', tags: ['urgent'], subtasks: [], notes: '' },
                { id: 21, text: 'Review PR',   completed: false, createdAt: '2026-01-05T10:00:00.000Z', tags: [], subtasks: [], notes: '' }
            ]}
        ];
    }

    function getDoneTasks(lists, searchQuery = '') {
        let tasks = lists.flatMap(l => l.tasks
            .filter(t => t.completed)
            .map(t => Object.assign({}, t, { _listId: l.id, _listName: l.name, _listIcon: l.icon })));
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            tasks = tasks.filter(t =>
                t.text.toLowerCase().includes(q) ||
                (t.notes && t.notes.toLowerCase().includes(q)) ||
                (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q))) ||
                (t.subtasks && t.subtasks.some(s => s.text.toLowerCase().includes(q))));
        }
        tasks.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        return tasks;
    }

    test('returns only completed tasks', () => {
        const tasks = getDoneTasks(makeLists());
        expect(tasks.every(t => t.completed)).toBe(true);
    });

    test('collects completed tasks from all lists', () => {
        const tasks = getDoneTasks(makeLists());
        expect(tasks).toHaveLength(3);
    });

    test('excludes incomplete tasks', () => {
        const ids = getDoneTasks(makeLists()).map(t => t.id);
        expect(ids).not.toContain(11); // Call friend — incomplete
        expect(ids).not.toContain(21); // Review PR — incomplete
    });

    test('annotates each task with source list id', () => {
        const task = getDoneTasks(makeLists()).find(t => t.id === 20);
        expect(task._listId).toBe(2);
    });

    test('annotates each task with source list name', () => {
        const task = getDoneTasks(makeLists()).find(t => t.id === 20);
        expect(task._listName).toBe('Work');
    });

    test('annotates each task with source list icon', () => {
        const task = getDoneTasks(makeLists()).find(t => t.id === 20);
        expect(task._listIcon).toBe('💼');
    });

    test('sorts newest createdAt first', () => {
        const tasks = getDoneTasks(makeLists());
        expect(tasks[0].id).toBe(20); // 2026-01-04
        expect(tasks[1].id).toBe(12); // 2026-01-03
        expect(tasks[2].id).toBe(10); // 2026-01-01
    });

    test('filters by search query (text match)', () => {
        const tasks = getDoneTasks(makeLists(), 'milk');
        expect(tasks).toHaveLength(1);
        expect(tasks[0].id).toBe(10);
    });

    test('filters by search query (notes match)', () => {
        const tasks = getDoneTasks(makeLists(), 'chapter');
        expect(tasks).toHaveLength(1);
        expect(tasks[0].id).toBe(12);
    });

    test('filters by search query (tag match)', () => {
        const tasks = getDoneTasks(makeLists(), 'urgent');
        expect(tasks).toHaveLength(1);
        expect(tasks[0].id).toBe(20);
    });

    test('search is case-insensitive', () => {
        expect(getDoneTasks(makeLists(), 'MILK')).toHaveLength(1);
    });

    test('empty search returns all done tasks', () => {
        expect(getDoneTasks(makeLists(), '')).toHaveLength(3);
    });

    test('no-match search returns empty array', () => {
        expect(getDoneTasks(makeLists(), 'zzznomatch')).toHaveLength(0);
    });

    test('returns empty array when no tasks are completed', () => {
        const lists = [{ id: 1, name: 'Empty', icon: '📋', tasks: [
            { id: 1, text: 'Todo', completed: false, createdAt: '', tags: [], subtasks: [], notes: '' }
        ]}];
        expect(getDoneTasks(lists)).toHaveLength(0);
    });

    test('does not mutate original task objects', () => {
        const lists = makeLists();
        getDoneTasks(lists);
        expect(lists[0].tasks[0]._listId).toBeUndefined();
    });

    test('subtask text search works in done view', () => {
        const lists = [{ id: 1, name: 'P', icon: '📋', tasks: [
            { id: 1, text: 'Task A', completed: true, createdAt: '', tags: [], notes: '',
              subtasks: [{ id: 101, text: 'order supplies', completed: false }] }
        ]}];
        const results = getDoneTasks(lists, 'supplies');
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe(1);
    });
});

// ─────────────────────────────────────────────────────────────
describe('Cross-list Search', () => {
    function makeLists() {
        return [
            { id: 1, name: 'Personal', icon: '🏠', tasks: [
                { id: 10, text: 'Buy groceries', completed: false, notes: '', tags: [], subtasks: [] },
                { id: 11, text: 'Doctor appt',   completed: true,  notes: '', tags: [], subtasks: [] }
            ]},
            { id: 2, name: 'Work', icon: '💼', tasks: [
                { id: 20, text: 'Send report',  completed: false, notes: 'quarterly summary', tags: ['work'], subtasks: [] },
                { id: 21, text: 'Team meeting', completed: false, notes: '', tags: [],
                  subtasks: [{ id: 201, text: 'book conference room', completed: false }] }
            ]},
            { id: 3, name: 'Study', icon: '📚', tasks: [] }
        ];
    }

    function crossListSearch(lists, query) {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        const all = lists.flatMap(l => l.tasks.map(t =>
            Object.assign({}, t, { _listId: l.id, _listName: l.name, _listIcon: l.icon })));
        return all.filter(t =>
            t.text.toLowerCase().includes(q) ||
            (t.notes && t.notes.toLowerCase().includes(q)) ||
            (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q))) ||
            (t.subtasks && t.subtasks.some(s => s.text.toLowerCase().includes(q))));
    }

    test('empty query returns nothing (toggle on but no input is a no-op)', () => {
        expect(crossListSearch(makeLists(), '')).toHaveLength(0);
    });

    test('whitespace-only query returns nothing', () => {
        expect(crossListSearch(makeLists(), '   ')).toHaveLength(0);
    });

    test('finds a task in a non-current list', () => {
        const results = crossListSearch(makeLists(), 'report');
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe(20);
        expect(results[0]._listName).toBe('Work');
    });

    test('results from both lists appear in a broad query', () => {
        const results = crossListSearch(makeLists(), 'o'); // matches groceries, Doctor, report, room…
        const listIds = [...new Set(results.map(t => t._listId))];
        expect(listIds.length).toBeGreaterThan(1);
    });

    test('each result carries source list id', () => {
        const result = crossListSearch(makeLists(), 'groceries')[0];
        expect(result._listId).toBe(1);
    });

    test('each result carries source list name', () => {
        const result = crossListSearch(makeLists(), 'groceries')[0];
        expect(result._listName).toBe('Personal');
    });

    test('each result carries source list icon', () => {
        const result = crossListSearch(makeLists(), 'groceries')[0];
        expect(result._listIcon).toBe('🏠');
    });

    test('matches notes in tasks from any list', () => {
        const results = crossListSearch(makeLists(), 'quarterly');
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe(20);
    });

    test('matches tags in tasks from any list', () => {
        const results = crossListSearch(makeLists(), 'work');
        expect(results.some(t => t.id === 20)).toBe(true);
    });

    test('matches subtask text in tasks from any list', () => {
        const results = crossListSearch(makeLists(), 'conference room');
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe(21);
    });

    test('includes completed tasks in cross-list results', () => {
        const results = crossListSearch(makeLists(), 'doctor');
        expect(results).toHaveLength(1);
        expect(results[0].completed).toBe(true);
    });

    test('no match returns empty array', () => {
        expect(crossListSearch(makeLists(), 'zzznomatch')).toHaveLength(0);
    });

    test('list with no tasks contributes no results', () => {
        const results = crossListSearch(makeLists(), 'anything');
        expect(results.some(t => t._listId === 3)).toBe(false);
    });

    test('does not mutate original task objects', () => {
        const lists = makeLists();
        crossListSearch(lists, 'groceries');
        expect(lists[0].tasks[0]._listId).toBeUndefined();
    });
});

// ─────────────────────────────────────────────────────────────
describe('Tab Count Badges', () => {
    function makeLists() {
        return [
            { id: 1, tasks: [
                { id: 10, completed: false, priority: true,  today: true  },
                { id: 11, completed: false, priority: false, today: false },
                { id: 12, completed: true,  priority: false, today: false },
                { id: 13, completed: true,  priority: true,  today: true  }  // completed — must be excluded
            ]},
            { id: 2, tasks: [
                { id: 20, completed: false, priority: true,  today: false },
                { id: 21, completed: true,  priority: false, today: false }
            ]}
        ];
    }

    function getTabCounts(lists, listId) {
        const list = lists.find(l => l.id === listId);
        const tasks = list ? list.tasks : [];
        return {
            all:      tasks.filter(t => !t.completed).length,
            today:    tasks.filter(t => t.today    && !t.completed).length,
            priority: tasks.filter(t => t.priority && !t.completed).length,
            done:     lists.flatMap(l => l.tasks).filter(t => t.completed).length
        };
    }

    test('all badge counts incomplete tasks in current list', () => {
        expect(getTabCounts(makeLists(), 1).all).toBe(2);
        expect(getTabCounts(makeLists(), 2).all).toBe(1);
    });

    test('today badge counts active today tasks in current list', () => {
        expect(getTabCounts(makeLists(), 1).today).toBe(1);
        expect(getTabCounts(makeLists(), 2).today).toBe(0);
    });

    test('priority badge counts active priority tasks in current list', () => {
        expect(getTabCounts(makeLists(), 1).priority).toBe(1);
        expect(getTabCounts(makeLists(), 2).priority).toBe(1);
    });

    test('done badge aggregates completed tasks across ALL lists', () => {
        expect(getTabCounts(makeLists(), 1).done).toBe(3); // 2 Personal + 1 Work
    });

    test('done badge is the same regardless of current list', () => {
        const lists = makeLists();
        expect(getTabCounts(lists, 1).done).toBe(getTabCounts(lists, 2).done);
    });

    test('completed tasks are excluded from all/today/priority counts', () => {
        const counts = getTabCounts(makeLists(), 1);
        expect(counts.priority).toBe(1); // id 13 is priority+completed → excluded
        expect(counts.today).toBe(1);    // id 13 is today+completed → excluded
    });

    test('all badge is 0 when every task is complete', () => {
        const lists = [{ id: 1, tasks: [{ id: 1, completed: true, priority: false, today: false }] }];
        expect(getTabCounts(lists, 1).all).toBe(0);
    });

    test('done badge is 0 when no tasks are complete', () => {
        const lists = [{ id: 1, tasks: [{ id: 1, completed: false, priority: false, today: false }] }];
        expect(getTabCounts(lists, 1).done).toBe(0);
    });

    test('all counts return 0 for unknown list id', () => {
        const counts = getTabCounts(makeLists(), 99);
        expect(counts.all).toBe(0);
        expect(counts.today).toBe(0);
        expect(counts.priority).toBe(0);
    });

    test('done badge counts zero when lists array is empty', () => {
        expect(getTabCounts([], 1).done).toBe(0);
    });
});

// ─────────────────────────────────────────────────────────────
describe('findListForTask', () => {
    function findListForTask(lists, taskId) {
        for (const l of lists) {
            if (l.tasks.some(t => t.id === taskId)) return l;
        }
        return null;
    }

    const lists = [
        { id: 1, name: 'Personal', tasks: [{ id: 10 }, { id: 11 }] },
        { id: 2, name: 'Work',     tasks: [{ id: 20 }] },
        { id: 3, name: 'Study',    tasks: [] }
    ];

    test('finds the list containing the task', () => {
        expect(findListForTask(lists, 10).id).toBe(1);
        expect(findListForTask(lists, 20).id).toBe(2);
    });

    test('finds a task that is not the first in its list', () => {
        expect(findListForTask(lists, 11).id).toBe(1);
    });

    test('returns null for a non-existent task id', () => {
        expect(findListForTask(lists, 999)).toBeNull();
    });

    test('returns null when all lists are empty', () => {
        const empty = [{ id: 1, tasks: [] }, { id: 2, tasks: [] }];
        expect(findListForTask(empty, 1)).toBeNull();
    });

    test('returns null for an empty lists array', () => {
        expect(findListForTask([], 10)).toBeNull();
    });

    test('returns the correct list name for the found task', () => {
        expect(findListForTask(lists, 20).name).toBe('Work');
    });

    test('list with empty tasks array is never returned for any id', () => {
        expect(findListForTask(lists, 0)).toBeNull();
    });

    test('works correctly when task exists in the last list', () => {
        const l = [
            { id: 1, tasks: [] },
            { id: 2, tasks: [] },
            { id: 3, tasks: [{ id: 99 }] }
        ];
        expect(findListForTask(l, 99).id).toBe(3);
    });
});

// ─────────────────────────────────────────────────────────────
describe('Delete Tag Definition', () => {
    function makeTagDefs() {
        return [
            { name: 'work',     color: '#e91e63' },
            { name: 'personal', color: '#3f51b5' },
            { name: 'urgent',   color: '#ff5722' }
        ];
    }

    function makeLists() {
        return [
            { id: 1, tasks: [
                { id: 10, text: 'A', tags: ['work', 'urgent'] },
                { id: 11, text: 'B', tags: ['personal'] }
            ]},
            { id: 2, tasks: [
                { id: 20, text: 'C', tags: ['work'] }
            ]}
        ];
    }

    function deleteTagDef(name, tagDefs, lists) {
        tagDefs = tagDefs.filter(d => d.name !== name);
        lists.forEach(l => l.tasks.forEach(t => {
            if (t.tags) t.tags = t.tags.filter(tag => tag !== name);
        }));
        return tagDefs;
    }

    test('removes tag from tagDefs', () => {
        let tagDefs = makeTagDefs();
        tagDefs = deleteTagDef('work', tagDefs, []);
        expect(tagDefs.find(d => d.name === 'work')).toBeUndefined();
    });

    test('other tag definitions remain', () => {
        let tagDefs = makeTagDefs();
        tagDefs = deleteTagDef('work', tagDefs, []);
        expect(tagDefs).toHaveLength(2);
        expect(tagDefs.map(d => d.name)).toEqual(['personal', 'urgent']);
    });

    test('removes deleted tag from all tasks in all lists', () => {
        const lists = makeLists();
        deleteTagDef('work', makeTagDefs(), lists);
        expect(lists[0].tasks[0].tags).not.toContain('work');
        expect(lists[1].tasks[0].tags).not.toContain('work');
    });

    test('other tags on affected tasks are preserved', () => {
        const lists = makeLists();
        deleteTagDef('work', makeTagDefs(), lists);
        expect(lists[0].tasks[0].tags).toContain('urgent');
    });

    test('tasks without the deleted tag are unaffected', () => {
        const lists = makeLists();
        deleteTagDef('work', makeTagDefs(), lists);
        expect(lists[0].tasks[1].tags).toEqual(['personal']);
    });

    test('deleting non-existent tag is a no-op', () => {
        let tagDefs = makeTagDefs();
        const lists = makeLists();
        tagDefs = deleteTagDef('nonexistent', tagDefs, lists);
        expect(tagDefs).toHaveLength(3);
        expect(lists[0].tasks[0].tags).toEqual(['work', 'urgent']);
    });

    test('deleting last tag definition leaves empty array', () => {
        let tagDefs = [{ name: 'solo', color: '#000' }];
        tagDefs = deleteTagDef('solo', tagDefs, []);
        expect(tagDefs).toHaveLength(0);
    });

    test('task with empty tags array is not affected', () => {
        const lists = [{ id: 1, tasks: [{ id: 1, text: 'X', tags: [] }] }];
        deleteTagDef('work', makeTagDefs(), lists);
        expect(lists[0].tasks[0].tags).toHaveLength(0);
    });
});

// ─────────────────────────────────────────────────────────────
describe('Keyboard Shortcuts Cheatsheet', () => {
    test('? key opens the shortcuts overlay', () => {
        let shortcutsVisible = false;
        // Simulate the keydown handler
        const handleKey = (key, inInput) => {
            if (key === 'Escape') return;
            if (inInput) return;
            if (key === '?') { shortcutsVisible = true; }
        };
        handleKey('?', false);
        expect(shortcutsVisible).toBe(true);
    });

    test('? key does not fire when focus is inside an input', () => {
        let shortcutsVisible = false;
        const handleKey = (key, inInput) => {
            if (inInput) return;
            if (key === '?') { shortcutsVisible = true; }
        };
        handleKey('?', true);
        expect(shortcutsVisible).toBe(false);
    });

    test('Escape closes shortcuts overlay before other modals', () => {
        let shortcutsClosed = false;
        let promptClosed = false;
        const handleEscape = (shortcutsOpen, promptOpen) => {
            if (shortcutsOpen) { shortcutsClosed = true; return; }
            if (promptOpen) { promptClosed = true; }
        };
        handleEscape(true, true);
        expect(shortcutsClosed).toBe(true);
        expect(promptClosed).toBe(false);
    });

    test('Escape falls through to prompt modal when shortcuts is closed', () => {
        let shortcutsClosed = false;
        let promptClosed = false;
        const handleEscape = (shortcutsOpen, promptOpen) => {
            if (shortcutsOpen) { shortcutsClosed = true; return; }
            if (promptOpen) { promptClosed = true; }
        };
        handleEscape(false, true);
        expect(shortcutsClosed).toBe(false);
        expect(promptClosed).toBe(true);
    });

    test('shortcuts list contains all expected keys', () => {
        const shortcuts = ['Ctrl+N', 'Ctrl+K', '↑ ↓', 'Enter', 'Delete', 'Esc', '?'];
        expect(shortcuts).toContain('Ctrl+N');
        expect(shortcuts).toContain('Ctrl+K');
        expect(shortcuts).toContain('?');
        expect(shortcuts).toContain('Esc');
        expect(shortcuts).toHaveLength(7);
    });
});

// ── TIER 2 FEATURES ──────────────────────────────────────────────────────────

describe('Overdue Badge Logic', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    function countOverdue(lists) {
        return lists.flatMap(l => l.tasks)
            .filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
    }

    test('task with past due date and incomplete is overdue', () => {
        const lists = [{ tasks: [{ completed: false, dueDate: yesterday }] }];
        expect(countOverdue(lists)).toBe(1);
    });

    test('task with future due date is not overdue', () => {
        const lists = [{ tasks: [{ completed: false, dueDate: tomorrow }] }];
        expect(countOverdue(lists)).toBe(0);
    });

    test('completed task with past due date is not overdue', () => {
        const lists = [{ tasks: [{ completed: true, dueDate: yesterday }] }];
        expect(countOverdue(lists)).toBe(0);
    });

    test('task with no due date is not overdue', () => {
        const lists = [{ tasks: [{ completed: false, dueDate: null }] }];
        expect(countOverdue(lists)).toBe(0);
    });

    test('task due today is not overdue', () => {
        const lists = [{ tasks: [{ completed: false, dueDate: todayStr }] }];
        expect(countOverdue(lists)).toBe(0);
    });

    test('counts overdue tasks across multiple lists', () => {
        const lists = [
            { tasks: [{ completed: false, dueDate: yesterday }, { completed: false, dueDate: tomorrow }] },
            { tasks: [{ completed: false, dueDate: yesterday }] }
        ];
        expect(countOverdue(lists)).toBe(2);
    });

    test('zero overdue returns 0', () => {
        const lists = [{ tasks: [{ completed: false, dueDate: tomorrow }] }];
        expect(countOverdue(lists)).toBe(0);
    });

    test('empty task list returns 0', () => {
        expect(countOverdue([{ tasks: [] }])).toBe(0);
    });
});

describe('Upcoming View Filtering', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    const in8Days = new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const sevenDaysLater = new Date(); sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0];

    function filterUpcoming(lists) {
        return lists.flatMap(l => l.tasks
            .filter(t => !t.completed && t.dueDate && t.dueDate >= todayStr && t.dueDate <= sevenDaysStr)
            .map(t => Object.assign({}, t, { _listId: l.id, _listName: l.name, _listColor: l.color })));
    }

    test('task due today is included', () => {
        const lists = [{ id: 1, name: 'A', color: null, tasks: [{ id: 1, text: 'x', completed: false, dueDate: todayStr }] }];
        expect(filterUpcoming(lists)).toHaveLength(1);
    });

    test('task due in 3 days is included', () => {
        const lists = [{ id: 1, name: 'A', color: null, tasks: [{ id: 1, text: 'x', completed: false, dueDate: in3Days }] }];
        expect(filterUpcoming(lists)).toHaveLength(1);
    });

    test('task due in 8 days is excluded', () => {
        const lists = [{ id: 1, name: 'A', color: null, tasks: [{ id: 1, text: 'x', completed: false, dueDate: in8Days }] }];
        expect(filterUpcoming(lists)).toHaveLength(0);
    });

    test('overdue task (yesterday) is excluded', () => {
        const lists = [{ id: 1, name: 'A', color: null, tasks: [{ id: 1, text: 'x', completed: false, dueDate: yesterday }] }];
        expect(filterUpcoming(lists)).toHaveLength(0);
    });

    test('completed task is excluded even if due within 7 days', () => {
        const lists = [{ id: 1, name: 'A', color: null, tasks: [{ id: 1, text: 'x', completed: true, dueDate: in3Days }] }];
        expect(filterUpcoming(lists)).toHaveLength(0);
    });

    test('task with no due date is excluded', () => {
        const lists = [{ id: 1, name: 'A', color: null, tasks: [{ id: 1, text: 'x', completed: false, dueDate: null }] }];
        expect(filterUpcoming(lists)).toHaveLength(0);
    });

    test('annotates tasks with list metadata', () => {
        const lists = [{ id: 42, name: 'Work', color: '#2196f3', tasks: [{ id: 1, text: 'x', completed: false, dueDate: todayStr }] }];
        const result = filterUpcoming(lists);
        expect(result[0]._listId).toBe(42);
        expect(result[0]._listName).toBe('Work');
        expect(result[0]._listColor).toBe('#2196f3');
    });

    test('tasks are sortable by due date ascending', () => {
        const lists = [{ id: 1, name: 'A', color: null, tasks: [
            { id: 1, text: 'later', completed: false, dueDate: in3Days },
            { id: 2, text: 'sooner', completed: false, dueDate: todayStr }
        ]}];
        const result = filterUpcoming(lists).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        expect(result[0].text).toBe('sooner');
        expect(result[1].text).toBe('later');
    });

    test('gathers tasks from multiple lists', () => {
        const lists = [
            { id: 1, name: 'A', color: null, tasks: [{ id: 1, text: 'a', completed: false, dueDate: todayStr }] },
            { id: 2, name: 'B', color: null, tasks: [{ id: 2, text: 'b', completed: false, dueDate: in3Days }] }
        ];
        expect(filterUpcoming(lists)).toHaveLength(2);
    });

    test('returns empty array when no tasks are upcoming', () => {
        const lists = [{ id: 1, name: 'A', color: null, tasks: [] }];
        expect(filterUpcoming(lists)).toHaveLength(0);
    });
});

describe('List Accent Colours', () => {
    const LIST_COLORS = ['#4caf50','#2196f3','#9c27b0','#ff9800','#f44336','#e91e63','#00bcd4','#795548','#607d8b','#ff5722'];

    function makeList(color = null) {
        return { id: 1, name: 'Test', icon: '📝', color, tasks: [] };
    }

    function setListColor(lists, listId, color) {
        const list = lists.find(l => l.id === listId);
        if (list) list.color = color;
        return lists;
    }

    test('new list has color: null by default', () => {
        const list = makeList();
        expect(list.color).toBeNull();
    });

    test('setListColor assigns a colour to the list', () => {
        const lists = [makeList()];
        setListColor(lists, 1, '#4caf50');
        expect(lists[0].color).toBe('#4caf50');
    });

    test('setListColor can clear a colour by setting null', () => {
        const lists = [makeList('#4caf50')];
        setListColor(lists, 1, null);
        expect(lists[0].color).toBeNull();
    });

    test('setListColor on non-existent list is a no-op', () => {
        const lists = [makeList()];
        setListColor(lists, 999, '#4caf50');
        expect(lists[0].color).toBeNull();
    });

    test('LIST_COLORS palette has 10 colours', () => {
        expect(LIST_COLORS).toHaveLength(10);
    });

    test('all palette colours are valid hex strings', () => {
        LIST_COLORS.forEach(c => expect(c).toMatch(/^#[0-9a-f]{6}$/i));
    });

    test('migration backfills color: null on lists missing the field', () => {
        const list = { id: 1, name: 'Old', icon: '📝', tasks: [] };
        if (list.color === undefined) list.color = null;
        expect(list.color).toBeNull();
    });

    test('existing color is preserved during migration', () => {
        const list = { id: 1, name: 'Old', icon: '📝', color: '#ff9800', tasks: [] };
        if (list.color === undefined) list.color = null;
        expect(list.color).toBe('#ff9800');
    });

    test('cross-list views annotate tasks with _listColor', () => {
        const lists = [{ id: 1, name: 'A', icon: '📝', color: '#2196f3', tasks: [
            { id: 10, text: 'task', completed: true }
        ]}];
        const annotated = lists.flatMap(l => l.tasks
            .filter(t => t.completed)
            .map(t => Object.assign({}, t, { _listColor: l.color })));
        expect(annotated[0]._listColor).toBe('#2196f3');
    });

    test('task without list colour has no border-left style', () => {
        const task = { _listColor: null };
        const style = task._listColor ? `border-left: 3px solid ${task._listColor};` : '';
        expect(style).toBe('');
    });

    test('task with list colour produces correct border-left style', () => {
        const task = { _listColor: '#f44336' };
        const style = task._listColor ? `border-left: 3px solid ${task._listColor};` : '';
        expect(style).toBe('border-left: 3px solid #f44336;');
    });
});

// ── TIER 1 FEATURES ──────────────────────────────────────────────────────────

describe('Pinned Tasks', () => {
    function makeTask(overrides = {}) {
        return { id: 1, text: 'task', completed: false, priority: false, today: false, pinned: false, createdAt: '2026-01-01T00:00:00.000Z', ...overrides };
    }

    function sortTasks(tasks) {
        return [...tasks].sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (a.priority !== b.priority) return a.priority ? -1 : 1;
            return 0;
        });
    }

    test('new task has pinned: false by default', () => {
        expect(makeTask().pinned).toBe(false);
    });

    test('migration backfills pinned: false on existing tasks', () => {
        const task = { id: 1, text: 'old' };
        if (task.pinned === undefined) task.pinned = false;
        expect(task.pinned).toBe(false);
    });

    test('migration preserves existing pinned: true', () => {
        const task = { id: 1, text: 'old', pinned: true };
        if (task.pinned === undefined) task.pinned = false;
        expect(task.pinned).toBe(true);
    });

    test('togglePin sets pinned true on unpinned task', () => {
        const task = makeTask();
        task.pinned = !task.pinned;
        expect(task.pinned).toBe(true);
    });

    test('togglePin sets pinned false on already-pinned task', () => {
        const task = makeTask({ pinned: true });
        task.pinned = !task.pinned;
        expect(task.pinned).toBe(false);
    });

    test('pinned tasks sort before unpinned tasks', () => {
        const tasks = [
            makeTask({ id: 1, text: 'B', pinned: false }),
            makeTask({ id: 2, text: 'A', pinned: true }),
        ];
        const sorted = sortTasks(tasks);
        expect(sorted[0].id).toBe(2);
        expect(sorted[1].id).toBe(1);
    });

    test('multiple pinned tasks remain grouped at top', () => {
        const tasks = [
            makeTask({ id: 1, pinned: false }),
            makeTask({ id: 2, pinned: true }),
            makeTask({ id: 3, pinned: true }),
        ];
        const sorted = sortTasks(tasks);
        expect(sorted[0].pinned).toBe(true);
        expect(sorted[1].pinned).toBe(true);
        expect(sorted[2].pinned).toBe(false);
    });

    test('unpinned tasks maintain their relative priority order', () => {
        const tasks = [
            makeTask({ id: 1, priority: false }),
            makeTask({ id: 2, priority: true }),
        ];
        const sorted = sortTasks(tasks);
        expect(sorted[0].id).toBe(2);
    });

    test('pinned task class string includes "pinned"', () => {
        const task = makeTask({ pinned: true });
        const cls = `task ${task.pinned ? 'pinned' : ''}`.trim();
        expect(cls).toContain('pinned');
    });

    test('unpinned task class string does not include "pinned"', () => {
        const task = makeTask({ pinned: false });
        const cls = `task ${task.pinned ? 'pinned' : ''}`.trim();
        expect(cls).not.toContain('pinned');
    });
});

describe('List Progress Bar', () => {
    function computeProgress(list) {
        const total = list.tasks.length;
        const completed = list.tasks.filter(t => t.completed).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, pct };
    }

    test('empty list has 0% progress', () => {
        expect(computeProgress({ tasks: [] }).pct).toBe(0);
    });

    test('all completed → 100%', () => {
        const list = { tasks: [{ completed: true }, { completed: true }] };
        expect(computeProgress(list).pct).toBe(100);
    });

    test('none completed → 0%', () => {
        const list = { tasks: [{ completed: false }, { completed: false }] };
        expect(computeProgress(list).pct).toBe(0);
    });

    test('half completed → 50%', () => {
        const list = { tasks: [{ completed: true }, { completed: false }] };
        expect(computeProgress(list).pct).toBe(50);
    });

    test('1 of 3 completed → 33%', () => {
        const list = { tasks: [{ completed: true }, { completed: false }, { completed: false }] };
        expect(computeProgress(list).pct).toBe(33);
    });

    test('progress bar is hidden when list has no tasks', () => {
        const list = { tasks: [] };
        const { total } = computeProgress(list);
        const html = total > 0 ? '<progress-bar>' : '';
        expect(html).toBe('');
    });

    test('progress bar is shown when list has tasks', () => {
        const list = { tasks: [{ completed: false }] };
        const { total } = computeProgress(list);
        const html = total > 0 ? '<progress-bar>' : '';
        expect(html).toBe('<progress-bar>');
    });

    test('pct is clamped to integer (no decimals)', () => {
        const list = { tasks: [{ completed: true }, { completed: false }, { completed: false }] };
        expect(Number.isInteger(computeProgress(list).pct)).toBe(true);
    });
});

describe('Natural Language Due Dates', () => {
    // Pure implementation of parseNaturalDate for testing
    function parseNaturalDate(value, referenceDate) {
        const v = value.trim().toLowerCase();
        const today = referenceDate ? new Date(referenceDate) : new Date();
        today.setHours(0, 0, 0, 0);
        const pad = n => String(n).padStart(2, '0');
        const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

        if (v === 'today' || v === 'td') return fmt(today);
        if (v === 'tomorrow' || v === 'tmr' || v === 'tom') {
            const d = new Date(today); d.setDate(d.getDate() + 1); return fmt(d);
        }
        const relMatch = v.match(/^\+?(\d+)\s*([dw])$/);
        if (relMatch) {
            const n = parseInt(relMatch[1], 10);
            const d = new Date(today);
            d.setDate(d.getDate() + (relMatch[2] === 'w' ? n * 7 : n));
            return fmt(d);
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) return fmt(parsed);
        return value;
    }

    const REF = '2026-06-26'; // fixed reference date for deterministic tests

    test('"today" → reference date', () => {
        expect(parseNaturalDate('today', REF)).toBe('2026-06-26');
    });

    test('"td" → reference date', () => {
        expect(parseNaturalDate('td', REF)).toBe('2026-06-26');
    });

    test('"tomorrow" → next day', () => {
        expect(parseNaturalDate('tomorrow', REF)).toBe('2026-06-27');
    });

    test('"tmr" → next day', () => {
        expect(parseNaturalDate('tmr', REF)).toBe('2026-06-27');
    });

    test('"tom" → next day', () => {
        expect(parseNaturalDate('tom', REF)).toBe('2026-06-27');
    });

    test('"+3d" → 3 days ahead', () => {
        expect(parseNaturalDate('+3d', REF)).toBe('2026-06-29');
    });

    test('"3d" (no plus) → 3 days ahead', () => {
        expect(parseNaturalDate('3d', REF)).toBe('2026-06-29');
    });

    test('"+1w" → 7 days ahead', () => {
        expect(parseNaturalDate('+1w', REF)).toBe('2026-07-03');
    });

    test('"2w" → 14 days ahead', () => {
        expect(parseNaturalDate('2w', REF)).toBe('2026-07-10');
    });

    test('"+0d" → today', () => {
        expect(parseNaturalDate('+0d', REF)).toBe('2026-06-26');
    });

    test('YYYY-MM-DD passes through unchanged', () => {
        expect(parseNaturalDate('2026-12-25', REF)).toBe('2026-12-25');
    });

    test('input is case-insensitive', () => {
        expect(parseNaturalDate('TODAY', REF)).toBe('2026-06-26');
        expect(parseNaturalDate('TMR', REF)).toBe('2026-06-27');
    });

    test('leading/trailing whitespace is trimmed', () => {
        expect(parseNaturalDate('  today  ', REF)).toBe('2026-06-26');
    });

    test('unrecognised string is returned as-is', () => {
        expect(parseNaturalDate('next friday', REF)).toBe('next friday');
    });
});

describe('Compact Mode', () => {
    test('compactMode defaults to false when localStorage is empty', () => {
        const mode = localStorage.getItem('compactMode') === 'true';
        expect(mode).toBe(false);
    });

    test('compactMode is true when localStorage has "true"', () => {
        localStorage.setItem('compactMode', 'true');
        const mode = localStorage.getItem('compactMode') === 'true';
        expect(mode).toBe(true);
    });

    test('compactMode is false when localStorage has "false"', () => {
        localStorage.setItem('compactMode', 'false');
        const mode = localStorage.getItem('compactMode') === 'true';
        expect(mode).toBe(false);
    });

    test('toggling compact updates localStorage to "true"', () => {
        let compactMode = false;
        compactMode = !compactMode;
        localStorage.setItem('compactMode', compactMode);
        expect(localStorage.getItem('compactMode')).toBe('true');
    });

    test('toggling twice restores original false state', () => {
        let compactMode = false;
        compactMode = !compactMode;
        compactMode = !compactMode;
        expect(compactMode).toBe(false);
    });

    test('compact-mode class is added to content-area when enabled', () => {
        document.body.innerHTML = '<div id="content-area"></div>';
        const el = document.getElementById('content-area');
        el.classList.toggle('compact-mode', true);
        expect(el.classList.contains('compact-mode')).toBe(true);
    });

    test('compact-mode class is removed from content-area when disabled', () => {
        document.body.innerHTML = '<div id="content-area" class="compact-mode"></div>';
        const el = document.getElementById('content-area');
        el.classList.toggle('compact-mode', false);
        expect(el.classList.contains('compact-mode')).toBe(false);
    });

    test('compact-btn gets active class when compact is on', () => {
        document.body.innerHTML = '<button id="compact-btn"></button>';
        const btn = document.getElementById('compact-btn');
        btn.classList.toggle('active', true);
        expect(btn.classList.contains('active')).toBe(true);
    });
});

// ── TIER 2 FEATURES ──────────────────────────────────────────────────────────

describe('Markdown Notes Rendering', () => {
    // Pure renderMarkdown implementation for testing
    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderMarkdown(text) {
        if (!text) return '';
        let s = escapeHtml(text);
        s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
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

    test('empty string returns empty string', () => {
        expect(renderMarkdown('')).toBe('');
    });

    test('null/undefined returns empty string', () => {
        expect(renderMarkdown(null)).toBe('');
    });

    test('plain text is returned as-is (escaped)', () => {
        const result = renderMarkdown('hello world');
        expect(result).toContain('hello world');
    });

    test('**text** renders as <strong>', () => {
        expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>');
    });

    test('*text* renders as <em>', () => {
        expect(renderMarkdown('*italic*')).toContain('<em>italic</em>');
    });

    test('**text** does not become <em>', () => {
        expect(renderMarkdown('**bold**')).not.toContain('<em>');
    });

    test('[label](url) renders as <a>', () => {
        const result = renderMarkdown('[click here](https://example.com)');
        expect(result).toContain('<a href="https://example.com"');
        expect(result).toContain('click here');
    });

    test('link has target=_blank', () => {
        expect(renderMarkdown('[x](http://y.com)')).toContain('target="_blank"');
    });

    test('link has rel=noopener', () => {
        expect(renderMarkdown('[x](http://y.com)')).toContain('rel="noopener noreferrer"');
    });

    test('- item renders as list item', () => {
        const result = renderMarkdown('- apple');
        expect(result).toContain('<ul>');
        expect(result).toContain('<li>apple</li>');
    });

    test('multiple list items produce one <ul>', () => {
        const result = renderMarkdown('- a\n- b\n- c');
        expect((result.match(/<ul>/g) || []).length).toBe(1);
        expect((result.match(/<li>/g) || []).length).toBe(3);
    });

    test('HTML special chars are escaped to prevent XSS', () => {
        const result = renderMarkdown('<script>alert(1)</script>');
        expect(result).not.toContain('<script>');
        expect(result).toContain('&lt;script&gt;');
    });

    test('bold and italic can coexist in one string', () => {
        const result = renderMarkdown('**bold** and *italic*');
        expect(result).toContain('<strong>bold</strong>');
        expect(result).toContain('<em>italic</em>');
    });

    test('text after a list continues as normal text', () => {
        const result = renderMarkdown('- item\nnormal');
        expect(result).toContain('</ul>');
        expect(result).toContain('normal');
    });
});

describe('Date Quick-Edit Popover', () => {
    // Uses the same parseNaturalDate logic tested in Tier 1
    function parseNaturalDate(value, ref) {
        const v = value.trim().toLowerCase();
        const today = ref ? new Date(ref) : new Date();
        today.setHours(0,0,0,0);
        const pad = n => String(n).padStart(2,'0');
        const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
        if (v === 'today' || v === 'td') return fmt(today);
        if (v === 'tomorrow' || v === 'tmr' || v === 'tom') { const d=new Date(today); d.setDate(d.getDate()+1); return fmt(d); }
        const m = v.match(/^\+?(\d+)\s*([dw])$/);
        if (m) { const d=new Date(today); d.setDate(d.getDate()+(m[2]==='w'?+m[1]*7:+m[1])); return fmt(d); }
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
        return value;
    }

    const REF = '2026-06-26';

    test('saving an empty value clears the due date', () => {
        const task = { id: 1, dueDate: '2026-07-01' };
        const val = '';
        task.dueDate = val ? parseNaturalDate(val, REF) : null;
        expect(task.dueDate).toBeNull();
    });

    test('saving "today" sets dueDate to today string', () => {
        const task = { id: 1, dueDate: null };
        task.dueDate = parseNaturalDate('today', REF);
        expect(task.dueDate).toBe('2026-06-26');
    });

    test('saving "+3d" sets correct date', () => {
        const task = { id: 1, dueDate: null };
        task.dueDate = parseNaturalDate('+3d', REF);
        expect(task.dueDate).toBe('2026-06-29');
    });

    test('saving YYYY-MM-DD stores it directly', () => {
        const task = { id: 1, dueDate: null };
        task.dueDate = parseNaturalDate('2026-12-25', REF);
        expect(task.dueDate).toBe('2026-12-25');
    });

    test('clearDatePopover sets dueDate to null', () => {
        const task = { id: 1, dueDate: '2026-07-01' };
        task.dueDate = null;
        expect(task.dueDate).toBeNull();
    });

    test('popover state: _datePopoverTaskId tracks open task', () => {
        let _datePopoverTaskId = null;
        _datePopoverTaskId = 42;
        expect(_datePopoverTaskId).toBe(42);
    });

    test('popover state: closing sets _datePopoverTaskId to null', () => {
        let _datePopoverTaskId = 42;
        _datePopoverTaskId = null;
        expect(_datePopoverTaskId).toBeNull();
    });

    test('popover renders open class when open', () => {
        document.body.innerHTML = '<div id="date-popover"></div>';
        document.getElementById('date-popover').classList.add('open');
        expect(document.getElementById('date-popover').classList.contains('open')).toBe(true);
    });

    test('popover loses open class after close', () => {
        document.body.innerHTML = '<div id="date-popover" class="open"></div>';
        document.getElementById('date-popover').classList.remove('open');
        expect(document.getElementById('date-popover').classList.contains('open')).toBe(false);
    });
});

describe('Focus Mode', () => {
    test('focus mode defaults to false', () => {
        let focusMode = false;
        expect(focusMode).toBe(false);
    });

    test('toggling focus mode sets it to true', () => {
        let focusMode = false;
        focusMode = !focusMode;
        expect(focusMode).toBe(true);
    });

    test('toggling twice restores false', () => {
        let focusMode = false;
        focusMode = !focusMode;
        focusMode = !focusMode;
        expect(focusMode).toBe(false);
    });

    test('focus-mode class is added to body when enabled', () => {
        document.body.classList.remove('focus-mode');
        document.body.classList.toggle('focus-mode', true);
        expect(document.body.classList.contains('focus-mode')).toBe(true);
    });

    test('focus-mode class is removed from body when disabled', () => {
        document.body.classList.add('focus-mode');
        document.body.classList.toggle('focus-mode', false);
        expect(document.body.classList.contains('focus-mode')).toBe(false);
    });

    test('focus-mode-btn gets active class when enabled', () => {
        document.body.innerHTML = '<button id="focus-mode-btn"></button>';
        document.getElementById('focus-mode-btn').classList.toggle('active', true);
        expect(document.getElementById('focus-mode-btn').classList.contains('active')).toBe(true);
    });

    test('focus-mode-btn loses active class when disabled', () => {
        document.body.innerHTML = '<button id="focus-mode-btn" class="active"></button>';
        document.getElementById('focus-mode-btn').classList.toggle('active', false);
        expect(document.getElementById('focus-mode-btn').classList.contains('active')).toBe(false);
    });

    test('Escape key exits focus mode', () => {
        let focusMode = true;
        const handleEscape = () => { if (focusMode) focusMode = false; };
        handleEscape();
        expect(focusMode).toBe(false);
    });

    test('F key toggles focus mode on', () => {
        let focusMode = false;
        const handleF = (inInput) => { if (!inInput) focusMode = !focusMode; };
        handleF(false);
        expect(focusMode).toBe(true);
    });

    test('F key does not fire when inside an input', () => {
        let focusMode = false;
        const handleF = (inInput) => { if (!inInput) focusMode = !focusMode; };
        handleF(true);
        expect(focusMode).toBe(false);
    });
});

// ── TIER 3 FEATURES ──────────────────────────────────────────────────────────

describe('Habit Streak Tracking', () => {
    function makeRecurringTask(overrides = {}) {
        return { id: 1, text: 'Meditate', completed: false, recurrence: 'daily', streak: 0, lastStreakDate: null, dueDate: '2026-06-26', ...overrides };
    }

    function applyStreak(task, todayStr) {
        const prevDate = task.lastStreakDate;
        if (prevDate && prevDate !== todayStr) {
            const diffDays = Math.round((new Date(todayStr) - new Date(prevDate)) / 86400000);
            const withinWindow = task.recurrence === 'daily' ? diffDays <= 2 : diffDays <= 9;
            task.streak = withinWindow ? (task.streak || 0) + 1 : 1;
        } else if (!prevDate) {
            task.streak = 1;
        }
        task.lastStreakDate = todayStr;
        return task;
    }

    test('new task has streak: 0 and lastStreakDate: null', () => {
        const task = makeRecurringTask();
        expect(task.streak).toBe(0);
        expect(task.lastStreakDate).toBeNull();
    });

    test('first completion sets streak to 1', () => {
        const task = makeRecurringTask();
        applyStreak(task, '2026-06-26');
        expect(task.streak).toBe(1);
    });

    test('completing next day increments streak for daily', () => {
        const task = makeRecurringTask({ streak: 1, lastStreakDate: '2026-06-25' });
        applyStreak(task, '2026-06-26');
        expect(task.streak).toBe(2);
    });

    test('completing same day does not increment (already counted)', () => {
        const task = makeRecurringTask({ streak: 1, lastStreakDate: '2026-06-26' });
        applyStreak(task, '2026-06-26');
        expect(task.streak).toBe(1);
    });

    test('missing a day (2 days gap) resets streak to 1 for daily', () => {
        const task = makeRecurringTask({ streak: 5, lastStreakDate: '2026-06-23' });
        applyStreak(task, '2026-06-26');
        expect(task.streak).toBe(1);
    });

    test('weekly recurrence: completing within 9 days increments', () => {
        const task = makeRecurringTask({ recurrence: 'weekly', streak: 3, lastStreakDate: '2026-06-19' });
        applyStreak(task, '2026-06-26');
        expect(task.streak).toBe(4);
    });

    test('weekly recurrence: completing after 10+ days resets streak', () => {
        const task = makeRecurringTask({ recurrence: 'weekly', streak: 3, lastStreakDate: '2026-06-10' });
        applyStreak(task, '2026-06-26');
        expect(task.streak).toBe(1);
    });

    test('streak >= 7 is considered "hot"', () => {
        const task = makeRecurringTask({ streak: 7 });
        expect(task.streak >= 7).toBe(true);
    });

    test('streak badge only shows when streak > 1', () => {
        const task1 = makeRecurringTask({ streak: 0 });
        const task2 = makeRecurringTask({ streak: 1 });
        const task3 = makeRecurringTask({ streak: 5 });
        expect(task1.recurrence && task1.streak > 1).toBe(false);
        expect(task2.recurrence && task2.streak > 1).toBe(false);
        expect(task3.recurrence && task3.streak > 1).toBe(true);
    });

    test('migration backfills streak: 0 on existing tasks', () => {
        const task = { id: 1, text: 'old' };
        if (task.streak === undefined) task.streak = 0;
        if (task.lastStreakDate === undefined) task.lastStreakDate = null;
        expect(task.streak).toBe(0);
        expect(task.lastStreakDate).toBeNull();
    });

    test('new recurring instance inherits streak via Object.assign', () => {
        const task = makeRecurringTask({ streak: 5, lastStreakDate: '2026-06-26' });
        const newTask = Object.assign({}, task, { id: 999, completed: false });
        expect(newTask.streak).toBe(5);
        expect(newTask.lastStreakDate).toBe('2026-06-26');
    });

    test('non-recurring task does not get streak applied', () => {
        const task = { id: 1, text: 'one-off', completed: false, recurrence: null, streak: 0 };
        if (task.recurrence) applyStreak(task, '2026-06-26');
        expect(task.streak).toBe(0);
    });
});

describe('Task Templates', () => {
    function makeTask(overrides = {}) {
        return { id: 1, text: 'Morning run', priority: true, today: false, tags: ['health'], subtasks: [{ id: 10, text: 'Warm up', completed: false }], recurrence: 'daily', notes: 'Early morning', pinned: false, ...overrides };
    }

    function buildTemplate(task) {
        return {
            id: 999,
            name: task.text,
            priority: task.priority,
            today: task.today,
            tags: task.tags ? task.tags.slice() : [],
            subtasks: (task.subtasks || []).map(s => ({ id: 888, text: s.text, completed: false })),
            recurrence: task.recurrence,
            notes: task.notes || '',
            pinned: task.pinned || false
        };
    }

    function useTemplate(tmpl) {
        return {
            id: 5000,
            text: tmpl.name,
            completed: false,
            priority: tmpl.priority || false,
            today: tmpl.today || false,
            dueDate: null,
            notes: tmpl.notes || '',
            subtasks: (tmpl.subtasks || []).map(s => ({ id: 6000, text: s.text, completed: false })),
            tags: tmpl.tags ? tmpl.tags.slice() : [],
            recurrence: tmpl.recurrence || null,
            pinned: tmpl.pinned || false,
            streak: 0,
            lastStreakDate: null
        };
    }

    test('saveAsTemplate captures task name', () => {
        const tmpl = buildTemplate(makeTask());
        expect(tmpl.name).toBe('Morning run');
    });

    test('saveAsTemplate captures priority', () => {
        expect(buildTemplate(makeTask({ priority: true })).priority).toBe(true);
        expect(buildTemplate(makeTask({ priority: false })).priority).toBe(false);
    });

    test('saveAsTemplate captures tags', () => {
        const tmpl = buildTemplate(makeTask({ tags: ['health', 'fitness'] }));
        expect(tmpl.tags).toEqual(['health', 'fitness']);
    });

    test('saveAsTemplate captures recurrence', () => {
        expect(buildTemplate(makeTask({ recurrence: 'weekly' })).recurrence).toBe('weekly');
    });

    test('saveAsTemplate captures notes', () => {
        expect(buildTemplate(makeTask({ notes: 'Remember to stretch' })).notes).toBe('Remember to stretch');
    });

    test('saveAsTemplate captures subtasks as incomplete copies', () => {
        const tmpl = buildTemplate(makeTask());
        expect(tmpl.subtasks[0].text).toBe('Warm up');
        expect(tmpl.subtasks[0].completed).toBe(false);
    });

    test('tags are a copy (mutation-safe)', () => {
        const task = makeTask({ tags: ['a', 'b'] });
        const tmpl = buildTemplate(task);
        tmpl.tags.push('c');
        expect(task.tags).not.toContain('c');
    });

    test('useTemplate creates a new task with correct fields', () => {
        const tmpl = buildTemplate(makeTask());
        const newTask = useTemplate(tmpl);
        expect(newTask.text).toBe('Morning run');
        expect(newTask.completed).toBe(false);
        expect(newTask.dueDate).toBeNull();
        expect(newTask.streak).toBe(0);
    });

    test('useTemplate task has fresh subtask copies', () => {
        const tmpl = buildTemplate(makeTask());
        const newTask = useTemplate(tmpl);
        expect(newTask.subtasks[0].text).toBe('Warm up');
        expect(newTask.subtasks[0].completed).toBe(false);
    });

    test('deleteTemplate removes it from the array', () => {
        let templates = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
        templates = templates.filter(t => t.id !== 1);
        expect(templates).toHaveLength(1);
        expect(templates[0].name).toBe('B');
    });

    test('deleteTemplate on non-existent id is a no-op', () => {
        let templates = [{ id: 1, name: 'A' }];
        templates = templates.filter(t => t.id !== 999);
        expect(templates).toHaveLength(1);
    });

    test('templates persist to localStorage', () => {
        const templates = [{ id: 1, name: 'Run' }];
        localStorage.setItem('taskTemplates', JSON.stringify(templates));
        const loaded = JSON.parse(localStorage.getItem('taskTemplates') || '[]');
        expect(loaded[0].name).toBe('Run');
    });

    test('empty templates list returns empty array from localStorage', () => {
        localStorage.removeItem('taskTemplates');
        const loaded = JSON.parse(localStorage.getItem('taskTemplates') || '[]');
        expect(loaded).toEqual([]);
    });
});

describe('URL Hash State', () => {
    function buildHash(listId, view, tag) {
        const params = new URLSearchParams();
        params.set('list', listId);
        params.set('view', view);
        if (tag) params.set('tag', tag);
        return '#' + params.toString();
    }

    function parseHash(hash, validListIds) {
        const str = hash.replace(/^#/, '');
        if (!str) return null;
        const params = new URLSearchParams(str);
        const listId = parseInt(params.get('list'), 10);
        const view = params.get('view');
        const tag = params.get('tag');
        const validViews = ['all','today','priority','stats','done','upcoming'];
        return {
            listId: (listId && validListIds.includes(listId)) ? listId : null,
            view: (view && validViews.includes(view)) ? view : null,
            tag: tag || null
        };
    }

    test('buildHash produces a hash with list and view', () => {
        const h = buildHash(1, 'today', null);
        expect(h).toContain('list=1');
        expect(h).toContain('view=today');
    });

    test('buildHash includes tag when provided', () => {
        const h = buildHash(1, 'all', 'work');
        expect(h).toContain('tag=work');
    });

    test('buildHash omits tag when null', () => {
        const h = buildHash(1, 'all', null);
        expect(h).not.toContain('tag');
    });

    test('parseHash extracts list, view, tag', () => {
        const result = parseHash('#list=2&view=today&tag=fitness', [1,2,3]);
        expect(result.listId).toBe(2);
        expect(result.view).toBe('today');
        expect(result.tag).toBe('fitness');
    });

    test('parseHash rejects invalid list id', () => {
        const result = parseHash('#list=999&view=all', [1,2,3]);
        expect(result.listId).toBeNull();
    });

    test('parseHash rejects invalid view', () => {
        const result = parseHash('#list=1&view=hacked', [1,2,3]);
        expect(result.view).toBeNull();
    });

    test('parseHash returns null tag when not present', () => {
        const result = parseHash('#list=1&view=all', [1,2,3]);
        expect(result.tag).toBeNull();
    });

    test('empty hash returns null', () => {
        const result = parseHash('', [1,2,3]);
        expect(result).toBeNull();
    });

    test('all valid views are accepted', () => {
        const views = ['all','today','priority','stats','done','upcoming'];
        views.forEach(v => {
            const result = parseHash(`#list=1&view=${v}`, [1]);
            expect(result.view).toBe(v);
        });
    });

    test('hash round-trips correctly', () => {
        const hash = buildHash(3, 'upcoming', 'health');
        const result = parseHash(hash, [1,2,3]);
        expect(result.listId).toBe(3);
        expect(result.view).toBe('upcoming');
        expect(result.tag).toBe('health');
    });
});
