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
      handoffEvent: 'Output passed from Business Analyst → AI Processing Pipeline'
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
      title: 'Chief Architect',
      from: 'Product Owner',
      to: 'Chief Architect + Scrum Master',
      members: ['chiefArchitect'],
      input: ['Approved backlog'],
      output: ['Architecture plan', 'Schema and API baseline'],
      startEvent: 'Chief Architect started designing system architecture',
      completeEvent: 'Architecture baseline ready',
      handoffEvent: 'Output passed from Chief Architect → Scrum Master'
    },
    {
      id: 'chief_scrum_parallel',
      title: 'Chief Architect + Scrum Master (Parallel)',
      from: 'Chief Architect',
      to: 'Module Architects',
      members: ['chiefArchitect', 'scrumMaster'],
      input: ['Architecture baseline', 'Updated requirement notes'],
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
      input: ['Code changes', 'Unit tests'],
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

  /* ── Agent State Helpers ── */

  function setActive(state, key, phase) {
    const agent = state.agents[key];
    if (!agent) return;

    const spec = AGENT_SPECS[key];
    if (key === 'aiPipeline') {
      agent.currentTaskIndex = 0;
    }

    const task = spec.tasks[agent.currentTaskIndex];
    agent.status = 'ACTIVE';
    agent.stageStatus = 'SPECIFIED';
    agent.currentTaskId = task.id;
    agent.currentTaskName = task.title;
    agent.currentAction = task.action;
    agent.timerSec = 0;
    agent.startedAt = isoNow();
    agent.inputData = phase.input.join(', ');
    agent.outputData = phase.output.join(', ');
  }

  function rotateTask(agent, spec) {
    if (!spec.tasks.length) return;
    agent.currentTaskIndex = (agent.currentTaskIndex + 1) % spec.tasks.length;
    const task = spec.tasks[agent.currentTaskIndex];
    agent.currentTaskId = task.id;
    agent.currentTaskName = task.title;
    agent.currentAction = task.action;
  }

  function setInactive(agent, completed) {
    agent.status = 'INACTIVE';
    agent.timerSec = completed ? MIN_TASK_SECONDS : 0;
    agent.stageStatus = completed ? 'COMPLETED' : 'PENDING';
    if (completed) {
      agent.completedTasks += 1;
      agent.completedAt = isoNow();
      agent.currentAction = 'Completed task and awaiting next assignment';
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

    // Activate ONLY current phase members
    phase.members.forEach((key) => setActive(state, key, phase));

    if (phase.startEvent) {
      pushEvent(state, 'TASK_START', phase.startEvent);
    }

    refreshScrumDashboard(state);
    updateAiPipelineTaskView(state, phase);
  }

  function completeCurrentPhase(state) {
    const phase = PHASES[state.phaseIndex];

    phase.members.forEach((key) => {
      const agent = state.agents[key];
      if (!agent) return;
      setInactive(agent, true);
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
          { id: 'S-AUTH-1', parentId: 'F-AUTH-1', title: 'As a user, I can log in', type: 'USER_STORY', module: 'auth', status: 'SPECIFIED', priority: 'MUST_HAVE', storyPoints: 5 },
          { id: 'S-AUTH-2', parentId: 'F-AUTH-1', title: 'As a user, I can register', type: 'USER_STORY', module: 'auth', status: 'SPECIFIED', priority: 'MUST_HAVE', storyPoints: 8 },
          { id: 'S-AUTH-3', parentId: 'F-AUTH-1', title: 'As a user, I can reset my password', type: 'USER_STORY', module: 'auth', status: 'SPECIFIED', priority: 'MUST_HAVE', storyPoints: 3 }
        ]);
        const project = NexusStore.getProject(projectId);
        if (project) {
          project.status = 'backlog';
          NexusStore.saveProject(project);
        }
      }
    } else if (phase.id === 'product_owner') {
      if (typeof NexusStore !== 'undefined') {
        NexusStore.setTasks(projectId, [
          { task_id: "TASK-AUTH-101", module: "auth", status: "SPECIFIED", title: "Create login API", assignedTo: "agent_dev_auth_01" },
          { task_id: "TASK-AUTH-102", module: "auth", status: "SPECIFIED", title: "Build registration flow", assignedTo: "agent_dev_auth_02" },
          { task_id: "TASK-PAY-201", module: "payments", status: "SPECIFIED", title: "Integrate payment gateway", assignedTo: "agent_dev_pay_01" }
        ]);
        const project = NexusStore.getProject(projectId);
        if (project) {
          project.status = 'tasks';
          NexusStore.saveProject(project);
        }
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
    if (state.isRunning === false) return;

    state.tick += 1;

    updateCurrentPhase(state);
    advanceNotificationQueue(state);

    const phase = PHASES[state.phaseIndex];
    const maxPhaseDuration = phase.duration || MIN_TASK_SECONDS;

    if (state.phaseElapsed >= maxPhaseDuration) {
      completeCurrentPhase(state);

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
        escalationResolved: false
      },
      // Notification queue — only one visible at a time
      notificationQueue: [],
      activeNotification: null,
      notificationTimer: 0,
      isRunning: true
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

  function handlePhaseNavigation(phase) {
    let target = null;
    if (phase.id === 'business_analyst') target = 'system-flow.html';
    else if (phase.id === 'ai_pipeline') target = 'pipeline.html';
    else if (phase.id === 'product_owner') target = 'backlog.html';
    else if (phase.id === 'chief_scrum_parallel' || phase.id === 'module_architects_parallel' || phase.id === 'developers_parallel') target = 'tasks.html';

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
    restartPipeline
  };
})();
