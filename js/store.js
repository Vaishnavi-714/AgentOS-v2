// NEXUS LocalStorage State Management
const NexusStore = {
  _prefix: 'nexus_',

  get(key) {
    try {
      const raw = localStorage.getItem(this._prefix + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  set(key, value) {
    localStorage.setItem(this._prefix + key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(this._prefix + key);
  },

  // Auth
  getUser() { return this.get('current_user'); },
  setUser(user) { this.set('current_user', user); },
  logout() { this.remove('current_user'); },
  isLoggedIn() { return !!this.getUser(); },

  // Projects
  getProjects() { return this.get('projects') || []; },
  setProjects(p) { this.set('projects', p); },
  getProject(id) { return this.getProjects().find(p => p.id === id); },
  saveProject(project) {
    const projects = this.getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx >= 0) projects[idx] = project;
    else projects.push(project);
    this.setProjects(projects);
  },

  // Requirements
  getRequirements(projectId) { return this.get('requirements_' + projectId) || []; },
  setRequirements(projectId, reqs) { this.set('requirements_' + projectId, reqs); },
  addRequirement(projectId, req) {
    const reqs = this.getRequirements(projectId);
    reqs.push(req);
    this.setRequirements(projectId, reqs);
  },

  // Pipeline
  getPipeline(projectId) { return this.get('pipeline_' + projectId) || null; },
  setPipeline(projectId, pipeline) { this.set('pipeline_' + projectId, pipeline); },

  // Backlog
  getBacklog(projectId) { return this.get('backlog_' + projectId) || []; },
  setBacklog(projectId, backlog) { this.set('backlog_' + projectId, backlog); },

  // Agents
  getAgents() { return this.get('agents') || []; },
  setAgents(a) { this.set('agents', a); },
  getAgent(id) { return this.getAgents().find(a => a.agent_id === id); },
  saveAgent(agent) {
    const agents = this.getAgents();
    const idx = agents.findIndex(a => a.agent_id === agent.agent_id);
    if (idx >= 0) agents[idx] = agent;
    else agents.push(agent);
    this.setAgents(agents);
  },

  // Agent Workspace Files
  getWorkspaceFile(agentId, fileName) {
    return this.get('workspace_' + agentId + '_' + fileName) || '';
  },
  setWorkspaceFile(agentId, fileName, content) {
    this.set('workspace_' + agentId + '_' + fileName, content);
  },

  // Tasks
  getTasks(projectId) { return this.get('tasks_' + projectId) || []; },
  setTasks(projectId, tasks) { this.set('tasks_' + projectId, tasks); },
  saveTask(projectId, task) {
    const tasks = this.getTasks(projectId);
    const idx = tasks.findIndex(t => t.task_id === task.task_id);
    if (idx >= 0) tasks[idx] = task;
    else tasks.push(task);
    this.setTasks(projectId, tasks);
  },

  // Escalations
  getEscalations() { return this.get('escalations') || []; },
  setEscalations(e) { this.set('escalations', e); },
  addEscalation(esc) {
    const escs = this.getEscalations();
    escs.push(esc);
    this.setEscalations(escs);
  },

  // Decisions
  getDecisions() { return this.get('decisions') || []; },
  setDecisions(d) { this.set('decisions', d); },
  addDecision(dec) {
    const decs = this.getDecisions();
    decs.push(dec);
    this.setDecisions(decs);
  },

  // Quality Gates
  getGateReviews(projectId) { return this.get('gates_' + projectId) || []; },
  setGateReviews(projectId, gates) { this.set('gates_' + projectId, gates); },

  // Logs
  getLogs() { return this.get('system_logs') || []; },
  addLog(log) {
    const logs = this.getLogs();
    logs.unshift({ ...log, timestamp: new Date().toISOString() });
    if (logs.length > 500) logs.length = 500;
    this.set('system_logs', logs);
  },

  // System state
  getSystemState() { return this.get('system_state') || 'IDLE'; },
  setSystemState(s) { this.set('system_state', s); },

  // Clear all
  clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this._prefix))
      .forEach(k => localStorage.removeItem(k));
  },

  // Check if seeded
  isSeeded() { return this.get('seeded') === true; },
  markSeeded() { this.set('seeded', true); }
};
