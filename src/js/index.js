import '../css/style.css';
import { ProjectManager } from './project.js';
import { TodoManager } from './todo.js';
import { StorageManager } from './storage.js';
import { UIManager } from './dom.js';

// Main Application Class
class App {
  constructor() {
    this.storage = new StorageManager();
    this.projectManager = new ProjectManager(this.storage);
    this.todoManager = new TodoManager(this.storage);
    this.uiManager = new UIManager(this.projectManager, this.todoManager, this.storage);
    
    this.init();
  }
  
  init() {
    // Load data
    this.loadData();
    
    // Render UI
    this.uiManager.render();
    
    // Setup events
    this.setupEventListeners();
  }
  
  loadData() {
    const projects = this.storage.loadProjects();
    const todos = this.storage.loadTodos();
    
    if (projects && projects.length > 0) {
      this.projectManager.projects = projects;
      this.projectManager.currentProjectId = projects[0].id;
    } else {
      const defaultProject = this.projectManager.createProject('My Tasks');
      this.projectManager.currentProjectId = defaultProject.id;
      this.storage.saveProjects(this.projectManager.projects);
    }
    
    if (todos) {
      this.todoManager.todos = todos;
    }
  }
  
  setupEventListeners() {
    // Project Modal
    document.getElementById('addProjectBtn').addEventListener('click', () => {
      this.uiManager.showProjectModal();
    });
    
    document.getElementById('projectCancelBtn').addEventListener('click', () => {
      this.uiManager.hideProjectModal();
    });
    
    document.getElementById('projectModalClose').addEventListener('click', () => {
      this.uiManager.hideProjectModal();
    });
    
    document.getElementById('projectForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('projectName').value.trim();
      if (name) {
        const project = this.projectManager.createProject(name);
        this.storage.saveProjects(this.projectManager.projects);
        this.uiManager.renderProjectList();
        this.uiManager.selectProject(project.id);
        this.uiManager.hideProjectModal();
        document.getElementById('projectName').value = '';
      }
    });
    
    // Todo Modal
    document.getElementById('addTodoBtn').addEventListener('click', () => {
      if (this.projectManager.getCurrentProject()) {
        this.uiManager.showTodoModal();
      }
    });
    
    document.getElementById('todoCancelBtn').addEventListener('click', () => {
      this.uiManager.hideTodoModal();
    });
    
    document.getElementById('todoModalClose').addEventListener('click', () => {
      this.uiManager.hideTodoModal();
    });
    
    document.getElementById('todoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('todoTitle').value.trim();
      const description = document.getElementById('todoDescription').value.trim();
      const dueDate = document.getElementById('todoDueDate').value;
      const priority = document.getElementById('todoPriority').value;
      
      if (title && dueDate) {
        const currentProject = this.projectManager.getCurrentProject();
        if (currentProject) {
          if (this.uiManager.editingTodoId) {
            // Edit mode
            const todo = this.todoManager.getTodoById(this.uiManager.editingTodoId);
            if (todo) {
              Object.assign(todo, { title, description, dueDate, priority });
              this.storage.saveTodos(this.todoManager.todos);
              this.uiManager.renderTodos(currentProject.id);
            }
            this.uiManager.editingTodoId = null;
            document.getElementById('todoModalTitle').textContent = 'Add New Task';
            document.getElementById('todoSaveBtn').innerHTML = '<i class="fas fa-save"></i> Save Task';
          } else {
            // Create mode
            this.todoManager.createTodo(title, description, dueDate, priority, currentProject.id);
            this.storage.saveTodos(this.todoManager.todos);
            this.uiManager.renderTodos(currentProject.id);
          }
          this.uiManager.updateStats(currentProject.id);
          this.uiManager.hideTodoModal();
          document.getElementById('todoForm').reset();
        }
      }
    });
    
    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
          modal.classList.remove('active');
        });
      }
    });
  }
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

export { App };