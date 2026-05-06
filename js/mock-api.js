// NEXUS Mock API Layer — simulates backend calls with realistic delays
const MockAPI = {
  _delay(ms = 600) {
    return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 400));
  },

  _generateProjectSetup(data, projectId) {
    const domain = data.domain || 'General';
    const workflowBase = domain === 'Healthcare'
      ? ['Requirements to Backlog Pipeline', 'Security Review', 'Release Readiness']
      : ['Requirements to Backlog Pipeline', 'Architecture Review', 'Quality Gate Review'];
    const agentBase = domain === 'Finance' || domain === 'Healthcare'
      ? ['Business Analyst', 'Product Manager', 'Security / DevOps Agent', 'QA Agent']
      : ['Business Analyst', 'Product Manager', 'Module Architect', 'QA Agent'];
    const orgStructure = [
      'Human Orchestrator',
      'Executive & Strategic',
      'Governance & Admin',
      'Product & Delivery',
      'Technical Execution',
      'QA / Testing',
      'Release / DevOps',
      'Workspace / Universal'
    ].join(' > ');

    return {
      orgStructure,
      selectedWorkflows: workflowBase,
      selectedAgents: agentBase,
      orgLevels: [
        { id: 'lvl_1', label: 'Human Orchestrator', agents: [{ agent_id: '_human_', name: 'Human Orchestrator', role: 'Final Authority' }] },
        { id: 'lvl_2', label: 'Strategy & Governance', agents: [{ agent_id: 'agent_pm_001', name: 'Product Manager', role: 'Product & Delivery' }] },
        { id: 'lvl_3', label: 'Execution & Quality', agents: [{ agent_id: 'agent_qa_001', name: 'QA Agent', role: 'QA / Testing' }] }
      ],
      workflows: workflowBase.map((name, index) => ({
        id: `WF-${projectId}-${index + 1}`,
        name,
        trigger: index === 0 ? 'Manual' : 'On Milestone',
        status: 'ACTIVE',
        _templateId: `auto_${index + 1}`
      })),
      agents: agentBase.map((name, index) => ({
        agent_id: `agent_${projectId}_${index + 1}`,
        agent_name: name,
        role: name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''),
        status: 'ACTIVE',
        lifecycle: 'CONFIGURED',
        module_scope: 'global',
        _projectId: projectId,
        _agentType: 'auto'
      }))
    };
  },

  // Auth
  async login(username, password) {
    await this._delay(800);
    const users = NexusStore.get('users') || [];
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return { success: false, error: 'Invalid credentials' };
    const session = { id: user.id, name: user.name, role: user.role, avatar: user.avatar, loginAt: new Date().toISOString() };
    NexusStore.setUser(session);
    NexusStore.addLog({ type: 'AUTH', message: `${user.name} logged in`, agent: 'system' });
    return { success: true, user: session };
  },

  // Projects
  async createProject(data) {
    await this._delay(1000);
    const id = 'proj_' + Date.now().toString(36);
    const setup = this._generateProjectSetup(data, id);
    const currentTenant = typeof TenantState !== 'undefined' ? TenantState.getCurrentTenant() : null;
    const currentUser = NexusStore.getUser();
    const members = Array.isArray(data.members) ? data.members.map(m => ({ ...m, projectId: id })) : [];
    if (currentUser?.id && !members.some(m => m.userId === currentUser.id)) {
      members.unshift({
        userId: currentUser.id,
        projectId: id,
        email: currentUser.email || '',
        name: currentUser.name || '',
        tenantRole: currentUser.tenantRole === 'admin' || currentUser.role === 'Tenant Admin' ? 'Admin' : 'Member',
        projectRole: 'WORKSPACE_UNIVERSAL'
      });
    }
    const project = {
      id, name: data.name, description: data.description, domain: data.domain,
      techStack: data.techStack || [], modules: data.modules || [],
      status: 'CREATED', pipelineStatus: 'NOT_STARTED',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'unknown',
      tenantId: data.tenantId || currentTenant?.tenant_id || currentTenant?.id || 'TNT-001',
      assignedUsers: members,
      members,
      orgStructure: data.orgStructure || setup.orgStructure,
      selectedWorkflows: data.selectedWorkflows || setup.selectedWorkflows,
      selectedAgents: data.selectedAgents || setup.selectedAgents,
      testCases: []
    };
    NexusStore.saveProject(project);
    NexusStore.setProjectOrgStructure(id, {
      levels: setup.orgLevels,
      updatedAt: new Date().toISOString(),
      _aiGenerated: true
    });
    NexusStore.setProjectWorkflows(id, setup.workflows);
    NexusStore.setProjectAgents(id, setup.agents);
    if (typeof TenantState !== 'undefined') {
      const tenantProjectCount = NexusStore.getProjects().filter(p => p.tenantId === project.tenantId).length;
      TenantState.updateTenant(project.tenantId, { projects: tenantProjectCount, agents: setup.agents.length });
    }
    NexusStore.addLog({ type: 'PROJECT', message: `Project "${project.name}" created`, agent: 'human_orchestrator' });
    return { success: true, project };
  },

  // Requirements
  async uploadRequirements(projectId, files) {
    await this._delay(1500);
    const newReqs = [];
    files.forEach((file, i) => {
      const reqId = 'REQ-' + (Date.now() + i).toString(36).toUpperCase();
      newReqs.push({
        id: reqId, text: file.content, type: file.type || 'FUNCTIONAL',
        module: file.module || 'unassigned', confidence: (0.75 + Math.random() * 0.24).toFixed(2),
        source: file.name, priority: 'UNCLASSIFIED'
      });
    });
    newReqs.forEach(r => NexusStore.addRequirement(projectId, r));
    NexusStore.addLog({ type: 'REQUIREMENTS', message: `${newReqs.length} requirements ingested for project ${projectId}`, agent: 'system' });
    
    // IMPORTANT: Fix context bug by forcing active project before trigger
    sessionStorage.setItem('nexus_selected_project', projectId);
    
    // Trigger flow
    if (typeof onRequirementsIngested === 'function') {
      onRequirementsIngested(projectId);
    }
    
    return { success: true, requirements: newReqs };
  },

  // Pipeline execution (simulates one stage at a time)
  async advancePipeline(projectId) {
    await this._delay(2000);
    let pipeline = NexusStore.getPipeline(projectId);
    if (!pipeline) {
      // Initialize pipeline
      const stageNames = [
        'Load Raw Sources', 'Normalize Text via AI', 'Extract Text from Files',
        'Merge & Clean Text', 'Chunk Text', 'Extract Requirements (AI + Fallback)',
        'Exact Deduplication', 'Semantic Deduplication', 'Store Requirements in DB',
        'Generate Backlog', 'Apply MoSCoW + Story Sizing', 'Store Backlog Embeddings',
        'Finalize Pipeline & Update Status'
      ];
      pipeline = {
        projectId, status: 'IN_PROGRESS', currentStage: 0,
        stages: stageNames.map((name, i) => ({
          stage: i + 1, name, status: 'PENDING', startedAt: null, completedAt: null, logs: []
        }))
      };
    }

    const next = pipeline.stages.find(s => s.status === 'PENDING' || s.status === 'IN_PROGRESS');
    if (!next) {
      pipeline.status = 'COMPLETED';
      NexusStore.setPipeline(projectId, pipeline);
      return { success: true, pipeline, completed: true };
    }

    next.status = 'COMPLETED';
    next.startedAt = next.startedAt || new Date().toISOString();
    next.completedAt = new Date().toISOString();
    next.logs.push(`Stage ${next.stage} completed successfully at ${next.completedAt}`);
    pipeline.currentStage = next.stage;

    // Add realistic logs per stage
    const stageLogs = {
      1: ['Validated input formats', 'Loaded source files successfully'],
      2: ['Language normalized', 'Ambiguities resolved'],
      3: ['Text extracted from all documents'],
      4: ['Merged overlapping content', 'Removed redundant sections'],
      5: ['Generated semantic chunks'],
      6: ['AI extraction complete', 'Fallback rules applied'],
      7: ['Hash-based deduplication complete'],
      8: ['Embedding similarity analysis complete'],
      9: ['Requirements persisted with metadata'],
      10: ['Epics, Features, and User Stories generated'],
      11: ['MoSCoW prioritization applied', 'Story points assigned'],
      12: ['Vector embeddings stored'],
      13: ['Pipeline finalized', 'Agents notified']
    };
    next.logs.push(...(stageLogs[next.stage] || []));

    const nextPending = pipeline.stages.find(s => s.status === 'PENDING');
    if (nextPending) {
      nextPending.status = 'IN_PROGRESS';
      nextPending.startedAt = new Date().toISOString();
    } else {
      pipeline.status = 'COMPLETED';
      const project = NexusStore.getProject(projectId);
      if (project) { project.pipelineStatus = 'COMPLETED'; project.status = 'ACTIVE'; NexusStore.saveProject(project); }
    }

    NexusStore.setPipeline(projectId, pipeline);
    NexusStore.addLog({ type: 'PIPELINE', message: `Stage ${next.stage} (${next.name}) completed for project ${projectId}`, agent: 'system' });

    const project = NexusStore.getProject(projectId);
    if (project) { project.pipelineStatus = `STAGE_${pipeline.currentStage}`; NexusStore.saveProject(project); }

    return { success: true, pipeline, completed: pipeline.status === 'COMPLETED' };
  },

  // Agent creation
  async createAgent(data) {
    await this._delay(1200);
    const agent = {
      agent_id: 'agent_' + Date.now().toString(36),
      agent_name: data.agent_name,
      created_by: 'human_orchestrator',
      role: data.role,
      module_scope: data.module_scope || 'global',
      model_provider: data.model_provider,
      model_variant: data.model_variant,
      status: 'ACTIVE',
      lifecycle: 'CONFIGURED',
      skills: data.skills || [],
      ceiling_profile: data.ceiling_profile || { can_autonomously: [], must_escalate: [], strictly_forbidden: [], risk_sensitivity: 'MEDIUM' },
      metrics: { tasks_completed: 0, escalations_raised: 0, gate_pass_rate: 100 },
      createdAt: new Date().toISOString()
    };
    NexusStore.saveAgent(agent);

    // Generate workspace files
    NexusStore.setWorkspaceFile(agent.agent_id, 'skills', `# SKILLS\n\n## Core Responsibilities\n${agent.skills.map(c => '- ' + c.replace(/_/g, ' ')).join('\n')}\n\n## Constraints\n- Must follow governance rules\n- Cannot exceed ceiling limits\n\n## Escalation Awareness\n- Ceiling violations trigger immediate escalation`);
    NexusStore.setWorkspaceFile(agent.agent_id, 'tools', `# TOOLS\n\n## Available Tools\n- Standard ${agent.role} toolkit\n\n## Tool Usage Rules\n- Cannot deploy to production\n- Must log all tool usage`);
    NexusStore.setWorkspaceFile(agent.agent_id, 'heartbeat', `# HEARTBEAT\n\n## Current Tasks\n- No tasks assigned yet\n\n## Status\nACTIVE\n\n## Performance Metrics\n- Tasks completed: 0\n- Escalations raised: 0\n- Gate pass rate: N/A`);
    NexusStore.setWorkspaceFile(agent.agent_id, 'souls', `# SOUL\n\n## Decision References\n- None yet\n\n## Behavioral Traits\n- Newly created agent — learning patterns\n\n## Learned Patterns\n- Following system-wide governance rules\n\n## Collaboration Style\n- Awaiting first interactions to establish style`);

    NexusStore.addLog({ type: 'AGENT', message: `Agent "${agent.agent_name}" created and registered`, agent: 'human_orchestrator' });
    return { success: true, agent };
  },

  // Escalation handling
  async resolveEscalation(escalationId, resolution) {
    await this._delay(1000);
    const escs = NexusStore.getEscalations();
    const esc = escs.find(e => e.escalation_id === escalationId);
    if (!esc) return { success: false, error: 'Escalation not found' };

    esc.status = 'RESOLVED';
    esc.resolvedAt = new Date().toISOString();
    esc.resolution = resolution;
    NexusStore.setEscalations(escs);

    // Create decision record
    const decision = {
      decision_id: 'DEC-' + Date.now().toString(36).toUpperCase(),
      type: resolution.type || 'OPERATIONAL',
      decided_by: resolution.decided_by || 'human_orchestrator',
      decided_by_name: resolution.decided_by_name || 'Human Orchestrator',
      human_reviewed: true,
      context: esc.context,
      options_considered: esc.options.map(o => o.option),
      final_choice: resolution.chosen_option,
      reasoning: resolution.notes || '',
      references: [],
      timestamp: new Date().toISOString(),
      immutable: true,
      projectId: esc.projectId
    };
    NexusStore.addDecision(decision);

    // Unblock related task
    if (esc.taskRef) {
      const tasks = NexusStore.getTasks(esc.projectId);
      const task = tasks.find(t => t.task_id === esc.taskRef);
      if (task && (task.status === 'ESCALATED' || task.status === 'BLOCKED')) {
        task.status = 'EXECUTING';
        task.logs.push(`Escalation ${escalationId} resolved — task resumed`);
        NexusStore.setTasks(esc.projectId, tasks);
      }
    }

    NexusStore.addLog({ type: 'ESCALATION', message: `Escalation ${escalationId} resolved: ${resolution.action}`, agent: resolution.decided_by || 'human_orchestrator' });
    NexusStore.addLog({ type: 'DECISION', message: `Decision ${decision.decision_id} recorded`, agent: decision.decided_by });
    return { success: true, escalation: esc, decision };
  },

  // Task state transitions
  async updateTaskStatus(projectId, taskId, newStatus, note) {
    await this._delay(500);
    const tasks = NexusStore.getTasks(projectId);
    const task = tasks.find(t => t.task_id === taskId);
    if (!task) return { success: false, error: 'Task not found' };

    const oldStatus = task.status;
    task.status = newStatus;
    if (newStatus === 'DONE') task.completedAt = new Date().toISOString();
    task.logs.push(`Status changed: ${oldStatus} → ${newStatus}${note ? ' — ' + note : ''}`);
    NexusStore.setTasks(projectId, tasks);
    NexusStore.addLog({ type: 'TASK', message: `${taskId} status: ${oldStatus} → ${newStatus}`, agent: task.assignedTo });
    return { success: true, task };
  },

  // Quality Gate submission
  async submitGateReview(projectId, taskId, level) {
    await this._delay(1500);
    const tasks = NexusStore.getTasks(projectId);
    const task = tasks.find(t => t.task_id === taskId);
    if (!task) return { success: false, error: 'Task not found' };

    const passed = Math.random() > 0.2; // 80% pass rate simulation
    const gate = {
      gate_id: 'GATE-' + Date.now().toString(36).toUpperCase(),
      task_id: taskId, level, status: passed ? 'PASS' : 'FAIL',
      checks: {
        automated_tests: Math.random() > 0.1,
        linting: Math.random() > 0.05,
        reviewer_approval: passed,
        test_coverage: Math.floor(70 + Math.random() * 25)
      },
      reviewedBy: 'agent_qa_001',
      timestamp: new Date().toISOString()
    };

    if (level === 'L3' || level === 'L4') {
      gate.checks.security_scan = Math.random() > 0.15;
      gate.checks.architect_signoff = passed;
    }
    if (level === 'L4') {
      gate.checks.human_approval = passed;
    }

    const gates = NexusStore.getGateReviews(projectId);
    gates.push(gate);
    NexusStore.setGateReviews(projectId, gates);

    task.gateStatus = gate.status;
    if (passed) {
      task.status = 'DONE';
      task.completedAt = new Date().toISOString();
      task.logs.push(`Gate ${level} PASSED — task completed`);
    } else {
      task.status = 'EXECUTING';
      task.logs.push(`Gate ${level} FAILED — returned to execution`);
    }
    NexusStore.setTasks(projectId, tasks);

    NexusStore.addLog({ type: 'GATE', message: `Gate ${level} ${gate.status} for ${taskId}`, agent: 'system' });
    return { success: true, gate };
  },

  // Raise new escalation
  async raiseEscalation(data) {
    await this._delay(800);
    const esc = {
      escalation_id: 'ESC-' + new Date().getFullYear() + '-' + String(NexusStore.getEscalations().length + 1).padStart(4, '0'),
      raised_by: data.raised_by, raised_by_name: data.raised_by_name,
      ceiling_violated: data.ceiling_violated, status: 'PENDING',
      context: data.context, reasoning: data.reasoning,
      impact_analysis: data.impact_analysis,
      options: data.options || [],
      recommended_action: data.recommended_action || '',
      escalated_to: data.escalated_to, escalated_to_name: data.escalated_to_name,
      timestamp: new Date().toISOString(), resolvedAt: null, resolution: null,
      projectId: data.projectId, taskRef: data.taskRef
    };
    NexusStore.addEscalation(esc);
    NexusStore.addLog({ type: 'ESCALATION', message: `Escalation ${esc.escalation_id} raised by ${esc.raised_by_name}`, agent: esc.raised_by });
    NexusStore.setSystemState('ESCALATION_PENDING');
    return { success: true, escalation: esc };
  }
};

