import { Project, Workflow, ExecutionHistory, UserPreferences, NodeTemplate } from './schema';

/**
 * LocalStorage-based persistence layer
 * Simple browser storage for development/demo purposes
 * Can be replaced with IndexedDB, Firebase, or backend API
 */
export class LocalStorageService {
  private static readonly PREFIX = 'alloy_';

  // Storage keys
  private static readonly KEYS = {
    projects: `${LocalStorageService.PREFIX}projects`,
    workflows: `${LocalStorageService.PREFIX}workflows`,
    executionHistory: `${LocalStorageService.PREFIX}execution_history`,
    userPreferences: `${LocalStorageService.PREFIX}user_preferences`,
    nodeTemplates: `${LocalStorageService.PREFIX}node_templates`
  };

  // Projects
  static getProjects(): Project[] {
    return this.getItem<Project[]>(this.KEYS.projects) || [];
  }

  static saveProject(project: Project): void {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    
    this.setItem(this.KEYS.projects, projects);
  }

  static deleteProject(projectId: string): void {
    const projects = this.getProjects().filter(p => p.id !== projectId);
    this.setItem(this.KEYS.projects, projects);
    
    // Also delete associated workflows
    const workflows = this.getWorkflows().filter(w => w.projectId !== projectId);
    this.setItem(this.KEYS.workflows, workflows);
  }

  // Workflows
  static getWorkflows(projectId?: string): Workflow[] {
    const workflows = this.getItem<Workflow[]>(this.KEYS.workflows) || [];
    return projectId ? workflows.filter(w => w.projectId === projectId) : workflows;
  }

  static saveWorkflow(workflow: Workflow): void {
    const workflows = this.getWorkflows();
    const index = workflows.findIndex(w => w.id === workflow.id);
    
    if (index >= 0) {
      workflows[index] = workflow;
    } else {
      workflows.push(workflow);
    }
    
    this.setItem(this.KEYS.workflows, workflows);
  }

  static deleteWorkflow(workflowId: string): void {
    const workflows = this.getWorkflows().filter(w => w.id !== workflowId);
    this.setItem(this.KEYS.workflows, workflows);
  }

  // Execution History
  static getExecutionHistory(workflowId?: string): ExecutionHistory[] {
    const history = this.getItem<ExecutionHistory[]>(this.KEYS.executionHistory) || [];
    return workflowId ? history.filter(h => h.workflowId === workflowId) : history;
  }

  static saveExecutionHistory(execution: ExecutionHistory): void {
    const history = this.getExecutionHistory();
    history.push(execution);
    this.setItem(this.KEYS.executionHistory, history);
  }

  // User Preferences
  static getUserPreferences(userId: string): UserPreferences | null {
    const prefs = this.getItem<UserPreferences[]>(this.KEYS.userPreferences) || [];
    return prefs.find(p => p.userId === userId) || null;
  }

  static saveUserPreferences(preferences: UserPreferences): void {
    const prefs = this.getItem<UserPreferences[]>(this.KEYS.userPreferences) || [];
    const index = prefs.findIndex(p => p.userId === preferences.userId);
    
    if (index >= 0) {
      prefs[index] = preferences;
    } else {
      prefs.push(preferences);
    }
    
    this.setItem(this.KEYS.userPreferences, prefs);
  }

  // Node Templates
  static getNodeTemplates(): NodeTemplate[] {
    return this.getItem<NodeTemplate[]>(this.KEYS.nodeTemplates) || [];
  }

  static saveNodeTemplate(template: NodeTemplate): void {
    const templates = this.getNodeTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    
    this.setItem(this.KEYS.nodeTemplates, templates);
  }

  static deleteNodeTemplate(templateId: string): void {
    const templates = this.getNodeTemplates().filter(t => t.id !== templateId);
    this.setItem(this.KEYS.nodeTemplates, templates);
  }

  // Generic storage methods
  private static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  }

  // Clear all data
  static clearAll(): void {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}
