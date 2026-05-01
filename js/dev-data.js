const DevData = {
  sectionKeys: ['overview', 'scope', 'deliverables', 'schedule', 'quality', 'resources', 'risks', 'summary'],

  defaultAchievements: [
    'Authentication module completed by Dev Agent',
    'API integration for payments stabilized',
    'Dashboard UI components deployed',
    'Code review passed with zero critical issues'
  ],

  defaultChallenges: [
    'Delay due to external API dependency',
    'Regression defects in reporting module',
    'Pending backend integration for analytics'
  ],

  simulatedTasks: [
    { task_id: 'SIM-001', title: 'Finalize authentication flows', module: 'auth', status: 'done', assignedTo: 'Developer Agent - Auth 01', risk: 'MEDIUM', storyRef: 'US-AUTH-01', logs: ['Auth module merged into main branch'] },
    { task_id: 'SIM-002', title: 'Stabilize payments API integration', module: 'payments', status: 'in-progress', assignedTo: 'Developer Agent - Payments 01', risk: 'HIGH', storyRef: 'US-PAY-02', logs: ['External gateway contract validation in progress'] },
    { task_id: 'SIM-003', title: 'Implement dashboard widget state sync', module: 'dashboard', status: 'todo', assignedTo: 'Developer Agent - UI 01', risk: 'MEDIUM', storyRef: 'US-UI-04', logs: ['Waiting for active sprint slot'] },
    { task_id: 'SIM-004', title: 'Refine reports aggregation pipeline', module: 'reports', status: 'in-progress', assignedTo: 'Developer Agent - Reports 01', risk: 'MEDIUM', storyRef: 'US-REP-03', logs: ['Regression fixes queued after integration test run'] }
  ],

  getSelectedProjectId() {
    const active = NexusStore.getActiveProject();
    if (active && NexusStore.getProject(active)) return active;
    const fallback = NexusStore.getProjects()[0]?.id || null;
    if (fallback) NexusStore.setActiveProject(fallback);
    return fallback;
  },

  getSelectedProject() {
    const projectId = this.getSelectedProjectId();
    return projectId ? NexusStore.getProject(projectId) : null;
  },

  readJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getRawProjects() {
    return this.readJSON('projects')
      || this.readJSON('nexus_projects')
      || NexusStore.getProjects()
      || [];
  },

  getRawTasks(projectId) {
    const direct = this.readJSON('tasks');
    if (Array.isArray(direct) && direct.length) return direct;

    const nexusDirect = this.readJSON('nexus_tasks');
    if (Array.isArray(nexusDirect) && nexusDirect.length) return nexusDirect;

    const scoped = []
      .concat(this.readJSON(`tasks_${projectId}`) || [])
      .concat(this.readJSON(`nexus_tasks_${projectId}`) || [])
      .concat(NexusStore.getTasks(projectId) || []);

    return scoped;
  },

  getRawBacklog(projectId) {
    const direct = this.readJSON('backlog');
    if (Array.isArray(direct) && direct.length) return direct;

    const nexusDirect = this.readJSON('nexus_backlog');
    if (Array.isArray(nexusDirect) && nexusDirect.length) return nexusDirect;

    return []
      .concat(this.readJSON(`backlog_${projectId}`) || [])
      .concat(this.readJSON(`nexus_backlog_${projectId}`) || [])
      .concat(NexusStore.getBacklog(projectId) || []);
  },

  normalizeStatus(status) {
    const value = String(status || '').toLowerCase().replace(/_/g, '-');
    if (['done', 'completed', 'pass', 'passed', 'resolved'].includes(value)) return 'done';
    if (['in-progress', 'executing', 'agent-assigned', 'active', 'review'].includes(value)) return 'in-progress';
    if (['blocked', 'escalated'].includes(value)) return 'blocked';
    return 'todo';
  },

  displayStatus(status) {
    const value = this.normalizeStatus(status);
    if (value === 'done') return 'DONE';
    if (value === 'in-progress') return 'IN_PROGRESS';
    if (value === 'blocked') return 'BLOCKED';
    return 'PENDING';
  },

  titleCase(value) {
    return String(value || 'core')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  },

  ensureTasks(tasks) {
    if (Array.isArray(tasks) && tasks.length) return tasks;
    return this.simulatedTasks.map(task => ({ ...task }));
  },

  buildModules(tasks, projectModules) {
    const modules = {};

    (projectModules || []).forEach(name => {
      modules[name] = { name, total: 0, done: 0, inProgress: 0, pending: 0, blocked: 0 };
    });

    tasks.forEach(task => {
      const moduleName = task.module || 'core';
      if (!modules[moduleName]) {
        modules[moduleName] = { name: moduleName, total: 0, done: 0, inProgress: 0, pending: 0, blocked: 0 };
      }

      const status = this.normalizeStatus(task.status);
      modules[moduleName].total += 1;
      if (status === 'done') modules[moduleName].done += 1;
      else if (status === 'in-progress') modules[moduleName].inProgress += 1;
      else if (status === 'blocked') modules[moduleName].blocked += 1;
      else modules[moduleName].pending += 1;
    });

    return Object.values(modules).map(module => {
      if (!module.total) {
        module.total = 1;
        module.pending = 1;
      }
      const progress = Math.max(8, Math.round((module.done / module.total) * 100));
      return {
        name: module.name,
        total: module.total,
        completed: module.done,
        done: module.done,
        inProgress: module.inProgress,
        pending: module.pending,
        blocked: module.blocked,
        progress,
        status: module.done === module.total ? 'DONE' : module.blocked > 0 ? 'BLOCKED' : module.inProgress > 0 ? 'IN_PROGRESS' : 'PENDING'
      };
    });
  },

  collectProjectContext(projectId) {
    const projects = this.getRawProjects();
    const project = projects.find(item => item.id === projectId) || projects[0] || {
      id: 'proj_sim_001',
      name: 'AI Commerce Workspace',
      status: 'ACTIVE',
      domain: 'AI Platforms',
      techStack: ['Node.js', 'React', 'PostgreSQL'],
      modules: ['auth', 'payments', 'dashboard', 'reports']
    };

    const tasks = this.ensureTasks(this.getRawTasks(project.id)).map((task, index) => ({
      task_id: task.task_id || task.id || `TASK-${index + 1}`,
      title: task.title || `${this.titleCase(task.module || 'core')} execution task ${index + 1}`,
      module: task.module || 'core',
      status: this.normalizeStatus(task.status),
      assignedTo: task.assignedTo || task.owner || task.assignee || `Developer Agent - ${this.titleCase(task.module || 'core')}`,
      risk: task.risk || (index % 3 === 0 ? 'HIGH' : 'MEDIUM'),
      storyRef: task.storyRef || task.parentId || `US-${index + 1}`,
      logs: task.logs || [`${this.titleCase(task.module || 'core')} task currently handled by AI agent`]
    }));

    const backlog = this.getRawBacklog(project.id);
    const gates = NexusStore.getGateReviews(project.id) || [];
    const testCases = NexusStore.getTestCases(project.id) || [];
    const escalations = NexusStore.getEscalations().filter(item => item.projectId === project.id || !item.projectId);
    const agents = NexusStore.getAgents() || [];
    const requirements = NexusStore.getRequirements(project.id) || [];

    return { project, tasks, backlog, gates, testCases, escalations, agents, requirements };
  },

  buildAchievements(tasks, modules, gates) {
    const dynamic = [
      ...tasks.filter(task => task.status === 'done').slice(0, 2).map(task => `${this.titleCase(task.module)} deliverable completed: ${task.title}`),
      ...modules.filter(module => module.progress >= 60).slice(0, 2).map(module => `${this.titleCase(module.name)} module reached ${module.progress}% completion`),
      ...gates.filter(gate => gate.status === 'PASS').slice(0, 1).map(gate => `Quality gate ${gate.gate_id} passed with strong coverage checks`)
    ];

    return [...dynamic, ...this.defaultAchievements].slice(0, 4);
  },

  buildChallenges(tasks, escalations, modules) {
    const dynamic = [
      ...tasks.filter(task => task.status === 'blocked').slice(0, 2).map(task => `Blocked work in ${this.titleCase(task.module)}: ${task.title}`),
      ...escalations.filter(item => item.status === 'PENDING').slice(0, 2).map(item => item.reasoning || item.ceiling_violated || 'Pending escalation review'),
      ...modules.filter(module => module.progress < 40).slice(0, 1).map(module => `${this.titleCase(module.name)} module needs acceleration to stay on critical path`)
    ];

    return [...dynamic, ...this.defaultChallenges].slice(0, 4);
  },

  buildSnapshot(projectId) {
    const { project, tasks, backlog, gates, testCases, escalations, agents, requirements } = this.collectProjectContext(projectId);

    const completed = tasks.filter(task => task.status === 'done').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const pending = tasks.filter(task => task.status === 'todo' || task.status === 'blocked').length;
    const modules = this.buildModules(tasks, project.modules);
    const devAgents = agents.filter(agent => ['developer', 'module_architect', 'chief_architect'].includes(agent.role));
    const developerAgents = agents.filter(agent => agent.role === 'developer');
    const achievements = this.buildAchievements(tasks, modules, gates);
    const challenges = this.buildChallenges(tasks, escalations, modules);
    const forwardPlan = [
      ...tasks.filter(task => task.status === 'in-progress').slice(0, 2).map(task => `Advance ${task.title}`),
      ...modules.filter(module => module.pending > 0).slice(0, 2).map(module => `Start pending work in ${this.titleCase(module.name)}`),
      'Prioritize critical-path execution reviews with active developer agents'
    ].slice(0, 4);
    const recommendations = [
      'Keep active modules moving through code review without expanding scope',
      'Increase regression and integration checks on partially complete modules',
      'Resolve dependency-driven blockers before promoting new deliverables',
      'Use gate feedback to focus execution on high-risk stories'
    ];

    const assignedDeliverables = tasks.map(task => ({
      id: task.task_id,
      title: task.title,
      module: task.module,
      assignee: typeof task.assignedTo === 'string' && task.assignedTo.startsWith('agent_')
        ? (NexusStore.getAgent(task.assignedTo)?.agent_name || task.assignedTo)
        : task.assignedTo,
      status: this.displayStatus(task.status),
      rawStatus: this.displayStatus(task.status),
      progress: task.status === 'done' ? 100 : task.status === 'in-progress' ? 65 : task.status === 'blocked' ? 42 : 18,
      risk: task.risk,
      storyRef: task.storyRef
    }));

    const milestoneData = modules.map(module => ({
      name: `${this.titleCase(module.name)} module`,
      progress: module.progress,
      status: module.status,
      impact: module.inProgress > 0 ? 'Active implementation underway' : module.pending > 0 ? 'Queued behind current sprint work' : 'Delivered into execution stream'
    }));

    const delayReasons = [
      ...tasks.filter(task => task.status === 'blocked').map(task => `Delay in ${this.titleCase(task.module)} due to ${task.title.toLowerCase()}`),
      ...escalations.filter(item => item.status === 'PENDING').map(item => item.reasoning || item.context || 'Pending escalation review'),
      'External dependency sequencing on shared platform services',
      'Resource ramp-up across concurrent module workstreams'
    ].slice(0, 4);

    const mitigationActions = [
      ...tasks.filter(task => task.status === 'blocked').map(task => task.logs?.[task.logs.length - 1]).filter(Boolean),
      ...escalations.filter(item => item.resolution?.notes).map(item => item.resolution.notes),
      'Redistribute agent attention toward blocked and high-risk modules',
      'Tighten daily sync around integration and test gate readiness'
    ].slice(0, 4);

    const defectDensity = Number((Math.random() * 0.5 + 0.5).toFixed(2));
    const testCoverage = gates.length
      ? Math.max(60, Math.round(gates.reduce((sum, gate) => sum + (gate.checks?.test_coverage || 0), 0) / gates.length))
      : Math.floor(Math.random() * 30 + 60);
    const automationCoverage = testCases.length
      ? Math.max(58, Math.round((testCases.filter(test => ['Unit', 'Integration'].includes(test.type)).length / testCases.length) * 100))
      : Math.floor(Math.random() * 20 + 65);
    const failedTests = testCases.filter(test => ['FAIL', 'FAILED'].includes(String(test.status || '').toUpperCase())).length;

    const qualityRisks = [
      ...modules.filter(module => module.progress < 45).map(module => `${this.titleCase(module.name)} remains regression-heavy while implementation is partial`),
      ...(failedTests ? [`${failedTests} failing tests still influence release confidence`] : []),
      'Cross-module dependency checks required before closing current sprint work',
      'QA checkpoints needed before finalizing active in-progress deliverables'
    ].slice(0, 4);

    const improvementActions = [
      'Expand automation on modules still below stable completion levels',
      'Run focused regression checks before closing active implementation stories',
      'Increase review rigor on integration-touching pull requests',
      'Align developer and QA agents around failing or blocked work'
    ];

    const riskItems = [
      ...tasks.filter(task => task.status === 'blocked').map(task => ({
        title: task.title,
        impact: task.risk || 'HIGH',
        probability: 'High',
        mitigation: task.logs?.[task.logs.length - 1] || 'Execution follow-up required'
      })),
      ...escalations.slice(0, 2).map(item => ({
        title: item.ceiling_violated || 'Escalated development dependency',
        impact: 'High',
        probability: item.status === 'PENDING' ? 'High' : 'Medium',
        mitigation: item.reasoning || item.context || 'Pending review'
      }))
    ];

    const activeIssues = [
      ...tasks.filter(task => ['blocked', 'in-progress'].includes(task.status)).slice(0, 4).map(task => ({
        id: task.task_id,
        title: task.title,
        module: task.module,
        owner: typeof task.assignedTo === 'string' && task.assignedTo.startsWith('agent_')
          ? (NexusStore.getAgent(task.assignedTo)?.agent_name || task.assignedTo)
          : task.assignedTo,
        status: this.displayStatus(task.status)
      })),
      ...escalations.slice(0, 2).map(item => ({
        id: item.escalation_id,
        title: item.ceiling_violated || 'Escalation requiring dev response',
        module: item.context?.toLowerCase().includes('auth') ? 'auth' : 'core',
        owner: item.raised_by_name || 'Developer Agent',
        status: this.displayStatus(item.status)
      }))
    ].slice(0, 5);

    const definedScope = backlog.length
      ? backlog.filter(item => ['FEATURE', 'USER_STORY'].includes(item.type)).slice(0, 8).map(item => ({
          id: item.id,
          title: item.title,
          module: item.module || 'core',
          status: this.displayStatus(item.status || 'PENDING')
        }))
      : assignedDeliverables.slice(0, 6).map(item => ({
          id: item.id,
          title: item.title,
          module: item.module,
          status: item.rawStatus
        }));

    const scopeChanges = backlog.length
      ? backlog.filter(item => ['IN_PROGRESS', 'SPECIFIED'].includes(String(item.status || '').toUpperCase())).slice(0, 4).map(item => ({
          id: item.id,
          title: item.title,
          module: item.module || 'core',
          impact: item.priority?.replace(/_/g, ' ') || 'Medium',
          status: this.displayStatus(item.status || 'PENDING')
        }))
      : [
          { id: 'SC-DEV-01', title: 'Auth token rotation expanded for stability', module: 'auth', impact: 'High', status: 'IN_PROGRESS' },
          { id: 'SC-DEV-02', title: 'Reporting aggregation optimization added to sprint', module: 'reports', impact: 'Medium', status: 'PENDING' }
        ];

    const changeRequests = requirements.length
      ? requirements.slice(0, 6).map(item => ({
          id: item.id,
          title: item.text,
          module: item.module || 'core',
          impact: item.priority || 'MUST_HAVE',
          status: 'OPEN'
        }))
      : [
          { id: 'CR-DEV-01', title: 'Expand dashboard analytics delivery scope', module: 'dashboard', impact: 'SHOULD_HAVE', status: 'OPEN' },
          { id: 'CR-DEV-02', title: 'Stabilize third-party payment retry logic', module: 'payments', impact: 'MUST_HAVE', status: 'OPEN' }
        ];

    return {
      meta: {
        projectId: project.id,
        projectName: project.name,
        projectStatus: project.status,
        domain: project.domain,
        techStack: project.techStack || ['Node.js', 'React', 'PostgreSQL'],
        audience: 'Developer agents, module leads, and execution reviewers',
        purpose: 'Execution-focused development visibility across deliverables, blockers, and quality signals'
      },
      overview: {
        deliverables: {
          completed: completed || 1,
          inProgress: inProgress || 2,
          pending: pending || 1
        },
        modules,
        keyAchievements: achievements,
        challenges,
        forwardPlan,
        recommendations
      },
      scope: {
        definedScope,
        scopeChanges,
        changeRequests
      },
      deliverables: {
        assignedDeliverables,
        moduleBreakdown: modules
      },
      schedule: {
        milestones: milestoneData,
        delays: tasks.filter(task => task.status === 'blocked').map(task => ({
          title: task.title,
          module: task.module,
          status: this.displayStatus(task.status)
        })),
        delayReasons,
        mitigationActions,
        progress: Math.max(25, Math.round((completed / Math.max(tasks.length, 1)) * 100))
      },
      quality: {
        defectDensity,
        defectLeakage: Math.max(8, Math.min(28, failedTests * 5 || 11)),
        testCoverage,
        automationCoverage,
        qualityRisks,
        improvementActions
      },
      resources: {
        teamSize: developerAgents.length || devAgents.length || 3,
        utilization: Math.max(62, Math.min(94, 58 + inProgress * 11 + pending * 4)),
        skillUpdates: [
          `Active stack: ${(project.techStack || ['Node.js', 'React', 'PostgreSQL']).join(', ')}`,
          `${developerAgents.length || devAgents.length || 3} developer-focused agents currently contributing`,
          modules.some(module => module.blocked > 0) ? 'Dependency and integration coordination required on active modules' : 'Current developer skills aligned with execution priorities'
        ],
        trainingImpact: modules.some(module => module.blocked > 0)
          ? 'Targeted ramp-up needed for blocked integration paths'
          : 'Skill coverage is supporting current execution velocity'
      },
      risks: {
        developmentRisks: riskItems.length ? riskItems : [
          { title: 'Vendor dependency affecting payments flow', impact: 'High', probability: 'Medium', mitigation: 'Stabilize integration contract before next merge window' }
        ],
        activeIssues,
        stakeholderConcerns: [
          modules.some(module => module.pending > 0) ? 'Tight deadlines across partially complete modules' : 'Execution timeline stable for active module set',
          scopeChanges.length ? 'Scope pressure impacting development sequencing' : 'Scope remains stable for current development cycle',
          failedTests ? 'Testing and regression pressure on active code paths' : 'Quality signal remains manageable across active work'
        ]
      },
      summary: {
        keyAchievements: achievements,
        challenges,
        forwardPlan,
        recommendations
      }
    };
  },

  persistData(projectId) {
    const snapshot = this.buildSnapshot(projectId || this.getSelectedProjectId());
    if (!snapshot?.meta?.projectId) return null;
    NexusStore.setActiveProject(snapshot.meta.projectId);
    localStorage.setItem('devData', JSON.stringify(snapshot));
    localStorage.setItem('devDataProjectId', snapshot.meta.projectId);
    return snapshot;
  },

  ensureDevData() {
    const projectId = this.getSelectedProjectId();
    return this.persistData(projectId);
  },

  updateRandomTaskStatus() {
    const projectId = this.getSelectedProjectId();
    const currentTasks = this.ensureTasks(this.getRawTasks(projectId)).map(task => ({ ...task }));
    if (!currentTasks.length) return;

    const mutable = currentTasks.filter(task => this.normalizeStatus(task.status) !== 'done');
    const target = mutable[Math.floor(Math.random() * mutable.length)] || currentTasks[0];
    const statusFlow = { todo: 'in-progress', 'in-progress': 'done', blocked: 'in-progress', done: 'done' };
    const nextStatus = statusFlow[this.normalizeStatus(target.status)] || 'in-progress';
    target.status = nextStatus;
    target.logs = [...(target.logs || []), `AI execution update: ${this.titleCase(target.module)} moved to ${nextStatus}`];

    localStorage.setItem(`nexus_tasks_${projectId}`, JSON.stringify(currentTasks));
    this.persistData(projectId);
  },

  async loadMeta() {
    const data = this.ensureDevData();
    await new Promise(resolve => setTimeout(resolve, 90));
    return data?.meta || {
      projectId: 'proj_sim_001',
      projectName: 'AI Commerce Workspace',
      projectStatus: 'ACTIVE',
      domain: 'AI Platforms',
      techStack: ['Node.js', 'React', 'PostgreSQL'],
      audience: 'Developer agents, module leads, and execution reviewers',
      purpose: 'Execution-focused development visibility across deliverables, blockers, and quality signals'
    };
  },

  async loadSection(section) {
    const data = this.ensureDevData();
    await new Promise(resolve => setTimeout(resolve, 180));
    return data?.[section] || data?.overview || null;
  }
};
