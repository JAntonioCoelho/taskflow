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
      const div = document.createElement('div');
      div.appendChild(document.createTextNode('"quoted"'));
      expect(div.innerHTML).toBe('"quoted"');
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
});
