export class StorageManager {
  constructor() {
    this.storageKey = 'taskflow_data';
  }
  
  saveProjects(projects) {
    const data = this.loadAll();
    data.projects = projects;
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  
  saveTodos(todos) {
    const data = this.loadAll();
    data.todos = todos;
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  
  loadProjects() {
    return this.loadAll().projects || [];
  }
  
  loadTodos() {
    return this.loadAll().todos || [];
  }
  
  loadAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : { projects: [], todos: [] };
    } catch (error) {
      console.error('Error loading data:', error);
      return { projects: [], todos: [] };
    }
  }
  
  clearAll() {
    localStorage.removeItem(this.storageKey);
  }
}