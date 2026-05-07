// NEXUS SOW setup generator — demo AI analysis for project setup
const SowSetupGenerator = {
  formatFileSize(bytes = 0) {
    if (!bytes) return '0 KB';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit += 1;
    }
    return `${size >= 10 || unit === 0 ? Math.round(size) : size.toFixed(1)} ${units[unit]}`;
  },

  createFallbackSowInsights(file, projectData = {}) {
    const domain = projectData.domain || 'the selected domain';
    return {
      summary: `AI analyzed the uploaded SOW and identified requirement planning, development, QA, release, and governance needs for ${projectData.name || 'this project'}.`,
      detectedModules: this.detectModules(projectData),
      detectedRisks: ['Requirement ambiguity', 'Timeline dependency', 'QA sign-off dependency'],
      recommendedWorkflows: ['Requirements to Backlog', 'Task Decomposition', 'QA Review', 'Release Approval'],
      sourceFile: file?.name || projectData.sow?.fileName || 'Uploaded SOW',
      domain
    };
  },

  detectModules(projectData = {}) {
    const text = `${projectData.name || ''} ${projectData.description || ''} ${projectData.domain || ''}`.toLowerCase();
    const modules = ['Requirements', 'Backlog', 'Architecture', 'QA', 'Release'];
    if (text.includes('payment') || text.includes('commerce')) modules.push('Payments');
    if (text.includes('health') || text.includes('patient')) modules.push('Patient Experience');
    if (text.includes('analytics') || text.includes('report')) modules.push('Analytics');
    return [...new Set(modules)];
  },

  generateProjectSetupFromSOW(project, assignedUsers = [], sowFile = null) {
    const now = new Date().toISOString();
    const projectData = { ...project, assignedUsers };
    const sowInsights = this.createFallbackSowInsights(sowFile, projectData);
    const generatedOrgStructure = this.generateOrgStructure(assignedUsers, now);
    const generatedWorkflows = this.generateWorkflows(project, now);
    const generatedAgents = generatedOrgStructure.levels.flatMap(level => level.agents)
      .filter(agent => agent.agent_id !== '_human_')
      .map(agent => ({
        agent_id: `sow_${agent.agent_id}`,
        agent_name: agent.name,
        role: agent.role.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''),
        status: 'ACTIVE',
        lifecycle: 'CONFIGURED',
        module_scope: 'global',
        _agentType: 'sow-generated',
        _source: 'SOW'
      }));

    return { sowInsights, generatedOrgStructure, generatedWorkflows, generatedAgents };
  },

  generateOrgStructure(assignments = [], generatedAt = new Date().toISOString()) {
    const hasRole = role => assignments.some(item => item.projectRole === role);
    const governanceAgents = [
      this.agent('pm_agent', 'Product Manager Agent', 'Product & Delivery'),
      this.agent('ba_agent', 'Business Analyst Agent', 'Requirement Analysis'),
      this.agent('delivery_coord_agent', 'Delivery Coordinator Agent', 'Roadmap Coordination')
    ];
    if (hasRole('GOVERNANCE_ADMIN')) governanceAgents.push(this.agent('governance_reviewer', 'Governance Reviewer Agent', 'Governance Review'));
    if (hasRole('EXECUTIVE_STRATEGIC')) governanceAgents.unshift(this.agent('executive_reviewer', 'Executive Reviewer Agent', 'Strategic Oversight'));

    return {
      levels: [
        {
          id: 'level-human-orchestrator',
          label: 'Human Orchestrator',
          name: 'Human Orchestrator',
          purpose: 'Final approval authority and exception handling.',
          agents: [{ agent_id: '_human_', name: 'Human Orchestrator', icon: '👤', role: 'Final Authority', _generatedFromSow: true }]
        },
        {
          id: 'level-product-delivery',
          label: 'Product & Delivery Governance',
          name: 'Product & Delivery Governance',
          purpose: 'Requirement review, backlog approval, roadmap visibility, stage progression.',
          agents: governanceAgents
        },
        {
          id: 'level-architecture-planning',
          label: 'Architecture & Technical Planning',
          name: 'Architecture & Technical Planning',
          purpose: 'Module breakdown, architecture review, technical feasibility, dependency mapping.',
          agents: [
            this.agent('solution_architect', 'Solution Architect Agent', 'Solution Architecture'),
            this.agent('module_architect', 'Module Architect Agent', 'Module Architecture'),
            this.agent('technical_planner', 'Technical Planner Agent', 'Technical Planning')
          ]
        },
        {
          id: 'level-execution-quality',
          label: 'Execution & Quality',
          name: 'Execution & Quality',
          purpose: 'Task generation, implementation tracking, QA validation, defect handling.',
          agents: [
            this.agent('developer_agent', 'Developer Agent', 'Technical Execution'),
            this.agent('qa_agent', 'QA Agent', 'QA / Testing'),
            this.agent('test_planner', 'Test Planner Agent', 'Test Planning')
          ]
        },
        {
          id: 'level-release-operations',
          label: 'Release & Operations',
          name: 'Release & Operations',
          purpose: 'Release readiness, deployment planning, monitoring, rollback readiness.',
          agents: [
            this.agent('release_manager', 'Release Manager Agent', 'Release Management'),
            this.agent('devops_agent', 'DevOps Agent', 'Release / DevOps'),
            this.agent('monitoring_agent', 'Monitoring Agent', 'Operational Monitoring')
          ]
        }
      ],
      updatedAt: generatedAt,
      _aiGenerated: true,
      _generatedFromSow: true,
      _metadata: { generatedAt, source: 'SOW' }
    };
  },

  agent(id, name, role) {
    const icons = { Product: '📋', Business: '📊', Delivery: '🧭', Solution: '🏛️', Module: '🧩', Technical: '🛠️', Developer: '💻', QA: '🧪', Test: '✅', Release: '🚀', DevOps: '⚙️', Monitoring: '📡', Governance: '🛡️', Executive: '📈' };
    const iconKey = Object.keys(icons).find(key => name.includes(key));
    return { agent_id: id, name, icon: icons[iconKey] || '🤖', role, _aiGenerated: true, _generatedFromSow: true };
  },

  generateWorkflows(project, createdAt = new Date().toISOString()) {
    const projectId = project.id || 'new-project';
    const base = [
      ['Requirements to Backlog Workflow', 'Product & Delivery', ['Import SOW requirements', 'Normalize requirement text', 'Identify duplicates', 'Classify functional and non-functional requirements', 'Generate backlog items', 'Product manager approval']],
      ['Task Decomposition Workflow', 'Product & Delivery / Technical Execution', ['Break approved backlog into epics', 'Create user stories', 'Identify modules', 'Estimate effort', 'Assign role owner', 'Send for stage approval']],
      ['Architecture Review Workflow', 'Technical Execution', ['Identify modules', 'Map dependencies', 'Review technical feasibility', 'Flag architecture risks', 'Approve technical plan']],
      ['QA Readiness Workflow', 'QA / Testing', ['Generate test scenarios', 'Map requirements to test cases', 'Identify validation criteria', 'Prepare quality gate checklist']],
      ['Release Readiness Workflow', 'Release / DevOps', ['Validate release scope', 'Check deployment dependencies', 'Confirm QA sign-off', 'Prepare rollout plan', 'Define rollback criteria']],
      ['Stage Progression Approval Workflow', 'Governance / Product & Delivery', ['Review stage summary', 'Validate outputs', 'Check blockers', 'Approve progression', 'Notify next role owner']]
    ];
    const workflows = base.map(([name, category, steps], index) => this.workflow(projectId, name, category, steps, createdAt, index));
    workflows.push(this.workflow(projectId, 'SOW-Based Delivery Workflow', 'Custom', ['Review SOW scope', 'Extract project requirements', 'Generate backlog', 'Prioritize features', 'Decompose tasks', 'Review agent outputs', 'Approve delivery stage progression', 'Track roadmap milestones'], createdAt, 99, true, project.name));
    return workflows;
  },

  workflow(projectId, name, category, steps, createdAt, index, custom = false, projectName = '') {
    return {
      id: `SOW-WF-${projectId}-${index + 1}`,
      name,
      icon: custom ? '✨' : '⚡',
      category,
      desc: custom ? `Custom workflow generated from the uploaded SOW for ${projectName || 'this project'}.` : `${name} generated from uploaded SOW.`,
      trigger: custom ? 'SOW Generated' : 'On Stage Ready',
      steps,
      agents: [],
      status: 'READY',
      _type: custom ? 'custom' : 'template',
      _source: 'SOW Generated',
      _customSowWorkflow: custom,
      projectId,
      executions: 0,
      successRate: 100,
      createdAt,
      lastRun: null
    };
  },

  applyGeneratedSetup(project, assignedUsers = [], sowFile = null) {
    const setup = this.generateProjectSetupFromSOW(project, assignedUsers, sowFile);
    const fileName = sowFile?.name || project.sow?.fileName || project.sow || 'Uploaded SOW';
    const fileSize = sowFile?.size ? this.formatFileSize(sowFile.size) : project.sow?.fileSize || '';
    project.sow = {
      fileName,
      fileSize,
      uploadedAt: project.sow?.uploadedAt || new Date().toISOString(),
      analysisStatus: 'completed',
      generatedFromSow: true
    };
    project.generatedSetup = {
      orgStructureGenerated: true,
      workflowsGenerated: true,
      generatedAt: new Date().toISOString(),
      source: 'SOW'
    };
    project.generatedOrgStructure = setup.generatedOrgStructure;
    project.generatedWorkflows = setup.generatedWorkflows;
    project.generatedAgents = setup.generatedAgents;
    project.sowInsights = setup.sowInsights;
    project.modules = setup.sowInsights.detectedModules;
    NexusStore.saveProject(project);
    NexusStore.setProjectOrgStructure(project.id, setup.generatedOrgStructure);
    NexusStore.setProjectWorkflows(project.id, setup.generatedWorkflows);
    NexusStore.setProjectAgents(project.id, setup.generatedAgents);
    NexusStore.addLog({ type: 'PROJECT', message: `SOW AI setup generated for project ${project.name}`, agent: 'sow_setup_generator' });
    return project;
  }
};
if (typeof window !== 'undefined') window.SowSetupGenerator = SowSetupGenerator;
