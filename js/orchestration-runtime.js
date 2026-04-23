// Shared real-time orchestration runtime for System Flow and Agent Management pages.
const NexusOrchestration = (() => {
  function getCurrentProjectId() {
    return sessionStorage.getItem('nexus_selected_project') || 'proj_default';
  }

  function getStorageKey() {
    return 'nexus_orchestration_v4_' + getCurrentProjectId();
  }

  const VERSION = 5;
  const MIN_TASK_SECONDS = 20;
  const AI_STAGE_SECONDS = 5;
  const MAX_CATCH_UP_SECONDS = 240;
  const NOTIFICATION_DURATION = 3;

  const AGENT_ORDER = [
    'businessAnalyst',
    'aiPipeline',
    'productOwner',
    'testCaseGenerator',
    'chiefArchitect',
    'scrumMaster',
    'moduleArchitectAuth',
    'moduleArchitectPayments',
    'moduleArchitectOrders',
    'devAuth01',
    'devAuth02',
    'devPay01',
    'qaAgent',
    'releaseAgent'
  ];

  const AGENT_SPECS = {
    businessAnalyst: {
      agentId: 'agent_ba_001',
      name: 'Business Analyst',
      role: 'business_analyst',
      module: 'global',
      tokenBase: 980,
      tasks: [
        { id: 'REQ-201', title: 'Extract Requirements', action: 'Extracting requirements from stakeholder inputs' },
        { id: 'REQ-202', title: 'Validate Requirement Scope', action: 'Verifying requirement scope and constraints' }
      ]
    },
    aiPipeline: {
      agentId: 'agent_ai_pipeline_001',
      name: 'AI Pipeline Agent',
      role: 'ai_pipeline',
      module: 'global',
      tokenBase: 1140,
      tasks: [
        { id: 'AI-301', title: 'Load Raw Sources', action: 'Loading raw source documents' },
        { id: 'AI-302', title: 'Normalize Text', action: 'Normalizing extracted text' },
        { id: 'AI-303', title: 'Extract Text', action: 'Extracting key phrases and text' },
        { id: 'AI-304', title: 'Merge & Clean', action: 'Merging and cleaning text blobs' },
        { id: 'AI-305', title: 'Chunk Text', action: 'Chunking text into processable segments' },
        { id: 'AI-306', title: 'Extract Requirements', action: 'Extracting formal requirements' },
        { id: 'AI-307', title: 'Deduplicate Exact', action: 'Deduplicating exact matches' },
        { id: 'AI-308', title: 'Deduplicate Semantic', action: 'Deduplicating semantic overlaps' },
        { id: 'AI-309', title: 'Store Requirements', action: 'Storing finalized requirements' },
        { id: 'AI-310', title: 'Generate Backlog', action: 'Generating initial backlog items' },
        { id: 'AI-311', title: 'Prioritize (MoSCoW)', action: 'Prioritizing items via MoSCoW' },
        { id: 'AI-312', title: 'Store Embeddings', action: 'Storing vector embeddings for search' },
        { id: 'AI-313', title: 'Finalize Pipeline', action: 'Finalizing pipeline and generating report' }
      ]
    },
    productOwner: {
      agentId: 'agent_po_001',
      name: 'Product Owner',
      role: 'product_owner',
      module: 'global',
      tokenBase: 1200,
      tasks: [
        { id: 'PO-401', title: 'Approve backlog', action: 'Approving and refining generated backlog items' },
        { id: 'PO-402', title: 'Refine priorities', action: 'Refining delivery priorities and acceptance criteria' }
      ]
    },
    testCaseGenerator: {
      agentId: 'agent_tc_gen_001',
      name: 'Test Case Generator Agent',
      role: 'test_case_generator',
      module: 'global',
      tokenBase: 900,
      tasks: [
        { id: 'TC-GEN-001', title: 'Generate test cases', action: 'Generating test cases from acceptance criteria' }
      ]
    },
    chiefArchitect: {
      agentId: 'agent_chief_arch_001',
      name: 'Chief Architect',
      role: 'chief_architect',
      module: 'global',
      tokenBase: 1380,
      tasks: [
        { id: 'ARCH-501', title: 'Designing DB Schema', action: 'Designing normalized DB schema with bounded contexts' },
        { id: 'ARCH-502', title: 'Creating Use Case Diagram', action: 'Creating use case diagram for module interactions' },
        { id: 'ARCH-503', title: 'Creating Class Diagram', action: 'Creating class diagram for core entities and services' },
        { id: 'ARCH-504', title: 'Designing APIs', action: 'Designing API contracts and response schemas' },
        { id: 'ARCH-505', title: 'Defining system workflow', action: 'Defining end-to-end system workflow and handoff rules' }
      ]
    },
    scrumMaster: {
      agentId: 'agent_sm_001',
      name: 'Scrum Master',
      role: 'scrum_master',
      module: 'global',
      tokenBase: 1040,
      tasks: [
        { id: 'SM-601', title: 'Task orchestration', action: 'Distributing tasks to module architects and developers' },
        { id: 'SM-602', title: 'Progress monitoring', action: 'Monitoring start time, completion time, and delivery status' }
      ]
    },
    moduleArchitectAuth: {
      agentId: 'agent_mod_arch_auth',
      name: 'Module Architect - Auth',
      role: 'module_architect',
      module: 'auth',
      tokenBase: 1120,
      tasks: [
        { id: 'MOD-AUTH-701', title: 'Create auth module blueprint', action: 'Breaking auth tasks and API contracts for developers' }
      ]
    },
    moduleArchitectPayments: {
      agentId: 'agent_mod_arch_payments',
      name: 'Module Architect - Payments',
      role: 'module_architect',
      module: 'payments',
      tokenBase: 1100,
      tasks: [
        { id: 'MOD-PAY-702', title: 'Create payments module blueprint', action: 'Designing payment workflows and retry boundaries' }
      ]
    },
    moduleArchitectOrders: {
      agentId: 'agent_mod_arch_orders',
      name: 'Module Architect - Orders',
      role: 'module_architect',
      module: 'orders',
      tokenBase: 1080,
      tasks: [
        { id: 'MOD-ORD-703', title: 'Create orders module blueprint', action: 'Designing order lifecycle orchestration and state flow' }
      ]
    },
    devAuth01: {
      agentId: 'agent_dev_auth_01',
      name: 'Dev Auth 01',
      role: 'developer',
      module: 'auth',
      tokenBase: 1220,
      tasks: [
        { id: 'TASK-AUTH-102', title: 'Create login API', action: 'Implementing login API with token and metadata handling' }
      ]
    },
    devAuth02: {
      agentId: 'agent_dev_auth_02',
      name: 'Dev Auth 02',
      role: 'developer',
      module: 'auth',
      tokenBase: 1160,
      tasks: [
        { id: 'TASK-AUTH-103', title: 'Build registration flow', action: 'Implementing registration flow and validation pipeline' }
      ]
    },
    devPay01: {
      agentId: 'agent_dev_pay_01',
      name: 'Dev Pay 01',
      role: 'developer',
      module: 'payments',
      tokenBase: 1180,
      tasks: [
        { id: 'TASK-PAY-201', title: 'Integrate payment gateway', action: 'Implementing payment provider adapter and callbacks' }
      ]
    },
    qaAgent: {
      agentId: 'agent_qa_001',
      name: 'QA Agent',
      role: 'qa',
      module: 'global',
      tokenBase: 1000,
      tasks: [
        { id: 'QA-801', title: 'Run QA validation', action: 'Executing regression and contract validation suites' }
      ]
    },
    releaseAgent: {
      agentId: 'agent_secdevops_001',
      name: 'Release Agent',
      role: 'security_devops',
      module: 'global',
      tokenBase: 1060,
      tasks: [
        { id: 'REL-901', title: 'Prepare release package', action: 'Preparing release package and deployment telemetry' }
      ]
    }
  };

  const PHASES = [
    {
      id: 'business_analyst',
      title: 'Business Analyst (Start)',
      from: 'Stakeholders',
      to: 'AI Processing Pipeline',
      members: ['businessAnalyst'],
      input: ['Raw requirement docs', 'Stakeholder transcripts'],
      output: ['Extracted requirement set'],
      startEvent: 'Business Analyst started extracting requirements',
      completeEvent: 'Requirements processed and sent to AI Pipeline',
      handoffEvent: 'Output passed from Business Analyst → AI Processing Pipeline',
      duration: 5
    },
    {
      id: 'ai_pipeline',
      title: 'AI Processing Pipeline',
      from: 'Business Analyst',
      to: 'Product Owner',
      members: ['aiPipeline'],
      input: ['Extracted requirement set'],
      output: ['Normalized requirements', 'Extracted features', 'Generated PBIs'],
      startEvent: 'AI Processing Pipeline started normalizing requirements',
      completeEvent: 'AI Pipeline completed — PBIs generated',
      handoffEvent: 'Output passed from AI Pipeline → Product Owner',
      duration: 13 * AI_STAGE_SECONDS
    },
    {
      id: 'product_owner',
      title: 'Product Owner (Approval + Refinement)',
      from: 'AI Processing Pipeline',
      to: 'Chief Architect',
      members: ['productOwner'],
      input: ['Generated PBIs', 'Feature extraction report'],
      output: ['Approved backlog', 'Refined acceptance criteria'],
      startEvent: 'Product Owner started reviewing and approving backlog',
      completeEvent: 'Backlog approved and refined by Product Owner',
      handoffEvent: 'Output passed from Product Owner → Chief Architect'
    },
    {
      id: 'chief_architect_primary',
      title: 'Chief Architect + QA Automation',
      from: 'Product Owner',
      to: 'Chief Architect + Scrum Master',
      members: ['chiefArchitect', 'testCaseGenerator'],
      input: ['Approved backlog', 'acceptanceCriteria[]'],
      output: ['Architecture plan', 'Schema and API baseline', 'testCases[]'],
      parallel: true,
      startEvent: 'Test Case Generator started generating test cases',
      completeEvent: 'Test cases generated and sent to QA',
      handoffEvent: 'Output passed to Scrum Master and QA'
    },
    {
      id: 'chief_scrum_parallel',
      title: 'Chief Architect + Scrum Master (Parallel)',
      from: 'Chief Architect',
      to: 'Module Architects',
      members: ['chiefArchitect', 'scrumMaster', 'testCaseGenerator'],
      input: ['Architecture baseline', 'Updated requirement notes', 'testCases[]'],
      output: ['Updated architecture package', 'Task orchestration plan'],
      parallel: true,
      startEvent: 'Chief Architect re-activated to redesign DB schema due to updated requirements',
      completeEvent: 'Architecture and task plan finalized',
      handoffEvent: 'Output passed from Scrum Master → Module Architects'
    },
    {
      id: 'module_architects_parallel',
      title: 'Module Architects (Parallel)',
      from: 'Scrum Master',
      to: 'Developers',
      members: ['moduleArchitectAuth', 'moduleArchitectPayments', 'moduleArchitectOrders'],
      input: ['Task orchestration plan', 'Architecture package'],
      output: ['Module breakdown', 'Implementation tasks'],
      parallel: true,
      startEvent: 'Module Architects started creating module blueprints',
      completeEvent: 'All module blueprints completed',
      handoffEvent: 'Output passed from Module Architects → Developers'
    },
    {
      id: 'developers_parallel',
      title: 'Developers (Parallel)',
      from: 'Module Architects',
      to: 'QA',
      members: ['devAuth01', 'devAuth02', 'devPay01'],
      input: ['Task assignments', 'Module contracts'],
      output: ['Code changes', 'Unit test evidence'],
      parallel: true,
      startEvent: 'Developers started implementing assigned tasks',
      completeEvent: 'All development tasks completed',
      handoffEvent: 'Output passed from Developers → QA'
    },
    {
      id: 'qa',
      title: 'QA',
      from: 'Developers',
      to: 'Release',
      members: ['qaAgent'],
      input: ['Code changes', 'Unit tests', 'testCases[]'],
      output: ['Validated release candidate'],
      startEvent: 'QA Agent started regression and contract validation',
      completeEvent: 'QA validation passed',
      handoffEvent: 'Output passed from QA → Release Agent'
    },
    {
      id: 'release',
      title: 'Release',
      from: 'QA',
      to: 'Production',
      members: ['releaseAgent'],
      input: ['QA sign-off', 'Release checklist'],
      output: ['Release package', 'Deployment telemetry'],
      startEvent: 'Release Agent started preparing deployment package',
      completeEvent: 'Release package deployed to production'
    }
  ];

  const TOKEN_STEP = {
    businessAnalyst: 16,
    aiPipeline: 28,
    productOwner: 17,
    chiefArchitect: 22,
    testCaseGenerator: 12,
    scrumMaster: 14,
    moduleArchitectAuth: 19,
    moduleArchitectPayments: 18,
    moduleArchitectOrders: 18,
    devAuth01: 21,
    devAuth02: 20,
    devPay01: 20,
    qaAgent: 15,
    releaseAgent: 16
  };

  function parse(json) {
    try { return JSON.parse(json); } catch { return null; }
  }

  function nowMs() { return Date.now(); }
  function isoNow() { return new Date().toISOString(); }
  function deepClone(v) { return JSON.parse(JSON.stringify(v)); }

  function loadState() { return parse(localStorage.getItem(getStorageKey())); }
  function saveState(state) { localStorage.setItem(getStorageKey(), JSON.stringify(state)); }

  function createAgentState(key) {
    const spec = AGENT_SPECS[key];
    const firstTask = spec.tasks[0];
    return {
      key,
      agentId: spec.agentId,
      name: spec.name,
      role: spec.role,
      module: spec.module,
      status: 'INACTIVE',
      stageStatus: 'PENDING',
      currentTaskIndex: 0,
      currentTaskId: firstTask.id,
      currentTaskName: firstTask.title,
      currentAction: 'Awaiting assignment',
      timerSec: 0,
      tokens: spec.tokenBase,
      completedTasks: 0,
      startedAt: null,
      completedAt: null,
      inputData: '',
      outputData: ''
    };
  }

  /* ── Notification Queue ── */

  function pushEvent(state, type, message) {
    if (state.events.some(e => e.message === message)) return;

    const event = {
      id: ++state.lastEventId,
      type,
      message,
      timestamp: isoNow()
    };
    state.events.push(event);
    if (state.events.length > 80) state.events = state.events.slice(-80);

    // Queue for single-notification display
    state.notificationQueue.push(event);
    if (state.notificationQueue.length > 30) {
      state.notificationQueue = state.notificationQueue.slice(-30);
    }
  }

  function advanceNotificationQueue(state) {
    // Count down active notification
    if (state.activeNotification) {
      state.notificationTimer -= 1;
      if (state.notificationTimer <= 0) {
        state.activeNotification = null;
        state.notificationTimer = 0;
      }
    }

    // Show next if nothing active
    if (!state.activeNotification && state.notificationQueue.length > 0) {
      state.activeNotification = state.notificationQueue.shift();
      state.notificationTimer = NOTIFICATION_DURATION;
    }
  }

  /* ── LLM Sessions ── */
  const agentModelMap = {
    "businessAnalyst": "gemini",
    "aiPipeline": "gpt-4",
    "productOwner": "gpt-4",
    "chiefArchitect": "claude",
    "moduleArchitectAuth": "claude-code",
    "moduleArchitectPayments": "claude-code",
    "devAuth01": "claude-code",
    "devAuth02": "claude-code",
    "devPay01": "claude-code",
    "qa": "gpt-4",
    "testCaseGenerator": "gemini",
    "scrumMaster": "claude",
    "release": "gpt-4"
  };

  function startLLMSession(agentKey, agentName, taskId, module) {
    if (typeof NexusStore === 'undefined') return;
    const projectId = getCurrentProjectId();
    const sessions = NexusStore.getLlmSessions(projectId);
    
    // Close existing session for this agent if any
    const existing = sessions.find(s => s.agentKey === agentKey && s.status === 'ACTIVE');
    if (existing) existing.status = 'COMPLETED';

    sessions.push({
      id: `SESSION-${Math.floor(Math.random()*10000)}`,
      agentKey: agentKey,
      agent: agentName,
      model: agentModelMap[agentKey] || "gpt-4",
      module: module || "general",
      taskId: taskId,
      status: "ACTIVE",
      logs: [`Initializing session for ${agentName}...`],
      escalations: []
    });
    NexusStore.setLlmSessions(projectId, sessions);
  }

  function endLLMSession(agentKey) {
    if (typeof NexusStore === 'undefined') return;
    const projectId = getCurrentProjectId();
    const sessions = NexusStore.getLlmSessions(projectId);
    const existing = sessions.find(s => s.agentKey === agentKey && s.status === 'ACTIVE');
    if (existing) {
      existing.status = 'COMPLETED';
      existing.logs.push(`Session completed successfully.`);
      NexusStore.setLlmSessions(projectId, sessions);
    }
  }

  function appendLLMLog(agentKey, logText) {
    if (typeof NexusStore === 'undefined') return;
    const projectId = getCurrentProjectId();
    const sessions = NexusStore.getLlmSessions(projectId);
    const existing = sessions.find(s => s.agentKey === agentKey && s.status === 'ACTIVE');
    if (existing) {
      existing.logs.push(logText);
      NexusStore.setLlmSessions(projectId, sessions);
    }
  }

  function escalateLLMSession(agentKey, escalationId) {
    if (typeof NexusStore === 'undefined') return;
    const projectId = getCurrentProjectId();
    const sessions = NexusStore.getLlmSessions(projectId);
    const existing = sessions.find(s => s.agentKey === agentKey && s.status === 'ACTIVE');
    if (existing) {
      existing.status = 'ESCALATED';
      existing.logs.push(`⚠️ Issue detected. Escalation raised: ${escalationId}`);
      existing.escalations.push({ id: escalationId, type: "ISSUE_DETECTED", status: "OPEN" });
      NexusStore.setLlmSessions(projectId, sessions);
    }
  }

  /* ── Agent State Helpers ── */

  function setActive(state, key, phase) {
    const agent = state.agents[key];
    if (!agent) return;

    const spec = AGENT_SPECS[key];
    if (key === 'aiPipeline') {
      agent.currentTaskIndex = 0;
    }

    if (key === 'testCaseGenerator' && typeof NexusStore !== 'undefined') {
      const backlog = NexusStore.getBacklog(getCurrentProjectId());
      let hasCriteria = false;
      if (backlog.length > 0 && backlog[0].epic) {
        hasCriteria = backlog.some(e => e.features && e.features.some(f => f.userStories && f.userStories.some(s => s.acceptanceCriteria && s.acceptanceCriteria.length > 0)));
      } else {
        hasCriteria = backlog.some(i => i.type === 'USER_STORY' && i.acceptanceCriteria && i.acceptanceCriteria.length > 0);
      }
      if (!hasCriteria) {
        agent.status = 'INACTIVE';
        agent.stageStatus = 'PENDING';
        agent.currentAction = 'Awaiting acceptance criteria';
        return;
      }
    }

    const task = spec.tasks[agent.currentTaskIndex] || { title: 'Unknown Task', action: 'Executing task' };
    agent.status = 'ACTIVE';
    agent.stageStatus = 'SPECIFIED';
    agent.currentTaskId = task.id;
    agent.currentTaskName = task.title;
    agent.currentAction = task.action;

    if (state.flags && state.flags.isQaRetest) {
      if (key.startsWith('moduleArchitect')) {
        agent.currentTaskName = 'Process QA Escalation';
        agent.currentAction = 'Analyzing issue and assigning fix';
        
        // Assign task to developer
        const mod = key.replace('moduleArchitect', '').toLowerCase();
        if (typeof NexusStore !== 'undefined') {
          const pId = getCurrentProjectId();
          const tasks = NexusStore.getTasks(pId) || [];
          tasks.push({
            task_id: `TASK-FIX-${Date.now()}`,
            module: mod,
            status: "SPECIFIED",
            title: "Fixing failed test case issue",
            assignedTo: `agent_dev_${mod}_01`,
            type: "BUG_FIX"
          });
          NexusStore.setTasks(pId, tasks);
        }
      } else if (key.startsWith('dev')) {
        agent.currentTaskName = 'Execute Bug Fix';
        agent.currentAction = 'Fixing failed test case issue';
      }
    }

    agent.timerSec = 0;
    agent.startedAt = isoNow();
    agent.inputData = phase.input.join(', ');
    agent.outputData = phase.output.join(', ');

    startLLMSession(key, agent.name || key, agent.currentTaskId || 'TASK-000', key.includes('Auth') ? 'auth' : key.includes('Pay') ? 'payments' : 'general');
  }

  function rotateTask(agent, spec) {
    if (!spec.tasks.length) return;
    agent.currentTaskIndex = (agent.currentTaskIndex + 1) % spec.tasks.length;
    const task = spec.tasks[agent.currentTaskIndex];
    agent.currentTaskId = task.id;
    agent.currentTaskName = task.title;
    agent.currentAction = task.action;
  }

  function setInactive(agent, completed, key) {
    agent.status = 'INACTIVE';
    agent.timerSec = completed ? MIN_TASK_SECONDS : 0;
    agent.stageStatus = completed ? 'COMPLETED' : 'PENDING';
    if (completed) {
      agent.completedTasks += 1;
      agent.completedAt = isoNow();
      agent.currentAction = 'Completed task and awaiting next assignment';
      if (key) endLLMSession(key);
    } else {
      agent.currentAction = 'Awaiting assignment';
    }
  }

  /* ── AI Pipeline Sub-task View ── */

  function updateAiPipelineTaskView(state, phase) {
    const aiAgent = state.agents.aiPipeline;
    const tasks = AGENT_SPECS.aiPipeline.tasks;

    let elapsed = 0;
    if (phase.id === 'ai_pipeline') {
      elapsed = Math.min(state.phaseElapsed, 13 * AI_STAGE_SECONDS);
    } else if (state.phaseIndex > 1) {
      elapsed = 13 * AI_STAGE_SECONDS;
    }

    let currentIndex = 0;

    state.aiPipelineTasks = tasks.map((task, idx) => {
      const start = idx * AI_STAGE_SECONDS + 1;
      const end = (idx + 1) * AI_STAGE_SECONDS;
      let status = 'PENDING';
      let timerSec = 0;

      if (elapsed >= end) {
        status = 'COMPLETED';
        timerSec = AI_STAGE_SECONDS;
      } else if (elapsed >= start) {
        status = elapsed === start ? 'SPECIFIED' : 'EXECUTING';
        timerSec = elapsed - start + 1;
        currentIndex = idx;
        
        // Push notification on stage start
        if (elapsed === start) {
           pushEvent(state, 'STAGE_CHANGE', `Stage ${idx + 1}: ${task.title}`);
        }
      }

      return {
        id: task.id,
        name: task.title,
        status,
        timerSec,
        tokens: aiAgent.tokens + idx * 12
      };
    });

    if (phase.id === 'ai_pipeline') {
      const currentTask = tasks[currentIndex];
      aiAgent.currentTaskIndex = currentIndex;
      aiAgent.currentTaskId = currentTask.id;
      aiAgent.currentTaskName = currentTask.title;
      aiAgent.currentAction = currentTask.action;
    }
  }

  /* ── Scrum Dashboard ── */

  function refreshScrumDashboard(state) {
    const trackedKeys = [
      'moduleArchitectAuth', 'moduleArchitectPayments', 'moduleArchitectOrders',
      'devAuth01', 'devAuth02', 'devPay01'
    ];

    state.scrum.activeTasks = trackedKeys
      .map((key) => state.agents[key])
      .filter((a) => a && a.status === 'ACTIVE')
      .map((a) => ({
        agent: a.name,
        taskId: a.currentTaskId,
        task: a.currentTaskName,
        status: a.stageStatus,
        startedAt: a.startedAt,
        completionTarget: MIN_TASK_SECONDS + 's'
      }));

    state.scrum.monitoring = trackedKeys
      .map((key) => state.agents[key])
      .filter(Boolean)
      .map((a) => ({
        agent: a.name,
        status: a.status,
        taskId: a.currentTaskId,
        startedAt: a.startedAt || 'Not started',
        completedAt: a.completedAt || 'In progress'
      }));
  }

  /* ── Escalation (controlled) ── */

  function triggerEscalation(state) {
    const escalation = {
      id: 'ESC-SIM-' + String(state.cycle).padStart(3, '0'),
      summary: 'DB schema change requires approval',
      route: ['Developer', 'Module Architect', 'Scrum Master', 'Chief Architect'],
      raisedAt: isoNow(),
      status: 'OPEN'
    };

    state.scrum.escalations.unshift(escalation);
    if (state.scrum.escalations.length > 8) state.scrum.escalations.length = 8;

    state.escalationRoute = escalation.route;

    // Mark triggering developer as BLOCKED
    const devAgent = state.agents.devAuth01;
    if (devAgent) devAgent.stageStatus = 'BLOCKED';

    pushEvent(state, 'ESCALATION', 'Escalation raised: DB schema change requires approval');
    state.flags.escalationRaisedInCycle = true;
  }

  function resolveEscalation(state) {
    const devAgent = state.agents.devAuth01;
    if (devAgent && devAgent.stageStatus === 'BLOCKED') {
      devAgent.stageStatus = 'EXECUTING';
    }
    // Close latest escalation
    if (state.scrum.escalations.length > 0 && state.scrum.escalations[0].status === 'OPEN') {
      state.scrum.escalations[0].status = 'RESOLVED';
    }
    state.flags.escalationResolved = true;
  }

  /* ── Phase Lifecycle ── */

  function enterPhase(state) {
    const phase = PHASES[state.phaseIndex];

    state.phaseElapsed = 0;
    state.phaseStartedAt = isoNow();

    // STRICT: Force ALL non-member agents to INACTIVE
    AGENT_ORDER.forEach((key) => {
      const agent = state.agents[key];
      if (!agent) return;
      if (!phase.members.includes(key)) {
        agent.status = 'INACTIVE';
        if (agent.stageStatus !== 'COMPLETED') {
          agent.stageStatus = 'PENDING';
          agent.currentAction = 'Awaiting assignment';
        }
      }
    });

    // Activate ONLY current phase members IF RUNNING
    if (state.isRunning) {
      phase.members.forEach((key) => setActive(state, key, phase));

      if (phase.startEvent) {
        pushEvent(state, 'TASK_START', phase.startEvent);
      }

      // Automatically generate test cases when Test Case Generator phase begins
      if (phase.id === 'chief_architect_primary' && typeof NexusStore !== 'undefined') {
        const projectId = getCurrentProjectId();
        const backlog = NexusStore.getBacklog(projectId);
        let testCases = [];
        let tcIndex = 1;

        // NORMALIZE BACKLOG — ensure every user story has acceptanceCriteria
        const normalizeBacklog = (items) => {
          items.forEach(item => {
            if (item.type === 'USER_STORY' || item.userStories) {
              if (!item.acceptanceCriteria || item.acceptanceCriteria.length === 0) {
                item.acceptanceCriteria = [
                  `${item.title} should work correctly`,
                  `${item.title} should handle invalid inputs`,
                  `${item.title} should handle edge cases`
                ];
              }
            }
            // Handle nested hierarchical backlog
            if (item.features) {
              item.features.forEach(f => {
                f.userStories = f.userStories || [];
                f.userStories.forEach(s => {
                  if (!s.acceptanceCriteria || s.acceptanceCriteria.length === 0) {
                    s.acceptanceCriteria = [
                      `${s.title} should work correctly`,
                      `${s.title} should handle invalid inputs`,
                      `${s.title} should handle edge cases`
                    ];
                  }
                });
              });
            }
          });
        };
        normalizeBacklog(backlog);
        NexusStore.setBacklog(projectId, backlog);
        console.log("normalizeBacklog completed. Backlog items:", backlog.length);
        
        const processCriteria = (storyId, storyTitle, criteriaList) => {
          if (!criteriaList || criteriaList.length === 0) return;
          const crit = criteriaList.join(', ');
          
          testCases.push({
            id: `TC-${storyId.split('-').pop()}-${String(tcIndex++).padStart(3, '0')}`,
            type: 'POSITIVE',
            story: storyTitle,
            steps: ['Enter valid inputs', 'Submit action'],
            expectedResult: 'Operation succeeds according to criteria: ' + crit.substring(0, 30) + '...',
            status: 'PENDING',
            notes: ''
          });
          testCases.push({
            id: `TC-${storyId.split('-').pop()}-${String(tcIndex++).padStart(3, '0')}`,
            type: 'NEGATIVE',
            story: storyTitle,
            steps: ['Enter invalid data', 'Submit action'],
            expectedResult: 'System throws validation error',
            status: 'PENDING',
            notes: ''
          });
          testCases.push({
            id: `TC-${storyId.split('-').pop()}-${String(tcIndex++).padStart(3, '0')}`,
            type: 'EDGE',
            story: storyTitle,
            steps: ['Leave optional fields empty or use boundaries', 'Submit action'],
            expectedResult: 'System handles boundary safely',
            status: 'PENDING',
            notes: ''
          });
        };

        if (backlog.length > 0 && backlog[0].epic) {
          backlog.forEach((e, i) => {
            (e.features || []).forEach((f, j) => {
              (f.userStories || []).forEach((s, k) => {
                processCriteria(s.id || `US-${i}-${j}-${k}`, s.title, s.acceptanceCriteria);
              });
            });
          });
        } else {
          backlog.filter(i => i.type === 'USER_STORY').forEach((s, i) => {
            processCriteria(s.id || `US-${i}`, s.title, s.acceptanceCriteria);
          });
        }

        // HARD SAFETY FALLBACK — guarantee at least 1 test case
        if (testCases.length === 0) {
          console.warn("No test cases generated from backlog — fallback triggered");
          testCases.push(
            { id: 'TC-FALLBACK-001', type: 'POSITIVE', story: 'System Validation', steps: ['Verify system responds to valid input'], expectedResult: 'System works correctly', status: 'PENDING', notes: '' },
            { id: 'TC-FALLBACK-002', type: 'NEGATIVE', story: 'System Validation', steps: ['Submit invalid input'], expectedResult: 'System rejects gracefully', status: 'PENDING', notes: '' },
            { id: 'TC-FALLBACK-003', type: 'EDGE', story: 'System Validation', steps: ['Test boundary conditions'], expectedResult: 'System handles edge case', status: 'PENDING', notes: '' }
          );
        }
        
        NexusStore.setTestCases(projectId, testCases);
        console.log("Generated Test Cases:", testCases.length);
        pushEvent(state, 'SYSTEM', `Test Case Generator created ${testCases.length} test cases`);
      }

      // Simulate QA Agent executing test cases
      if (phase.id === 'qa' && typeof NexusStore !== 'undefined') {
        const projectId = getCurrentProjectId();
        const testCases = NexusStore.getTestCases(projectId);
        const isRetest = state.flags && state.flags.isQaRetest;
        pushEvent(state, 'TASK_START', isRetest ? 'QA Agent re-testing previously failed cases' : 'QA Agent started executing test cases');
        
        let index = 0;
        const executeNext = () => {
          if (index >= testCases.length) {
            pushEvent(loadState() || state, 'SYSTEM', 'All test cases executed');
            return;
          }
          const tc = testCases[index];
          
          // Skip already-passed tests
          if (tc.status === 'PASSED') {
            index++;
            executeNext();
            return;
          }

          // Track execution round
          tc.executionRound = (tc.executionRound || 0) + 1;

          tc.status = 'EXECUTING';
          NexusStore.setTestCases(projectId, testCases);
          
          setTimeout(() => {
            let passed = false;
            
            if (tc.executionRound >= 2) {
              // ROUND 2+: Force pass (developer already fixed it)
              passed = true;
              tc.resolved = true;
              tc.resolvedBy = tc.resolvedBy || 'developer';
              tc.notes = 'Fixed and verified on re-test';
            } else {
              // ROUND 1: Random outcome
              passed = Math.random() > 0.3;
              tc.notes = passed ? 'Working as expected' : 'Bug found - incorrect behavior';
            }
            
            tc.status = passed ? 'PASSED' : 'FAILED';
            NexusStore.setTestCases(projectId, testCases);
            index++;
            executeNext();
          }, 3000);
        };
        if (testCases.length > 0) {
          executeNext();
        }
      }
    }

    refreshScrumDashboard(state);
    updateAiPipelineTaskView(state, phase);
  }

  function completeCurrentPhase(state) {
    const phase = PHASES[state.phaseIndex];

    phase.members.forEach((key) => {
      const agent = state.agents[key];
      if (!agent) return;
      setInactive(agent, true, key);
      rotateTask(agent, AGENT_SPECS[key]);
    });

    if (phase.completeEvent) {
      pushEvent(state, 'TASK_COMPLETE', phase.completeEvent);
    }
    if (phase.handoffEvent) {
      pushEvent(state, 'HANDOFF', phase.handoffEvent);
    }

    state.handoffs.unshift({
      id: phase.id + '-' + state.tick,
      from: phase.from,
      to: phase.to,
      input: phase.input,
      output: phase.output,
      timestamp: isoNow()
    });
    if (state.handoffs.length > 24) state.handoffs.length = 24;

    // GENERATE DATA
    const projectId = getCurrentProjectId();
    if (phase.id === 'ai_pipeline') {
      if (typeof NexusStore !== 'undefined') {
        NexusStore.setBacklog(projectId, [
          { id: 'E-AUTH', title: 'User Authentication', type: 'EPIC', module: 'auth', status: 'SPECIFIED', priority: 'MUST_HAVE' },
          { id: 'F-AUTH-1', parentId: 'E-AUTH', title: 'Login', type: 'FEATURE', module: 'auth', status: 'SPECIFIED', priority: 'MUST_HAVE' },
          { id: 'S-AUTH-1', parentId: 'F-AUTH-1', title: 'As a user, I can log in', type: 'USER_STORY', module: 'auth', status: 'SPECIFIED', priority: 'MUST_HAVE', storyPoints: 5,
            acceptanceCriteria: ['User can login with valid email and password', 'System rejects invalid credentials with error message', 'Session token is generated on successful login'] },
          { id: 'S-AUTH-2', parentId: 'F-AUTH-1', title: 'As a user, I can register', type: 'USER_STORY', module: 'auth', status: 'SPECIFIED', priority: 'MUST_HAVE', storyPoints: 8,
            acceptanceCriteria: ['User can register with email, password, and name', 'Duplicate email is rejected', 'Password must meet strength requirements'] },
          { id: 'S-AUTH-3', parentId: 'F-AUTH-1', title: 'As a user, I can reset my password', type: 'USER_STORY', module: 'auth', status: 'SPECIFIED', priority: 'MUST_HAVE', storyPoints: 3,
            acceptanceCriteria: ['Reset link sent to registered email', 'Link expires after 24 hours', 'User can set new password via reset link'] }
        ]);
        const project = NexusStore.getProject(projectId);
        if (project) {
          project.status = 'backlog';
          NexusStore.saveProject(project);
        }
      }
    } else if (phase.id === 'product_owner') {
      if (typeof NexusStore !== 'undefined') {
        const project = NexusStore.getProject(projectId);
        if (project) {
          project.status = 'tasks';
          NexusStore.saveProject(project);
        }
      }
    } else if (phase.id === 'chief_scrum_parallel') {
      if (typeof NexusStore !== 'undefined') {
        const backlog = NexusStore.getBacklog(projectId) || [];
        const tasks = [];
        backlog.forEach((item, i) => {
          if (item.type !== 'USER_STORY') return;
          tasks.push({
            task_id: `TASK-${item.module.toUpperCase()}-${Date.now()}-${i}`,
            title: item.title,
            module: item.module,
            status: "ASSIGNED",
            assignedTo: `module_architect_${item.module}`,
            assignedBy: "scrum_master",
            parentTaskId: null,
            level: "MODULE",
            children: []
          });
        });
        NexusStore.setTasks(projectId, tasks);
      }
    } else if (phase.id === 'module_architects_parallel') {
      if (typeof NexusStore !== 'undefined') {
        const tasks = NexusStore.getTasks(projectId) || [];
        const parentTasks = tasks.filter(t => t.level === 'MODULE');
        parentTasks.forEach(parent => {
          for (let i = 1; i <= 2; i++) {
            const childId = `TASK-${parent.module.toUpperCase()}-DEV-${Date.now()}-${i}-${parent.task_id.slice(-4)}`;
            const child = {
              task_id: childId,
              title: `${parent.title} - Part ${i}`,
              module: parent.module,
              status: "ASSIGNED",
              assignedTo: `developer_${parent.module}_${i}`,
              assignedBy: `module_architect_${parent.module}`,
              parentTaskId: parent.task_id,
              level: "DEV",
              children: []
            };
            parent.children = parent.children || [];
            parent.children.push(child);
            tasks.push(child);
          }
          parent.status = "IN_PROGRESS";
        });
        NexusStore.setTasks(projectId, tasks);
      }
    } else if (phase.id === 'developers_parallel') {
      if (typeof NexusStore !== 'undefined') {
        const tasks = NexusStore.getTasks(projectId) || [];
        const devTasks = tasks.filter(t => t.level === 'DEV');
        devTasks.forEach(task => {
          task.status = "DONE";
          // UPDATE PARENT IF ALL CHILD DONE
          const parent = tasks.find(p => p.task_id === task.parentTaskId);
          if (parent) {
            parent.children = parent.children || [];
            const siblings = tasks.filter(t => t.parentTaskId === parent.task_id);
            if (siblings.every(c => c.status === "DONE")) {
              parent.status = "DONE";
            }
          }
        });
        NexusStore.setTasks(projectId, tasks);
      }
    }
  }

  function updateCurrentPhase(state) {
    const phase = PHASES[state.phaseIndex];

    state.phaseElapsed += 1;

    phase.members.forEach((key) => {
      const agent = state.agents[key];
      if (!agent) return;

      agent.status = 'ACTIVE';
      const maxPhaseDuration = phase.duration || MIN_TASK_SECONDS;
      agent.timerSec = Math.min(state.phaseElapsed, maxPhaseDuration);

      if (agent.stageStatus === 'BLOCKED') return; // don't overwrite blocked

      if (state.phaseElapsed <= 1) agent.stageStatus = 'SPECIFIED';
      else if (state.phaseElapsed < maxPhaseDuration) agent.stageStatus = 'EXECUTING';
      else agent.stageStatus = 'COMPLETED';

      agent.tokens += TOKEN_STEP[key] || 12;
    });

    updateAiPipelineTaskView(state, phase);

    // Controlled escalation: triggers once at tick 14 during developer phase
    if (
      phase.id === 'developers_parallel' &&
      state.phaseElapsed === 14 &&
      !state.flags.escalationRaisedInCycle
    ) {
      triggerEscalation(state);
    }

    // Resolve escalation 4 seconds after raising
    if (
      phase.id === 'developers_parallel' &&
      state.phaseElapsed === 18 &&
      state.flags.escalationRaisedInCycle &&
      !state.flags.escalationResolved
    ) {
      resolveEscalation(state);
    }

    refreshScrumDashboard(state);
  }

  /* ── Tick Engine ── */

  function advanceOneSecond(state) {
    if (typeof NexusStore !== 'undefined') {
      const pid = getCurrentProjectId();
      const currentProject = NexusStore.getProject(pid);
      if (!currentProject || currentProject.status === "CREATED") {
        state.isRunning = false;
        return;
      }
      const reqs = NexusStore.getRequirements(pid);
      if (!reqs || reqs.length === 0) {
        state.isRunning = false;
        return;
      }
    }

    if (state.isRunning === false) return;

    state.tick += 1;

    updateCurrentPhase(state);
    advanceNotificationQueue(state);

    if (state.isRunning && typeof NexusStore !== 'undefined') {
      const projectId = getCurrentProjectId();
      const sessions = NexusStore.getLlmSessions(projectId);
      let changed = false;
      sessions.forEach(s => {
        if (s.status === 'ACTIVE') {
          if (Math.random() > 0.6) {
            const logs = [
              "Loading context window...", "Analyzing schema...", "Extracting parameters...", 
              "Generating code snippet...", "Validating syntax...", "Running local linter...",
              "Cross-referencing rules...", "Reviewing output...", "Finalizing task..."
            ];
            s.logs.push(`> ${logs[Math.floor(Math.random() * logs.length)]}`);
            changed = true;
          }
        }
      });
      if (changed) NexusStore.setLlmSessions(projectId, sessions);
    }

    const phase = PHASES[state.phaseIndex];
    const maxPhaseDuration = phase.duration || MIN_TASK_SECONDS;

    if (state.phaseElapsed >= maxPhaseDuration) {
      completeCurrentPhase(state);

      if (phase.id === 'qa') {
        const projectId = getCurrentProjectId();
        if (typeof NexusStore !== 'undefined') {
          const testCases = NexusStore.getTestCases(projectId) || [];
          const allPassed = testCases.length > 0 && testCases.every(tc => tc.status === 'PASSED');
          
          // Track QA execution rounds
          state.flags.qaExecutionRound = (state.flags.qaExecutionRound || 0) + 1;
          console.log("QA Gate Check — Round:", state.flags.qaExecutionRound, "All Passed:", allPassed);
          
          if (!allPassed && state.flags.qaExecutionRound < 2) {
            // ROUND 1 FAILURE → Escalate (allow ONE retry)
            pushEvent(state, 'ESCALATION', 'QA detected failures. Escalation raised to Module Architects');
            
            const project = NexusStore.getProject(projectId);
            project.escalations = project.escalations || [];
            
            testCases.filter(tc => tc.status !== 'PASSED').forEach((tc, idx) => {
              let mod = 'general';
              const storyText = (tc.story || '').toLowerCase();
              if (storyText.includes('login') || storyText.includes('auth')) mod = 'auth';
              else if (storyText.includes('payment')) mod = 'payments';
              else if (storyText.includes('order')) mod = 'orders';
              
              // Mark which developer will fix this
              tc.resolvedBy = `developer_${mod}`;
              
              project.escalations.push({
                id: `ESC-QA-${Date.now()}-${idx}`,
                testCaseId: tc.id,
                module: mod,
                issue: tc.notes || 'Test failed',
                status: 'OPEN',
                assignedTo: `module_architect_${mod}`
              });
            });
            NexusStore.setTestCases(projectId, testCases);
            NexusStore.saveProject(project);
            
            // Escalate QA LLM session
            const lastEsc = project.escalations[project.escalations.length - 1];
            if (lastEsc) escalateLLMSession('qa', lastEsc.id);

            // JUMP TO MODULE ARCHITECT PHASE for fix cycle
            state.flags.isQaRetest = true;
            state.phaseIndex = PHASES.findIndex(p => p.id === 'module_architects_parallel');
            enterPhase(state);
            return;
          } else if (!allPassed && state.flags.qaExecutionRound >= 2) {
            // ROUND 2+ FAILURE → Force-resolve remaining and proceed to release
            console.log("QA Round 2+ reached — force-passing remaining failures");
            testCases.forEach(tc => {
              if (tc.status !== 'PASSED') {
                tc.status = 'PASSED';
                tc.resolved = true;
                tc.resolvedBy = tc.resolvedBy || 'auto_resolved';
                tc.notes = 'Force-resolved after max retry limit';
              }
            });
            NexusStore.setTestCases(projectId, testCases);
            pushEvent(state, 'SYSTEM', 'QA max retries reached — all cases force-resolved. Proceeding to Release.');
          }
          // allPassed === true OR force-resolved → fall through to normal phase advance (Release)
        }
      }

      if (state.phaseIndex === PHASES.length - 1) {
        // TERMINAL STATE REACHED
        state.isRunning = false;
        
        const projectId = getCurrentProjectId();
        if (typeof NexusStore !== 'undefined') {
          const project = NexusStore.getProject(projectId);
          if (project) {
            project.pipelineProgress = 100;
            project.status = 'DONE';
            project.isRunning = false;
            NexusStore.saveProject(project);
          }
        }
        
        pushEvent(state, 'SYSTEM', 'Project execution completed successfully');
        
        AGENT_ORDER.forEach(key => {
          if (state.agents[key]) {
            state.agents[key].status = 'INACTIVE';
            state.agents[key].stageStatus = 'COMPLETED';
          }
        });
        
        return; // Do not wrap around
      }

      state.phaseIndex = (state.phaseIndex + 1) % PHASES.length;

      if (state.phaseIndex === 0) {
        state.cycle += 1;
        state.flags.escalationRaisedInCycle = false;
        state.flags.escalationResolved = false;
        // Reset all agents for new cycle
        AGENT_ORDER.forEach((key) => {
          const agent = state.agents[key];
          if (agent) {
            agent.stageStatus = 'PENDING';
            agent.status = 'INACTIVE';
            agent.currentAction = 'Awaiting assignment';
            agent.timerSec = 0;
          }
        });
      }

      enterPhase(state);
    }
  }

  /* ── State Init ── */

  function buildInitialState() {
    const agents = {};
    AGENT_ORDER.forEach((key) => {
      agents[key] = createAgentState(key);
    });

    const state = {
      version: VERSION,
      createdAt: isoNow(),
      updatedAt: nowMs(),
      tick: 0,
      cycle: 1,
      phaseIndex: 0,
      phaseElapsed: 0,
      phaseStartedAt: isoNow(),
      agents,
      aiPipelineTasks: [],
      events: [],
      lastEventId: 0,
      handoffs: [],
      escalationRoute: [],
      scrum: {
        activeTasks: [],
        escalations: [],
        monitoring: []
      },
      flags: {
        escalationRaisedInCycle: false,
        escalationResolved: false,
        isQaRetest: false,
        qaExecutionRound: 0
      },
      // Notification queue — only one visible at a time
      notificationQueue: [],
      activeNotification: null,
      notificationTimer: 0,
      isRunning: false
    };

    enterPhase(state);
    return state;
  }

  function ensureState() {
    const state = loadState();
    if (!state || state.version !== VERSION) {
      const fresh = buildInitialState();
      saveState(fresh);
      return fresh;
    }
    return state;
  }

  function catchUp(state) {
    if (state.isRunning === false) return;
    if (typeof NexusStore !== 'undefined') {
      const pid = getCurrentProjectId();
      const currentProject = NexusStore.getProject(pid);
      if (!currentProject || currentProject.status === "CREATED") return;
      const reqs = NexusStore.getRequirements(pid);
      if (!reqs || reqs.length === 0) return;
    }
    const now = nowMs();
    let seconds = Math.floor((now - state.updatedAt) / 1000);
    if (seconds <= 0) return;
    if (seconds > MAX_CATCH_UP_SECONDS) seconds = MAX_CATCH_UP_SECONDS;

    for (let i = 0; i < seconds; i += 1) {
      advanceOneSecond(state);
    }
    state.updatedAt = now;
  }

  let lastPhaseIndex = -1;
  let lastProjectId = null;

  /* ── Public API ── */

  let hasNavigatedToTasks = false;

  function handlePhaseNavigation(phase) {
    let target = null;
    if (phase.id === 'business_analyst') target = 'system-flow.html';
    else if (phase.id === 'ai_pipeline') target = 'pipeline.html';
    else if (phase.id === 'product_owner') target = 'backlog.html';
    // ONLY SCRUM MASTER CAN NAVIGATE
    else if (phase.id === 'chief_scrum_parallel') {
      if (!hasNavigatedToTasks) {
        hasNavigatedToTasks = true;
        target = 'tasks.html';
      }
    }

    if (target && !window.location.pathname.endsWith(target)) {
      window.location.href = target;
    }
  }

  function getSnapshot() {
    const currentProj = getCurrentProjectId();
    if (lastProjectId !== null && lastProjectId !== currentProj) {
      // Project switched, clear state tracking and don't navigate
      lastPhaseIndex = -1;
      lastProjectId = currentProj;
    } else if (lastProjectId === null) {
      lastProjectId = currentProj;
    }

    const state = ensureState();
    catchUp(state);

    if (lastPhaseIndex !== -1 && lastPhaseIndex !== state.phaseIndex) {
      const newPhase = PHASES[state.phaseIndex];
      handlePhaseNavigation(newPhase);
    }
    lastPhaseIndex = state.phaseIndex;

    saveState(state);
    return deepClone(state);
  }

  function restartPipeline() {
    const projectId = getCurrentProjectId();
    if (typeof NexusStore !== 'undefined') {
      const project = NexusStore.getProject(projectId);
      if (project) {
        project.status = 'ACTIVE';
        project.pipelineProgress = 0;
        project.isRunning = true;
        NexusStore.saveProject(project);
      }
    }
    const fresh = buildInitialState();
    saveState(fresh);
  }

  function startPipeline(targetProjectId) {
    // Accept explicit projectId or fall back to sessionStorage
    const projectId = targetProjectId || getCurrentProjectId();
    
    // Force sessionStorage to match so all downstream reads are correct
    sessionStorage.setItem('nexus_selected_project', projectId);
    
    if (typeof NexusStore !== 'undefined') {
      const project = NexusStore.getProject(projectId);
      const reqs = NexusStore.getRequirements(projectId);
      // SAFETY CHECK
      if (!project || !reqs || reqs.length === 0) {
        console.log("startPipeline BLOCKED: no requirements for", projectId);
        return;
      }
      
      // PREVENT MULTIPLE RUNS (check isRunning on orchestration state, not project)
      const existingState = loadState();
      if (existingState && existingState.isRunning === true) {
        console.log("startPipeline BLOCKED: already running for", projectId);
        return;
      }
      
      // UPDATE PROJECT STATE
      project.isRunning = true;
      project.status = 'PIPELINE';
      project.pipelineProgress = 0;
      NexusStore.saveProject(project);
      
      console.log("startPipeline EXECUTING for:", projectId);
    }
    
    // Build fresh orchestration state
    let state = buildInitialState();
    
    state.isRunning = true;
    state.updatedAt = nowMs();
    const phase = PHASES[0]; // business_analyst phase
    
    // RESET ALL AGENTS
    AGENT_ORDER.forEach((key) => {
      const agent = state.agents[key];
      if (agent) {
        agent.status = 'INACTIVE';
        agent.currentAction = 'Awaiting assignment';
      }
    });
    
    // START FIRST AGENT (Business Analyst)
    phase.members.forEach((key) => setActive(state, key, phase));
    if (phase.startEvent) {
      pushEvent(state, 'TASK_START', 'Business Analyst started processing requirements');
    }
    
    console.log("startPipeline: Business Analyst ACTIVATED, state saved");
    saveState(state);
  }

  function getPhases() {
    return deepClone(PHASES);
  }

  function getAgentOrder() {
    return AGENT_ORDER.slice();
  }

  function getAgentById(snapshot, agentId) {
    const source = snapshot || getSnapshot();
    for (let i = 0; i < AGENT_ORDER.length; i += 1) {
      const key = AGENT_ORDER[i];
      const agent = source.agents[key];
      if (agent && agent.agentId === agentId) return deepClone(agent);
    }
    return null;
  }

  function reset() {
    const fresh = buildInitialState();
    saveState(fresh);
    return deepClone(fresh);
  }

  return {
    MIN_TASK_SECONDS,
    getSnapshot,
    getPhases,
    getAgentOrder,
    getAgentById,
    reset,
    restartPipeline,
    startPipeline
  };
})();
