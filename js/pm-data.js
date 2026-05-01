// ═══════════════════════════════════════════════════════════════
// NEXUS PM Data — Product Manager Portfolio & Dashboard Mock Data
// ═══════════════════════════════════════════════════════════════

const PMData = {
  projects: [
    {
      id: 'pm_proj_001',
      name: 'FinTech Payment Gateway',
      phase: 'execution',
      status: 'In Progress',
      health: 'yellow',
      healthScore: 68,
      progress: 62,
      owner: 'Sarah Chen',
      ownerAvatar: '👩‍💼',
      domain: 'Finance',
      startDate: '2026-01-15',
      targetDate: '2026-06-30',
      budget: { allocated: 450000, spent: 285000 },
      team: 12,
      scores: { progress: 62, risk: 35, quality: 78, budget: 63 },
      roadmap: {
        planned: [
          { name: 'Auth Module', planned: 100, actual: 100 },
          { name: 'Payment Core', planned: 80, actual: 65 },
          { name: 'Merchant Portal', planned: 60, actual: 40 },
          { name: 'Analytics', planned: 30, actual: 15 },
          { name: 'Compliance', planned: 20, actual: 10 }
        ]
      },
      sprint: { current: 8, total: 14, velocity: 34, planned: 42, burndown: [42, 38, 35, 30, 28, 24, 18, 14] },
      scopeChanges: [
        { id: 'SC-01', title: 'Add crypto payment support', impact: 'High', status: 'Approved', date: '2026-03-10', effort: '+3 sprints' },
        { id: 'SC-02', title: 'PCI DSS Level 1 compliance', impact: 'Critical', status: 'In Review', date: '2026-04-01', effort: '+2 sprints' },
        { id: 'SC-03', title: 'Mobile SDK', impact: 'Medium', status: 'Deferred', date: '2026-04-15', effort: '+4 sprints' }
      ],
      risks: [
        { id: 'R-01', title: 'Payment processor API deprecation', severity: 'Critical', probability: 'High', status: 'Mitigating', owner: 'Tech Lead', mitigation: 'Building adapter layer for multiple processors' },
        { id: 'R-02', title: 'Compliance deadline pressure', severity: 'High', probability: 'Medium', status: 'Monitoring', owner: 'Sarah Chen', mitigation: 'Parallel compliance workstream started' },
        { id: 'R-03', title: 'Key developer attrition risk', severity: 'Medium', probability: 'Low', status: 'Accepted', owner: 'HR', mitigation: 'Retention bonuses approved' }
      ],
      blockers: [
        { id: 'B-01', title: 'Third-party KYC API integration delayed', severity: 'High', daysPending: 12, owner: 'Backend Team' },
        { id: 'B-02', title: 'Security audit scheduling conflict', severity: 'Medium', daysPending: 5, owner: 'InfoSec' }
      ],
      teamAlignment: 72,
      earlyFeedback: [
        { user: 'Beta Merchant A', sentiment: 'positive', comment: 'Payment flow is smooth, checkout is fast', date: '2026-04-20' },
        { user: 'Beta Merchant B', sentiment: 'neutral', comment: 'Dashboard needs more real-time data', date: '2026-04-18' },
        { user: 'Internal QA', sentiment: 'negative', comment: 'Error handling on failed payments needs work', date: '2026-04-22' }
      ],
      redFlags: [
        { type: 'delay', message: 'Sprint velocity 19% below target', severity: 'warning' },
        { type: 'scope', message: 'Scope expanded by 2 change requests this month', severity: 'warning' },
        { type: 'risk', message: 'Critical risk: API deprecation unresolved', severity: 'critical' }
      ],
      decisions: [
        { id: 'DEC-PM-001', title: 'Adopt microservices for payment core', reason: 'Scalability and independent deployment', impact: 'High', date: '2026-02-01', decidedBy: 'Sarah Chen', status: 'Implemented' },
        { id: 'DEC-PM-002', title: 'Defer mobile SDK to Phase 2', reason: 'Resource constraints and timeline', impact: 'Medium', date: '2026-03-15', decidedBy: 'Sarah Chen', status: 'Active' },
        { id: 'DEC-PM-003', title: 'Add crypto payments to scope', reason: 'Market demand from top 3 enterprise clients', impact: 'High', date: '2026-03-10', decidedBy: 'VP Product', status: 'In Progress' },
        { id: 'DEC-PM-004', title: 'Switch from Stripe to multi-processor', reason: 'Reduce vendor lock-in risk', impact: 'Critical', date: '2026-04-05', decidedBy: 'CTO', status: 'Active' }
      ],
      issues: [
        { id: 'ISS-01', title: 'Payment timeout errors in staging', type: 'Bug', priority: 'Critical', status: 'In Progress', assignee: 'Dev Team', created: '2026-04-20' },
        { id: 'ISS-02', title: 'Merchant onboarding flow UX issues', type: 'Improvement', priority: 'High', status: 'Open', assignee: 'Design Team', created: '2026-04-18' },
        { id: 'ISS-03', title: 'Compliance documentation gaps', type: 'Risk', priority: 'High', status: 'In Progress', assignee: 'Compliance', created: '2026-04-10' }
      ],
      governance: {
        approvals: [
          { title: 'Budget increase for crypto module', status: 'Pending', requester: 'Sarah Chen', approver: 'VP Engineering', date: '2026-04-25', ceiling: 'VP Level' },
          { title: 'Third-party vendor contract', status: 'Approved', requester: 'Procurement', approver: 'CFO', date: '2026-04-15', ceiling: 'C-Suite' }
        ],
        auditLog: [
          { action: 'Scope Change Approved', actor: 'VP Product', timestamp: '2026-04-25T10:30:00Z', detail: 'SC-01: Crypto payment support added' },
          { action: 'Risk Escalated', actor: 'Sarah Chen', timestamp: '2026-04-22T14:15:00Z', detail: 'R-01 escalated to CTO' },
          { action: 'Budget Reviewed', actor: 'Finance', timestamp: '2026-04-20T09:00:00Z', detail: 'Q2 spend at 63% of allocation' },
          { action: 'Decision Recorded', actor: 'CTO', timestamp: '2026-04-05T11:00:00Z', detail: 'DEC-PM-004: Multi-processor strategy' },
          { action: 'Sprint Review', actor: 'Sarah Chen', timestamp: '2026-04-01T16:00:00Z', detail: 'Sprint 7 completed, velocity: 36' }
        ],
        ceilings: [
          { level: 'PM', canDecide: ['Sprint priorities', 'Task assignments', 'Minor scope tweaks'], limit: '$10,000' },
          { level: 'VP', canDecide: ['Feature additions', 'Team changes', 'Vendor selection'], limit: '$100,000' },
          { level: 'C-Suite', canDecide: ['Strategic pivots', 'Major budget changes', 'Partnership decisions'], limit: 'Unlimited' }
        ]
      },
      costTimeQuality: { cost: 65, time: 55, quality: 80 }
    },
    {
      id: 'pm_proj_002',
      name: 'AI Customer Support Bot',
      phase: 'idea',
      status: 'Idea',
      health: 'green',
      healthScore: 85,
      progress: 15,
      owner: 'Sarah Chen',
      ownerAvatar: '👩‍💼',
      domain: 'AI/ML',
      startDate: '2026-04-01',
      targetDate: '2026-12-31',
      budget: { allocated: 320000, spent: 28000 },
      team: 4,
      scores: { progress: 15, risk: 10, quality: 90, budget: 91 },
      problemClarity: {
        statement: 'Customer support costs are growing 40% YoY while satisfaction scores decline. Current ticket resolution takes avg 4.2 hours.',
        validated: true,
        score: 88
      },
      personas: [
        { name: 'Enterprise Admin', painPoints: ['Slow ticket resolution', 'Repetitive L1 queries', 'No self-service'], priority: 'Primary' },
        { name: 'End Customer', painPoints: ['Long wait times', 'Inconsistent answers', 'No 24/7 support'], priority: 'Primary' },
        { name: 'Support Agent', painPoints: ['Burnout from repetitive tasks', 'Lack of context', 'Tool switching'], priority: 'Secondary' }
      ],
      marketValidation: { score: 78, competitors: 12, tam: '$4.2B', growth: '23% CAGR', differentiator: 'Enterprise-grade governance + multi-tenant isolation' },
      competitors: [
        { name: 'Zendesk AI', strength: 'Market leader', weakness: 'Expensive, limited customization', threat: 'High' },
        { name: 'Intercom Fin', strength: 'Great UX', weakness: 'Not enterprise-ready', threat: 'Medium' },
        { name: 'Freshdesk Freddy', strength: 'Affordable', weakness: 'Limited AI capabilities', threat: 'Low' }
      ],
      mvpScope: {
        mvp: ['Intent classification', 'Auto-response for top 50 queries', 'Human handoff', 'Basic analytics'],
        future: ['Multi-language', 'Voice support', 'Predictive escalation', 'Custom training', 'Sentiment analysis']
      },
      feasibility: { time: 72, cost: 80, tech: 85 },
      decisionGate: null,
      decisions: [
        { id: 'DEC-PM-010', title: 'Use RAG-based architecture', reason: 'Better accuracy with domain-specific knowledge', impact: 'High', date: '2026-04-10', decidedBy: 'Sarah Chen', status: 'Active' }
      ],
      issues: [],
      governance: {
        approvals: [
          { title: 'Initial budget allocation', status: 'Approved', requester: 'Sarah Chen', approver: 'VP Product', date: '2026-03-28', ceiling: 'VP Level' }
        ],
        auditLog: [
          { action: 'Project Proposed', actor: 'Sarah Chen', timestamp: '2026-03-25T10:00:00Z', detail: 'AI Support Bot concept submitted' },
          { action: 'Budget Approved', actor: 'VP Product', timestamp: '2026-03-28T14:00:00Z', detail: '$320K allocated for exploration' },
          { action: 'Research Phase Started', actor: 'Sarah Chen', timestamp: '2026-04-01T09:00:00Z', detail: 'Market analysis initiated' }
        ],
        ceilings: [
          { level: 'PM', canDecide: ['Research direction', 'Prototype scope', 'Vendor evaluation'], limit: '$5,000' },
          { level: 'VP', canDecide: ['Go/No-Go decision', 'Budget approval', 'Team allocation'], limit: '$100,000' },
          { level: 'C-Suite', canDecide: ['Strategic alignment', 'Major investment'], limit: 'Unlimited' }
        ]
      },
      costTimeQuality: { cost: 80, time: 72, quality: 85 }
    },
    {
      id: 'pm_proj_003',
      name: 'E-Commerce Platform v2',
      phase: 'post-launch',
      status: 'Live',
      health: 'green',
      healthScore: 82,
      progress: 100,
      owner: 'Sarah Chen',
      ownerAvatar: '👩‍💼',
      domain: 'E-Commerce',
      startDate: '2025-06-01',
      targetDate: '2026-02-28',
      launchDate: '2026-03-01',
      budget: { allocated: 580000, spent: 542000 },
      team: 8,
      scores: { progress: 100, risk: 15, quality: 85, budget: 93 },
      usageMetrics: { dau: 12400, mau: 89000, dauGrowth: 8.2, mauGrowth: 12.5 },
      retention: { day1: 72, day7: 58, day30: 41, churnRate: 4.2 },
      conversionFunnel: [
        { stage: 'Visitors', count: 245000, pct: 100 },
        { stage: 'Sign Ups', count: 42000, pct: 17.1 },
        { stage: 'First Purchase', count: 18500, pct: 7.6 },
        { stage: 'Repeat Purchase', count: 8200, pct: 3.3 },
        { stage: 'Premium Upgrade', count: 2100, pct: 0.86 }
      ],
      revenue: { mrr: 128000, arr: 1536000, growth: 15.3, ltv: 342 },
      userFeedback: {
        nps: 42,
        csat: 4.1,
        topPraise: ['Fast checkout', 'Clean UI', 'Reliable payments'],
        topComplaints: ['Search could be better', 'Mobile app slow', 'Need more payment options']
      },
      bugs: [
        { id: 'BUG-301', title: 'Search results inconsistent for special characters', severity: 'Medium', status: 'In Progress' },
        { id: 'BUG-302', title: 'Cart persistence issue on Safari', severity: 'High', status: 'Fixed' },
        { id: 'BUG-303', title: 'Notification emails delayed', severity: 'Low', status: 'Open' }
      ],
      improvements: [
        { id: 'IMP-01', title: 'AI-powered search', priority: 'High', status: 'Planned', effort: 'Large' },
        { id: 'IMP-02', title: 'Mobile app performance', priority: 'High', status: 'In Progress', effort: 'Medium' },
        { id: 'IMP-03', title: 'Multi-currency support', priority: 'Medium', status: 'Planned', effort: 'Large' }
      ],
      learnings: {
        worked: ['Microservices architecture scaled well', 'CI/CD pipeline reduced deploy time by 70%', 'Beta testing with real merchants caught critical bugs early'],
        failed: ['Underestimated mobile complexity', 'Initial search implementation was too basic', 'Documentation debt accumulated'],
        nextActions: ['Invest in mobile-first approach for v3', 'Implement AI search in Q3', 'Dedicated technical writer hire']
      },
      decisions: [
        { id: 'DEC-PM-020', title: 'Launch with limited payment options', reason: 'Speed to market priority', impact: 'Medium', date: '2026-02-15', decidedBy: 'Sarah Chen', status: 'Completed' },
        { id: 'DEC-PM-021', title: 'Post-launch focus on mobile perf', reason: 'User feedback and analytics data', impact: 'High', date: '2026-03-15', decidedBy: 'Sarah Chen', status: 'Active' }
      ],
      issues: [
        { id: 'ISS-10', title: 'Search relevance improvement needed', type: 'Enhancement', priority: 'High', status: 'Planned', assignee: 'Search Team', created: '2026-03-20' }
      ],
      governance: {
        approvals: [],
        auditLog: [
          { action: 'Product Launched', actor: 'Sarah Chen', timestamp: '2026-03-01T09:00:00Z', detail: 'E-Commerce Platform v2 went live' },
          { action: 'Post-Launch Review', actor: 'VP Product', timestamp: '2026-03-15T14:00:00Z', detail: '2-week metrics review completed' },
          { action: 'Improvement Roadmap Set', actor: 'Sarah Chen', timestamp: '2026-04-01T10:00:00Z', detail: 'Q2 improvement priorities defined' }
        ],
        ceilings: [
          { level: 'PM', canDecide: ['Bug priorities', 'Minor improvements', 'A/B tests'], limit: '$5,000' },
          { level: 'VP', canDecide: ['Feature investment', 'Team reallocation'], limit: '$100,000' },
          { level: 'C-Suite', canDecide: ['Product direction', 'Major investment'], limit: 'Unlimited' }
        ]
      },
      costTimeQuality: { cost: 93, time: 95, quality: 85 }
    },
    {
      id: 'pm_proj_004',
      name: 'Internal HR Portal',
      phase: 'execution',
      status: 'In Progress',
      health: 'red',
      healthScore: 42,
      progress: 35,
      owner: 'Sarah Chen',
      ownerAvatar: '👩‍💼',
      domain: 'Enterprise',
      startDate: '2026-02-01',
      targetDate: '2026-07-31',
      budget: { allocated: 200000, spent: 152000 },
      team: 6,
      scores: { progress: 35, risk: 72, quality: 55, budget: 24 },
      roadmap: {
        planned: [
          { name: 'Employee Directory', planned: 100, actual: 90 },
          { name: 'Leave Management', planned: 70, actual: 35 },
          { name: 'Payroll Integration', planned: 40, actual: 10 },
          { name: 'Performance Reviews', planned: 20, actual: 5 }
        ]
      },
      sprint: { current: 5, total: 12, velocity: 18, planned: 32, burndown: [32, 30, 28, 26, 22] },
      scopeChanges: [
        { id: 'SC-10', title: 'Add HRIS integration', impact: 'Critical', status: 'Approved', date: '2026-03-20', effort: '+4 sprints' }
      ],
      risks: [
        { id: 'R-10', title: 'Budget overrun — 76% spent at 35% progress', severity: 'Critical', probability: 'High', status: 'Escalated', owner: 'Sarah Chen', mitigation: 'Emergency budget review requested' },
        { id: 'R-11', title: 'Team velocity significantly below target', severity: 'High', probability: 'High', status: 'Mitigating', owner: 'Scrum Master', mitigation: 'Added 2 contractors' }
      ],
      blockers: [
        { id: 'B-10', title: 'Payroll vendor API access not granted', severity: 'Critical', daysPending: 28, owner: 'Vendor Relations' },
        { id: 'B-11', title: 'Data migration tool incompatible', severity: 'High', daysPending: 14, owner: 'Dev Team' }
      ],
      teamAlignment: 45,
      earlyFeedback: [
        { user: 'HR Director', sentiment: 'negative', comment: 'Too slow, missing key features', date: '2026-04-15' }
      ],
      redFlags: [
        { type: 'budget', message: 'Budget at 76% with only 35% progress', severity: 'critical' },
        { type: 'delay', message: 'Velocity 44% below target', severity: 'critical' },
        { type: 'risk', message: '2 critical risks unresolved', severity: 'critical' },
        { type: 'blocker', message: 'Blocker pending 28 days', severity: 'critical' }
      ],
      decisions: [
        { id: 'DEC-PM-030', title: 'Reduce scope to core HR features', reason: 'Budget and timeline constraints', impact: 'High', date: '2026-04-20', decidedBy: 'VP Product', status: 'Pending Approval' }
      ],
      issues: [
        { id: 'ISS-20', title: 'Architecture not scalable for multi-tenant', type: 'Technical Debt', priority: 'Critical', status: 'Open', assignee: 'Tech Lead', created: '2026-04-10' }
      ],
      governance: {
        approvals: [
          { title: 'Emergency budget increase', status: 'Pending', requester: 'Sarah Chen', approver: 'CFO', date: '2026-04-25', ceiling: 'C-Suite' }
        ],
        auditLog: [
          { action: 'Risk Escalated to C-Suite', actor: 'Sarah Chen', timestamp: '2026-04-25T10:00:00Z', detail: 'Budget overrun risk flagged' },
          { action: 'Scope Reduction Proposed', actor: 'VP Product', timestamp: '2026-04-20T14:00:00Z', detail: 'DEC-PM-030 under review' }
        ],
        ceilings: [
          { level: 'PM', canDecide: ['Task reprioritization', 'Minor scope adjustments'], limit: '$5,000' },
          { level: 'VP', canDecide: ['Scope reduction', 'Team changes'], limit: '$50,000' },
          { level: 'C-Suite', canDecide: ['Project continuation/kill', 'Major budget changes'], limit: 'Unlimited' }
        ]
      },
      costTimeQuality: { cost: 24, time: 35, quality: 55 }
    }
  ],

  getProject(id) {
    return this.projects.find(p => p.id === id);
  },

  getProjectsByPhase(phase) {
    return this.projects.filter(p => p.phase === phase);
  },

  getHealthColor(health) {
    return { green: '#10b981', yellow: '#f59e0b', red: '#ef4444' }[health] || '#6b7280';
  },

  getPhaseLabel(phase) {
    return { idea: 'Idea / Planning', execution: 'Execution', 'post-launch': 'Post-Launch' }[phase] || phase;
  },

  getPhaseIcon(phase) {
    return { idea: '🟣', execution: '🟡', 'post-launch': '🟢' }[phase] || '⚪';
  },

  getPhaseColor(phase) {
    return { idea: '#a855f7', execution: '#f59e0b', 'post-launch': '#10b981' }[phase] || '#6b7280';
  },

  getStatusIcon(status) {
    return { 'Idea': '💡', 'In Progress': '🔄', 'Live': '🚀' }[status] || '📋';
  },

  calculateHealthScore(scores) {
    return Math.round((scores.progress * 0.3 + (100 - scores.risk) * 0.3 + scores.quality * 0.2 + scores.budget * 0.2));
  }
};

