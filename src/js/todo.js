export class TodoManager {
  constructor(storage) {
    this.storage = storage;
    this.todos = [];
  }
  
  createTodo(title, description, dueDate, priority, projectId) {
    const todo = {
      id: this.generateId(),
      title: title.trim(),
      description: description.trim() || '',
      dueDate,
      priority: priority || 'medium',
      projectId,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.todos.push(todo);
    return todo;
  }
  
  getTodosByProject(projectId) {
    return this.todos.filter(todo => todo.projectId === projectId);
  }
  
  getTodoById(id) {
    return this.todos.find(todo => todo.id === id);
  }
  
  deleteTodo(id) {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      this.todos.splice(index, 1);
      this.storage.saveTodos(this.todos);
      return true;
    }
    return false;
  }
  
  toggleTodo(id) {
    const todo = this.getTodoById(id);
    if (todo) {
      todo.completed = !todo.completed;
      todo.updatedAt = new Date().toISOString();
      this.storage.saveTodos(this.todos);
      return todo;
    }
    return null;
  }
  
  getCompletedCount(projectId) {
    return this.getTodosByProject(projectId).filter(t => t.completed).length;
  }
  
  getTotalCount(projectId) {
    return this.getTodosByProject(projectId).length;
  }
  
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  }
}