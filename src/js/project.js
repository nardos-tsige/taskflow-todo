export class ProjectManager {
  constructor(storage) {
    this.storage = storage;
    this.projects = [];
    this.currentProjectId = null;
  }
  
  createProject(name) {
    const project = {
      id: this.generateId(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.projects.push(project);
    this.currentProjectId = project.id;
    return project;
  }
  
  deleteProject(id) {
    const index = this.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projects.splice(index, 1);
      if (this.currentProjectId === id) {
        this.currentProjectId = this.projects.length > 0 ? this.projects[0].id : null;
      }
      this.storage.saveProjects(this.projects);
      return true;
    }
    return false;
  }
  
  getCurrentProject() {
    return this.projects.find(p => p.id === this.currentProjectId) || null;
  }
  
  getProjectById(id) {
    return this.projects.find(p => p.id === id) || null;
  }
  
  setCurrentProject(id) {
    if (this.getProjectById(id)) {
      this.currentProjectId = id;
      return true;
    }
    return false;
  }
  
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  }
}