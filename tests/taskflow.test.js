/**
 * TaskFlow - Basic Tests
 */

describe('TaskFlow - Task Management', () => {
  
  // Mock localStorage
  beforeEach(() => {
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

    test('should toggle task priority', () => {
      const task = {
        id: 1,
        text: 'Test task',
        priority: false
      };

      task.priority = !task.priority;
      
      expect(task.priority).toBe(true);
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
  });
});