// Global trigger function — called from MockAPI.uploadRequirements
window.onRequirementsIngested = function(projectId) {
  console.log("onRequirementsIngested called for:", projectId);
  
  const project = NexusStore.getProject(projectId);

  // VALIDATION
  if (!project) {
    console.log("onRequirementsIngested BLOCKED: project not found");
    return;
  }
  
  const reqs = NexusStore.getRequirements(projectId);
  if (!reqs || reqs.length === 0) {
    console.log("onRequirementsIngested BLOCKED: no requirements stored");
    return;
  }

  // PREVENT RE-RUN: only trigger if status is still CREATED
  if (project.status !== "CREATED" && project.status !== "REQUIREMENTS_READY") {
    console.log("onRequirementsIngested BLOCKED: project already in", project.status);
    return;
  }

  // UPDATE STATE
  project.status = "REQUIREMENTS_READY";
  project.requirements = reqs;
  project.pipelineProgress = 0;
  NexusStore.saveProject(project);

  console.log("Requirements ingested for:", projectId, "| Count:", reqs.length);
  console.log("Pipeline starting...");

  // START FLOW via Orchestrator
  if (typeof NexusOrchestration !== 'undefined') {
    NexusOrchestration.startPipeline(projectId);
    
    // Redirect to system-flow so user can watch Business Analyst execute
    setTimeout(() => {
      window.location.href = "workspace.html";
    }, 500);
  } else {
    console.error("NexusOrchestration NOT LOADED — pipeline cannot start!");
  }
};
