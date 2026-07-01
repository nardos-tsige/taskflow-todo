import { format, formatDistanceToNow, isToday, isPast, isFuture } from 'date-fns';

export class UIManager {
  constructor(projectManager, todoManager, storage) {
    this.projectManager = projectManager;
    this.todoManager = todoManager;
    this.storage = storage;
    this.editingTodoId = null;
    
    // DOM references
    this.projectList = document.getElementById('projectList');
    this.todoList = document.getElementById('todoList');
    this.currentProjectTitle = document.getElementById('currentProjectTitle');
    this.taskCount = document.getElementById('taskCount');
    this.totalTasks = document.getElementById('totalTasks');
  }
  
  render() {
    this.renderProjectList();
    const currentProject = this.projectManager.getCurrentProject();
    if (currentProject) {
      this.renderTodos(currentProject.id);
      this.updateStats(currentProject.id);
    }
  }
  
  renderProjectList() {
    const projects = this.projectManager.projects;
    const currentId = this.projectManager.currentProjectId;
    
    if (projects.length === 0) {
      this.projectList.innerHTML = `
        <div class="empty-state" style="padding: var(--space-lg); text-align: center; color: var(--text-tertiary);">
          <i class="fas fa-plus-circle" style="font-size: 2rem; display: block; margin-bottom: var(--space-sm);"></i>
          <p style="font-size: 0.875rem;">No projects yet</p>
          <p style="font-size: 0.75rem;">Click "New Project" to start</p>
        </div>
      `;
      return;
    }
    
    this.projectList.innerHTML = projects.map(project => {
      const count = this.todoManager.getTotalCount(project.id);
      const isActive = project.id === currentId;
      return `
        <div class="project-item ${isActive ? 'active' : ''}" data-id="${project.id}">
          <div class="project-info">
            <i class="fas fa-folder${isActive ? '-open' : ''}"></i>
            <span class="project-name">${this.escapeHtml(project.name)}</span>
            <span class="project-badge">${count}</span>
          </div>
          <div class="project-actions">
            <button class="delete-project" data-id="${project.id}" title="Delete project">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    // Event listeners for projects
    this.projectList.querySelectorAll('.project-item').forEach(item => {
      const id = item.dataset.id;
      
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.project-actions')) {
          this.selectProject(id);
        }
      });
      
      const deleteBtn = item.querySelector('.delete-project');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteProject(id);
        });
      }
    });
  }
  
  selectProject(id) {
    if (this.projectManager.setCurrentProject(id)) {
      this.storage.saveProjects(this.projectManager.projects);
      this.renderProjectList();
      this.renderTodos(id);
      this.updateStats(id);
    }
  }
  
  renderTodos(projectId) {
    const todos = this.todoManager.getTodosByProject(projectId);
    const project = this.projectManager.getProjectById(projectId);
    
    if (!project) {
      this.todoList.innerHTML = '';
      return;
    }
    
    this.currentProjectTitle.textContent = project.name;
    
    if (todos.length === 0) {
      this.todoList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-clipboard-list"></i>
          <h3>No tasks yet</h3>
          <p>Click "Add Task" to create your first task in this project</p>
        </div>
      `;
      return;
    }
    
    // Sort: incomplete first, then by due date
    const sortedTodos = [...todos].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    this.todoList.innerHTML = sortedTodos.map(todo => {
      const dueDateObj = new Date(todo.dueDate);
      const isOverdue = isPast(dueDateObj) && !isToday(dueDateObj) && !todo.completed;
      const isTodayDue = isToday(dueDateObj) && !todo.completed;
      
      let dueClass = 'upcoming';
      if (isOverdue) dueClass = 'overdue';
      else if (isTodayDue) dueClass = 'today';
      
      const formattedDate = format(dueDateObj, 'MMM d, yyyy');
      const timeAgo = formatDistanceToNow(dueDateObj, { addSuffix: true });
      
      return `
        <div class="todo-item priority-${todo.priority}" data-id="${todo.id}">
          <div class="todo-check">
            <input type="checkbox" ${todo.completed ? 'checked' : ''} class="todo-toggle" />
          </div>
          <div class="todo-content">
            <div class="todo-header">
              <span class="todo-title ${todo.completed ? 'completed' : ''}">${this.escapeHtml(todo.title)}</span>
              <span class="todo-priority ${todo.priority}">${todo.priority}</span>
            </div>
            ${todo.description ? `<div class="todo-description">${this.escapeHtml(todo.description)}</div>` : ''}
            <div class="todo-meta">
              <span class="todo-due ${dueClass}">
                <i class="fas fa-calendar-alt"></i>
                ${formattedDate}
                <span style="color: var(--text-tertiary); font-size: 0.7rem;">(${timeAgo})</span>
              </span>
            </div>
          </div>
          <div class="todo-actions">
            <button class="edit-todo" data-id="${todo.id}" title="Edit task">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-todo" data-id="${todo.id}" title="Delete task">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    // Event listeners for todos
    this.todoList.querySelectorAll('.todo-toggle').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const item = e.target.closest('.todo-item');
        if (item) {
          this.toggleTodo(item.dataset.id);
        }
      });
    });
    
    this.todoList.querySelectorAll('.delete-todo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this task?')) {
          this.deleteTodo(btn.dataset.id);
        }
      });
    });
    
    this.todoList.querySelectorAll('.edit-todo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.editTodo(btn.dataset.id);
      });
    });
    
    // Click on todo to toggle
    this.todoList.querySelectorAll('.todo-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.todo-actions') && !e.target.closest('.todo-check')) {
          this.toggleTodo(item.dataset.id);
        }
      });
    });
  }
  
  toggleTodo(id) {
    const todo = this.todoManager.toggleTodo(id);
    if (todo) {
      const project = this.projectManager.getCurrentProject();
      if (project) {
        this.renderTodos(project.id);
        this.updateStats(project.id);
      }
    }
  }
  
  deleteTodo(id) {
    if (this.todoManager.deleteTodo(id)) {
      const project = this.projectManager.getCurrentProject();
      if (project) {
        this.renderTodos(project.id);
        this.updateStats(project.id);
        this.renderProjectList();
      }
    }
  }
  
  deleteProject(id) {
    const project = this.projectManager.getProjectById(id);
    if (!project) return;
    
    if (confirm(`Delete "${project.name}" and all its tasks?`)) {
      // Delete all todos in this project
      const todos = this.todoManager.getTodosByProject(id);
      todos.forEach(t => this.todoManager.deleteTodo(t.id));
      
      // Delete project
      this.projectManager.deleteProject(id);
      this.storage.saveProjects(this.projectManager.projects);
      this.storage.saveTodos(this.todoManager.todos);
      
      this.renderProjectList();
      const currentProject = this.projectManager.getCurrentProject();
      if (currentProject) {
        this.renderTodos(currentProject.id);
        this.updateStats(currentProject.id);
      } else {
        this.todoList.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-folder-plus"></i>
            <h3>No projects</h3>
            <p>Create a new project to get started</p>
          </div>
        `;
        this.currentProjectTitle.textContent = 'No Project';
        this.taskCount.textContent = '0 tasks';
      }
    }
  }
  
  editTodo(id) {
    const todo = this.todoManager.getTodoById(id);
    if (!todo) return;
    
    this.editingTodoId = id;
    document.getElementById('todoModalTitle').textContent = 'Edit Task';
    document.getElementById('todoSaveBtn').innerHTML = '<i class="fas fa-save"></i> Update Task';
    
    document.getElementById('todoTitle').value = todo.title;
    document.getElementById('todoDescription').value = todo.description || '';
    document.getElementById('todoDueDate').value = todo.dueDate;
    document.getElementById('todoPriority').value = todo.priority;
    
    this.showTodoModal();
  }
  
  updateStats(projectId) {
    const total = this.todoManager.getTotalCount(projectId);
    const completed = this.todoManager.getCompletedCount(projectId);
    
    this.taskCount.textContent = `${total} task${total !== 1 ? 's' : ''}`;
    
    // Update sidebar badge
    this.renderProjectList();
    
    // Total tasks across all projects
    const allTodos = this.todoManager.todos;
    const allCompleted = allTodos.filter(t => t.completed).length;
    this.totalTasks.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${allCompleted} of ${allTodos.length} tasks completed</span>
    `;
  }
  
  showProjectModal() {
    const modal = document.getElementById('projectModal');
    document.getElementById('projectModalTitle').textContent = 'Create New Project';
    document.getElementById('projectName').value = '';
    modal.classList.add('active');
    setTimeout(() => document.getElementById('projectName').focus(), 100);
  }
  
  hideProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
  }
  
  showTodoModal() {
    const modal = document.getElementById('todoModal');
    if (!document.getElementById('todoDueDate').value) {
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('todoDueDate').value = today;
    }
    modal.classList.add('active');
    setTimeout(() => document.getElementById('todoTitle').focus(), 100);
  }
  
  hideTodoModal() {
    document.getElementById('todoModal').classList.remove('active');
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}