PMData.sectionKeys = ['overview', 'scope', 'schedule', 'cost', 'quality', 'resources', 'risks', 'governance', 'summary'];

PMData.getDefaultProject = function() {
  return this.projects.find(project => project.phase === 'execution') || this.projects[0] || null;
};

PMData.getSelectedProjectId = function() {
  const existing = sessionStorage.getItem('pm_selected_project');
  if (existing && this.getProject(existing)) return existing;
  const fallback = this.getDefaultProject();
  if (!fallback) return null;
  sessionStorage.setItem('pm_selected_project', fallback.id);
  return fallback.id;
};

PMData.getSelectedProject = function() {
  const projectId = this.getSelectedProjectId();
  return projectId ? this.getProject(projectId) : null;
};

PMData.getReportingPeriod = function(project) {
  return `${project.startDate} to ${project.targetDate || 'Ongoing'}`;
};

PMData.getHealthLabel = function(score) {
  if (score >= 70) return 'Green';
  if (score >= 50) return 'Yellow';
  return 'Red';
};

PMData.delaySeverity = function(delta) {
  if (delta >= 15) return 'HIGH';
  if (delta >= 5) return 'MEDIUM';
  return 'LOW';
};

PMData.buildSectionSnapshot = function(project) {
  const budgetAllocated = project.budget?.allocated || 0;
  const budgetSpent = project.budget?.spent || 0;
  const budgetPct = budgetAllocated ? Math.round((budgetSpent / budgetAllocated) * 100) : 0;
  const remainingBudget = Math.max(budgetAllocated - budgetSpent, 0);
  const schedulePerformance = project.sprint?.planned
    ? Number((project.sprint.velocity / project.sprint.planned).toFixed(2))
    : Number((project.progress / 100).toFixed(2));
  const costPerformance = budgetSpent ? Number((budgetAllocated / Math.max(budgetSpent, 1)).toFixed(2)) : 1;
  const stakeholderHealth = project.teamAlignment || Math.max(55, project.healthScore - 10);
  const roadmapMilestones = (project.roadmap?.planned || []).map(item => {
    const variance = item.actual - item.planned;
    return {
      name: item.name,
      planned: item.planned,
      actual: item.actual,
      variance,
      status: variance >= 0 ? 'ON_TRACK' : variance > -15 ? 'AT_RISK' : 'DELAYED'
    };
  });
  const delayReasons = [
    ...(project.blockers || []).map(blocker => blocker.title),
    ...(project.redFlags || []).filter(flag => flag.type === 'delay').map(flag => flag.message)
  ].slice(0, 4);
  const mitigationActions = [
    ...(project.risks || []).map(risk => risk.mitigation),
    ...(project.learnings?.nextActions || [])
  ].slice(0, 4);
  const achievements = [
    ...(roadmapMilestones.filter(item => item.actual >= item.planned).map(item => `${item.name} delivered at ${item.actual}% against ${item.planned}% plan`)),
    ...(project.decisions || []).filter(decision => decision.status === 'Implemented' || decision.status === 'Completed').map(decision => decision.title),
    ...(project.learnings?.worked || [])
  ].slice(0, 5);
  const challenges = [
    ...(project.redFlags || []).map(flag => flag.message),
    ...(project.blockers || []).map(blocker => blocker.title),
    ...(project.userFeedback?.topComplaints || []),
    ...(project.earlyFeedback || []).filter(item => item.sentiment === 'negative').map(item => item.comment)
  ].slice(0, 5);
  const scopeItems = project.mvpScope?.mvp || roadmapMilestones.map(item => item.name);
  const futureScope = project.mvpScope?.future || (project.improvements || []).map(item => item.title);
  const changeRequests = (project.scopeChanges || []).map(change => ({
    id: change.id,
    title: change.title,
    status: change.status,
    impact: change.impact,
    requestedOn: change.date,
    effort: change.effort
  }));
  const costDrivers = [
    `Team staffing footprint: ${project.team} contributors`,
    project.scopeChanges?.length ? `${project.scopeChanges.length} scope adjustments influencing delivery cost` : 'No major scope expansion recorded',
    project.risks?.find(risk => risk.severity === 'Critical')?.title || 'No critical cost driver escalation',
    project.phase === 'post-launch' ? 'Post-launch optimization and platform hardening' : 'Execution delivery and integration workload'
  ];
  const qualityRisks = [
    ...(project.risks || []).filter(risk => /compliance|quality|defect|audit/i.test(`${risk.title} ${risk.mitigation}`)).map(risk => risk.title),
    ...(project.userFeedback?.topComplaints || []),
    ...(project.earlyFeedback || []).filter(item => item.sentiment !== 'positive').map(item => item.comment)
  ].slice(0, 4);
  const qualityImprovementActions = [
    ...(project.learnings?.nextActions || []),
    ...(project.risks || []).map(risk => risk.mitigation)
  ].slice(0, 4);
  const governanceFeedback = [
    ...(project.earlyFeedback || []).map(item => `${item.user}: ${item.comment}`),
    ...(project.userFeedback?.topPraise || []).map(item => `Positive signal: ${item}`)
  ].slice(0, 4);
  const activeIssues = (project.issues || []).map(issue => ({
    id: issue.id,
    title: issue.title,
    priority: issue.priority,
    status: issue.status,
    owner: issue.assignee
  }));
  const statusTracking = (project.risks || []).map(risk => ({
    title: risk.title,
    owner: risk.owner,
    status: risk.status,
    severity: risk.severity
  }));
  const meta = {
    projectId: project.id,
    projectName: project.name,
    manager: project.owner,
    phase: project.phase,
    status: project.status,
    audience: 'Product leadership, delivery leads, governance reviewers',
    purpose: 'Decision-focused execution visibility for AgentOS role-based supervision',
    reportingPeriod: this.getReportingPeriod(project)
  };

  return {
    meta,
    overview: {
      projectDetails: {
        name: project.name,
        manager: project.owner,
        reportingPeriod: meta.reportingPeriod,
        audience: meta.audience,
        purpose: meta.purpose
      },
      overallHealth: {
        status: this.getHealthLabel(project.healthScore),
        healthScore: project.healthScore,
        cost: project.costTimeQuality?.cost || project.scores?.budget || 0,
        time: project.costTimeQuality?.time || project.scores?.progress || 0,
        quality: project.costTimeQuality?.quality || project.scores?.quality || 0,
        riskLevel: (project.risks || []).some(risk => risk.severity === 'Critical') ? 'High' : (project.risks || []).some(risk => risk.severity === 'High') ? 'Medium' : 'Low',
        stakeholderAlignment: stakeholderHealth,
        summary: `${project.name} is currently ${project.status.toLowerCase()} with ${project.progress}% progress and ${budgetPct}% budget utilization.`
      },
      achievements,
      challenges,
      conclusion: project.phase === 'post-launch'
        ? 'The project is in a stable post-launch state with a clear optimization backlog and positive usage indicators.'
        : project.healthScore >= 70
          ? 'The project is healthy overall and can continue with focused attention on current execution risks.'
          : 'The project requires active governance attention to stabilize delivery, cost, or risk exposure.'
    },
    scope: {
      definedScope: scopeItems,
      scopeChanges: changeRequests,
      changeRequests: changeRequests.length ? changeRequests : futureScope.slice(0, 3).map((title, index) => ({
        id: `CR-${index + 1}`,
        title,
        status: 'PROPOSED',
        impact: 'Medium',
        requestedOn: project.targetDate,
        effort: 'TBD'
      }))
    },
    schedule: {
      milestones: roadmapMilestones,
      delays: roadmapMilestones.filter(item => item.variance < 0).map(item => ({
        name: item.name,
        variance: Math.abs(item.variance),
        severity: this.delaySeverity(Math.abs(item.variance))
      })),
      onTimeDelivery: Math.max(0, Math.min(100, Math.round(project.progress * 0.9))),
      spi: schedulePerformance,
      delayReasons: delayReasons.length ? delayReasons : ['No major delay drivers recorded'],
      mitigationActions: mitigationActions.length ? mitigationActions : ['Maintain weekly execution review cadence']
    },
    cost: {
      budget: budgetAllocated,
      actualSpend: budgetSpent,
      forecast: Math.round(budgetSpent + remainingBudget * (project.healthScore < 60 ? 1.15 : 0.85)),
      costVariance: budgetAllocated - budgetSpent,
      cpi: Number(costPerformance.toFixed(2)),
      costDrivers
    },
    quality: {
      defectDensity: Number(((project.issues?.length || project.bugs?.length || 1) / Math.max(project.team, 1)).toFixed(2)),
      defectLeakage: Math.max(4, Math.round(100 - (project.scores?.quality || project.costTimeQuality?.quality || 75) * 0.6)),
      testCoverage: Math.min(98, Math.max(45, project.costTimeQuality?.quality || project.scores?.quality || 75)),
      automationCoverage: Math.min(95, Math.max(35, (project.scores?.quality || 70) - 8)),
      qualityTrends: [
        { label: 'Quality Score', value: project.scores?.quality || project.costTimeQuality?.quality || 0, status: (project.scores?.quality || 0) >= 75 ? 'POSITIVE' : 'WATCH' },
        { label: 'Feedback Confidence', value: stakeholderHealth, status: stakeholderHealth >= 70 ? 'POSITIVE' : 'WATCH' },
        { label: 'Release Readiness', value: Math.max(40, project.progress), status: project.progress >= 70 ? 'POSITIVE' : 'WATCH' }
      ],
      risks: qualityRisks.length ? qualityRisks : ['No major quality risks recorded'],
      improvementActions: qualityImprovementActions.length ? qualityImprovementActions : ['Continue regression coverage hardening']
    },
    resources: {
      teamSize: project.team,
      utilization: Math.min(98, Math.max(58, Math.round(project.progress + 25))),
      attrition: project.risks?.some(risk => /attrition/i.test(risk.title)) ? 'Watch' : 'Stable',
      skillUpdates: [
        `Phase coverage aligned to ${this.getPhaseLabel(project.phase)}`,
        project.domain ? `${project.domain} domain context active across team` : 'Domain updates not recorded',
        project.scopeChanges?.length ? 'Team adapting to revised scope priorities' : 'Scope stability supports execution continuity'
      ],
      stability: stakeholderHealth >= 70 ? 'Stable' : stakeholderHealth >= 50 ? 'Moderate' : 'At Risk',
      resourcePlanningActions: [
        ...(project.risks || []).filter(risk => /developer|team|resource|velocity/i.test(`${risk.title} ${risk.mitigation}`)).map(risk => risk.mitigation),
        'Review capacity against milestone commitments'
      ].slice(0, 4)
    },
    risks: {
      identifiedRisks: (project.risks || []).map(risk => ({
        title: risk.title,
        impact: risk.severity,
        probability: risk.probability,
        mitigation: risk.mitigation,
        status: risk.status
      })),
      activeIssues,
      statusTracking
    },
    governance: {
      stakeholderEngagement: stakeholderHealth,
      meetingsReviews: [
        'Weekly PM execution review',
        'Governance checkpoint with delivery leads',
        'Monthly steering review'
      ],
      feedback: governanceFeedback.length ? governanceFeedback : ['No stakeholder feedback logged yet'],
      complianceStatus: project.governance?.approvals?.some(item => item.status === 'Pending') ? 'Attention Needed' : 'On Track',
      auditStatus: project.governance?.auditLog?.length ? 'Audit Trail Available' : 'Audit Trail Pending',
      approvals: project.governance?.approvals || [],
      auditLog: project.governance?.auditLog || []
    },
    summary: {
      forwardPlan: [
        ...(roadmapMilestones.filter(item => item.actual < item.planned).map(item => `Recover ${item.name} variance through focused execution review`)),
        ...(project.improvements || []).slice(0, 2).map(item => `Advance ${item.title}`),
        'Maintain governance visibility on top delivery risks'
      ].slice(0, 4),
      recommendations: [
        project.healthScore < 60 ? 'Escalate corrective actions through governance review' : 'Sustain current execution cadence',
        budgetPct > 75 ? 'Tighten cost tracking on remaining milestones' : 'Continue monitoring spend against forecast',
        (project.risks || []).length ? 'Track mitigation progress for active risks weekly' : 'Preserve risk review discipline'
      ],
      conclusion: project.healthScore >= 70
        ? 'Overall project health supports continued delivery with targeted risk management.'
        : project.healthScore >= 50
          ? 'Project is viable but requires disciplined intervention on schedule, cost, or quality hotspots.'
          : 'Project health is below target and needs immediate governance and execution alignment.'
    }
  };
};

PMData.persistProjectData = function(projectId) {
  const project = this.getProject(projectId) || this.getDefaultProject();
  if (!project) return null;
  sessionStorage.setItem('pm_selected_project', project.id);
  const snapshot = this.buildSectionSnapshot(project);
  localStorage.setItem('pmData', JSON.stringify(snapshot));
  localStorage.setItem('pmDataProjectId', project.id);
  return snapshot;
};

PMData.ensurePMData = function() {
  const project = this.getSelectedProject();
  if (!project) return null;
  const storedProjectId = localStorage.getItem('pmDataProjectId');
  const existing = localStorage.getItem('pmData');
  if (!existing || storedProjectId !== project.id) {
    return this.persistProjectData(project.id);
  }
  try {
    return JSON.parse(existing);
  } catch (error) {
    return this.persistProjectData(project.id);
  }
};

PMData.loadMeta = async function() {
  const data = this.ensurePMData();
  await new Promise(resolve => setTimeout(resolve, 90));
  return data?.meta || null;
};

PMData.loadSection = async function(section) {
  const data = this.ensurePMData();
  await new Promise(resolve => setTimeout(resolve, 180));
  if (!data || !this.sectionKeys.includes(section)) return null;
  return data[section];
};
