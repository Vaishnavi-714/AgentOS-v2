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

  // Test Cases
  getTestCases(projectId) {
    const fromKey = this.get('test_cases_' + projectId);
    if (Array.isArray(fromKey)) return fromKey;
    const project = this.getProject(projectId);
    return Array.isArray(project?.testCases) ? project.testCases : [];
  },
  setTestCases(projectId, testCases) {
    const normalized = Array.isArray(testCases) ? testCases : [];
    this.set('test_cases_' + projectId, normalized);
    const project = this.getProject(projectId);
    if (project) {
      project.testCases = normalized;
      project.updatedAt = new Date().toISOString();
      this.saveProject(project);
    }
  },

  // LLM Sessions
  getLlmSessions(projectId) {
    const fromKey = this.get('llm_sessions_' + projectId);
    if (Array.isArray(fromKey)) return fromKey;
    const project = this.getProject(projectId);
    return Array.isArray(project?.llmSessions) ? project.llmSessions : [];
  },
  setLlmSessions(projectId, sessions) {
    const normalized = Array.isArray(sessions) ? sessions : [];
    this.set('llm_sessions_' + projectId, normalized);
    const project = this.getProject(projectId);
    if (project) {
      project.llmSessions = normalized;
      this.saveProject(project);
    }
  },

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

  // Code Reviews
  getCodeReviews(projectId) { return this.get('code_reviews_' + projectId) || []; },
  setCodeReviews(projectId, reviews) { this.set('code_reviews_' + projectId, reviews); },
  addCodeReview(projectId, review) { const r = this.getCodeReviews(projectId); r.push(review); this.setCodeReviews(projectId, r); },

  // Incidents
  getIncidents() { return this.get('incidents') || []; },
  setIncidents(i) { this.set('incidents', i); },
  addIncident(inc) { const i = this.getIncidents(); i.push(inc); this.setIncidents(i); },

  // Notifications
  getNotifications() { return this.get('notifications') || []; },
  setNotifications(n) { this.set('notifications', n); },
  markNotificationRead(id) { const n = this.getNotifications(); const f = n.find(x => x.id === id); if (f) f.read = true; this.setNotifications(n); },
  markAllNotificationsRead() { const n = this.getNotifications(); n.forEach(x => x.read = true); this.setNotifications(n); },

  // AI Safety
  getSafetyAlerts() { return this.get('safety_alerts') || []; },
  setSafetyAlerts(a) { this.set('safety_alerts', a); },
  addSafetyAlert(alert) { const a = this.getSafetyAlerts(); a.push(alert); this.setSafetyAlerts(a); },

  // Deployments
  getDeployments(projectId) { return this.get('deployments_' + projectId) || []; },
  setDeployments(projectId, d) { this.set('deployments_' + projectId, d); },
  addDeployment(projectId, dep) { const d = this.getDeployments(projectId); d.push(dep); this.setDeployments(projectId, d); },

  // Integrations
  getIntegrations() { return this.get('integrations') || []; },
  setIntegrations(i) { this.set('integrations', i); },

  // Compliance
  getComplianceControls() { return this.get('compliance_controls') || []; },
  setComplianceControls(c) { this.set('compliance_controls', c); },

  // Command Center History
  getCommandHistory() { return this.get('command_history') || []; },
  addCommandEntry(entry) { const h = this.getCommandHistory(); h.push(entry); if (h.length > 200) h.shift(); this.set('command_history', h); },

  // Observability
  getObservabilityMetrics() { return this.get('observability_metrics') || {}; },
  setObservabilityMetrics(m) { this.set('observability_metrics', m); },

  // Check if seeded
  isSeeded() { return this.get('seeded') === true; },
  markSeeded() { this.set('seeded', true); },

  // Settings & Configuration
  getSettings() { return this.get('workspace_settings') || null; },
  setSettings(s) { this.set('workspace_settings', s); },
  clearSettings() { this.remove('workspace_settings'); },

  // ─── Project-Scoped Agents ───
  getProjectAgents(projectId) { return this.get('project_agents_' + projectId) || []; },
  setProjectAgents(projectId, agents) { this.set('project_agents_' + projectId, agents); },
  getProjectAgent(projectId, agentId) { return this.getProjectAgents(projectId).find(a => a.agent_id === agentId); },
  saveProjectAgent(projectId, agent) {
    const agents = this.getProjectAgents(projectId);
    const idx = agents.findIndex(a => a.agent_id === agent.agent_id);
    if (idx >= 0) agents[idx] = agent;
    else agents.push(agent);
    this.setProjectAgents(projectId, agents);
  },
  removeProjectAgent(projectId, agentId) {
    const agents = this.getProjectAgents(projectId).filter(a => a.agent_id !== agentId);
    this.setProjectAgents(projectId, agents);
  },

  // ─── Project-Scoped Org Structure ───
  getProjectOrgStructure(projectId) { return this.get('project_org_' + projectId) || null; },
  setProjectOrgStructure(projectId, org) { this.set('project_org_' + projectId, org); },

  // ─── Project-Scoped Workflows ───
  getProjectWorkflows(projectId) { return this.get('project_workflows_' + projectId) || []; },
  setProjectWorkflows(projectId, wfs) { this.set('project_workflows_' + projectId, wfs); },
  saveProjectWorkflow(projectId, wf) {
    const wfs = this.getProjectWorkflows(projectId);
    const idx = wfs.findIndex(w => w.id === wf.id);
    if (idx >= 0) wfs[idx] = wf;
    else wfs.push(wf);
    this.setProjectWorkflows(projectId, wfs);
  },
  removeProjectWorkflow(projectId, wfId) {
    const wfs = this.getProjectWorkflows(projectId).filter(w => w.id !== wfId);
    this.setProjectWorkflows(projectId, wfs);
  },

  // ─── Active Project Selection ───
  getActiveProject() { return this.get('active_project_id') || null; },
  setActiveProject(projectId) { this.set('active_project_id', projectId); }
};
