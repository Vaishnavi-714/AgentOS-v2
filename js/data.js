// NEXUS Seed Data — structured dummy data for the entire system
function seedNexusData() {
  if (NexusStore.isSeeded()) {
    ensureNexusExtensionData();
    return;
  }

  // --- Users ---
  NexusStore.set('users', [
    { id: 'user_001', username: 'admin', password: 'admin123', name: 'Alex Morgan', role: 'Human Orchestrator', avatar: '👤' },
    { id: 'user_002', username: 'pm', password: 'pm123', name: 'Sarah Chen', role: 'Product Manager', avatar: '👩‍💼' }
  ]);

  // --- Projects ---
  const projects = [
    {
      id: 'proj_001', name: 'E-Commerce Platform', description: 'Full-stack e-commerce solution with auth, payments, orders, and inventory management',
      domain: 'E-Commerce', techStack: ['Node.js', 'React', 'PostgreSQL', 'Redis'],
      status: 'ACTIVE', pipelineStatus: 'COMPLETED', createdAt: '2024-01-10T09:00:00Z', updatedAt: '2024-01-15T15:00:00Z',
      modules: ['auth', 'payments', 'orders', 'inventory', 'notifications'],
      createdBy: 'user_001',
      testCases: []
    },
    {
      id: 'proj_002', name: 'Healthcare Portal', description: 'Patient management system with appointment scheduling and telemedicine',
      domain: 'Healthcare', techStack: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      status: 'IN_PROGRESS', pipelineStatus: 'STAGE_6', createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-02-05T11:00:00Z',
      modules: ['patients', 'appointments', 'telemedicine', 'billing'],
      createdBy: 'user_001',
      testCases: []
    }
  ];
  NexusStore.setProjects(projects);

  // --- Pipeline for proj_001 (completed) ---
  NexusStore.setPipeline('proj_001', {
    projectId: 'proj_001', status: 'COMPLETED', currentStage: 13,
    stages: [
      { stage: 1, name: 'Load Raw Sources', status: 'COMPLETED', startedAt: '2024-01-10T09:05:00Z', completedAt: '2024-01-10T09:06:00Z', logs: ['Loaded 3 source files', 'Validated formats: PDF, TXT, transcript'] },
      { stage: 2, name: 'Normalize Text via AI', status: 'COMPLETED', startedAt: '2024-01-10T09:06:00Z', completedAt: '2024-01-10T09:08:00Z', logs: ['Language standardized', 'Ambiguities flagged: 4', 'OCR corrections applied: 2'] },
      { stage: 3, name: 'Extract Text from Files', status: 'COMPLETED', startedAt: '2024-01-10T09:08:00Z', completedAt: '2024-01-10T09:10:00Z', logs: ['PDF parsed successfully', 'TXT loaded', 'Transcript structured'] },
      { stage: 4, name: 'Merge & Clean Text', status: 'COMPLETED', startedAt: '2024-01-10T09:10:00Z', completedAt: '2024-01-10T09:12:00Z', logs: ['Deduplicated 3 overlapping sections', 'Consolidated into unified document'] },
      { stage: 5, name: 'Chunk Text', status: 'COMPLETED', startedAt: '2024-01-10T09:12:00Z', completedAt: '2024-01-10T09:13:00Z', logs: ['Generated 24 semantic chunks', 'Average chunk size: 312 tokens'] },
      { stage: 6, name: 'Extract Requirements (AI + Fallback)', status: 'COMPLETED', startedAt: '2024-01-10T09:13:00Z', completedAt: '2024-01-10T09:18:00Z', logs: ['AI extraction: 47 requirements found', 'Fallback rules applied: 3 additional', 'Total: 50 raw requirements'] },
      { stage: 7, name: 'Exact Deduplication', status: 'COMPLETED', startedAt: '2024-01-10T09:18:00Z', completedAt: '2024-01-10T09:19:00Z', logs: ['Hash comparison complete', 'Removed 5 exact duplicates', 'Remaining: 45 requirements'] },
      { stage: 8, name: 'Semantic Deduplication', status: 'COMPLETED', startedAt: '2024-01-10T09:19:00Z', completedAt: '2024-01-10T09:22:00Z', logs: ['Embedding similarity threshold: 0.92', 'Removed 7 semantic duplicates', 'Final count: 38 requirements'] },
      { stage: 9, name: 'Store Requirements in DB', status: 'COMPLETED', startedAt: '2024-01-10T09:22:00Z', completedAt: '2024-01-10T09:23:00Z', logs: ['38 requirements persisted', 'Metadata attached', 'Confidence scores calculated'] },
      { stage: 10, name: 'Generate Backlog', status: 'COMPLETED', startedAt: '2024-01-10T09:23:00Z', completedAt: '2024-01-10T09:28:00Z', logs: ['Generated 5 Epics', 'Generated 12 Features', 'Generated 38 User Stories', 'Acceptance criteria attached'] },
      { stage: 11, name: 'Apply MoSCoW + Story Sizing', status: 'COMPLETED', startedAt: '2024-01-10T09:28:00Z', completedAt: '2024-01-10T09:30:00Z', logs: ['Must Have: 15, Should Have: 12, Could Have: 8, Won\'t Have: 3', 'Story points assigned (Fibonacci)'] },
      { stage: 12, name: 'Store Backlog Embeddings', status: 'COMPLETED', startedAt: '2024-01-10T09:30:00Z', completedAt: '2024-01-10T09:31:00Z', logs: ['Vector storage complete', '38 embeddings generated', 'Semantic retrieval index built'] },
      { stage: 13, name: 'Finalize Pipeline & Update Status', status: 'COMPLETED', startedAt: '2024-01-10T09:31:00Z', completedAt: '2024-01-10T09:32:00Z', logs: ['Pipeline marked COMPLETE', 'Agents notified', 'Execution phase unlocked'] }
    ]
  });

  // --- Pipeline for proj_002 (in progress) ---
  NexusStore.setPipeline('proj_002', {
    projectId: 'proj_002', status: 'IN_PROGRESS', currentStage: 6,
    stages: [
      { stage: 1, name: 'Load Raw Sources', status: 'COMPLETED', startedAt: '2024-02-01T10:05:00Z', completedAt: '2024-02-01T10:06:00Z', logs: ['Loaded 2 source files'] },
      { stage: 2, name: 'Normalize Text via AI', status: 'COMPLETED', startedAt: '2024-02-01T10:06:00Z', completedAt: '2024-02-01T10:08:00Z', logs: ['Language standardized'] },
      { stage: 3, name: 'Extract Text from Files', status: 'COMPLETED', startedAt: '2024-02-01T10:08:00Z', completedAt: '2024-02-01T10:10:00Z', logs: ['PDF parsed'] },
      { stage: 4, name: 'Merge & Clean Text', status: 'COMPLETED', startedAt: '2024-02-01T10:10:00Z', completedAt: '2024-02-01T10:12:00Z', logs: ['Consolidated'] },
      { stage: 5, name: 'Chunk Text', status: 'COMPLETED', startedAt: '2024-02-01T10:12:00Z', completedAt: '2024-02-01T10:13:00Z', logs: ['18 chunks generated'] },
      { stage: 6, name: 'Extract Requirements (AI + Fallback)', status: 'IN_PROGRESS', startedAt: '2024-02-01T10:13:00Z', completedAt: null, logs: ['AI extraction in progress...'] },
      { stage: 7, name: 'Exact Deduplication', status: 'PENDING', startedAt: null, completedAt: null, logs: [] },
      { stage: 8, name: 'Semantic Deduplication', status: 'PENDING', startedAt: null, completedAt: null, logs: [] },
      { stage: 9, name: 'Store Requirements in DB', status: 'PENDING', startedAt: null, completedAt: null, logs: [] },
      { stage: 10, name: 'Generate Backlog', status: 'PENDING', startedAt: null, completedAt: null, logs: [] },
      { stage: 11, name: 'Apply MoSCoW + Story Sizing', status: 'PENDING', startedAt: null, completedAt: null, logs: [] },
      { stage: 12, name: 'Store Backlog Embeddings', status: 'PENDING', startedAt: null, completedAt: null, logs: [] },
      { stage: 13, name: 'Finalize Pipeline & Update Status', status: 'PENDING', startedAt: null, completedAt: null, logs: [] }
    ]
  });

  // --- Requirements for proj_001 ---
  NexusStore.setRequirements('proj_001', [
    { id: 'REQ-001', text: 'Users must be able to register with email and password', type: 'FUNCTIONAL', module: 'auth', confidence: 0.95, source: 'requirements.pdf', priority: 'MUST_HAVE' },
    { id: 'REQ-002', text: 'System must support OAuth 2.0 login with Google and GitHub', type: 'FUNCTIONAL', module: 'auth', confidence: 0.92, source: 'requirements.pdf', priority: 'MUST_HAVE' },
    { id: 'REQ-003', text: 'JWT tokens must expire after 15 minutes with refresh token rotation', type: 'FUNCTIONAL', module: 'auth', confidence: 0.98, source: 'meeting_transcript.txt', priority: 'MUST_HAVE' },
    { id: 'REQ-004', text: 'Payment processing must support Stripe and PayPal', type: 'FUNCTIONAL', module: 'payments', confidence: 0.96, source: 'requirements.pdf', priority: 'MUST_HAVE' },
    { id: 'REQ-005', text: 'Order status must update in real-time via WebSocket', type: 'FUNCTIONAL', module: 'orders', confidence: 0.88, source: 'meeting_transcript.txt', priority: 'SHOULD_HAVE' },
    { id: 'REQ-006', text: 'Inventory must sync with external ERP systems', type: 'FUNCTIONAL', module: 'inventory', confidence: 0.85, source: 'requirements.pdf', priority: 'COULD_HAVE' },
    { id: 'REQ-007', text: 'System must handle 10,000 concurrent users', type: 'NON_FUNCTIONAL', module: 'system', confidence: 0.90, source: 'requirements.pdf', priority: 'MUST_HAVE' },
    { id: 'REQ-008', text: 'All PII data must be encrypted at rest and in transit', type: 'CONSTRAINT', module: 'system', confidence: 0.99, source: 'requirements.pdf', priority: 'MUST_HAVE' },
    { id: 'REQ-009', text: 'Email notifications for order confirmation and shipping updates', type: 'FUNCTIONAL', module: 'notifications', confidence: 0.93, source: 'requirements.pdf', priority: 'SHOULD_HAVE' },
    { id: 'REQ-010', text: 'Admin dashboard for managing products and viewing analytics', type: 'FUNCTIONAL', module: 'orders', confidence: 0.87, source: 'meeting_transcript.txt', priority: 'SHOULD_HAVE' }
  ]);

  // --- Backlog for proj_001 ---
  NexusStore.setBacklog('proj_001', [
    { id: 'EPIC-001', type: 'EPIC', title: 'User Authentication & Authorization', module: 'auth', priority: 'MUST_HAVE', status: 'IN_PROGRESS', children: ['FEAT-001', 'FEAT-002'] },
    { id: 'EPIC-002', type: 'EPIC', title: 'Payment Processing', module: 'payments', priority: 'MUST_HAVE', status: 'SPECIFIED', children: ['FEAT-003'] },
    { id: 'EPIC-003', type: 'EPIC', title: 'Order Management', module: 'orders', priority: 'MUST_HAVE', status: 'SPECIFIED', children: ['FEAT-004', 'FEAT-005'] },
    { id: 'FEAT-001', type: 'FEATURE', title: 'Email/Password Registration & Login', parentId: 'EPIC-001', module: 'auth', priority: 'MUST_HAVE', status: 'IN_PROGRESS', children: ['US-001', 'US-002', 'US-003'] },
    { id: 'FEAT-002', type: 'FEATURE', title: 'OAuth Integration', parentId: 'EPIC-001', module: 'auth', priority: 'MUST_HAVE', status: 'SPECIFIED', children: ['US-004', 'US-005'] },
    { id: 'FEAT-003', type: 'FEATURE', title: 'Stripe & PayPal Integration', parentId: 'EPIC-002', module: 'payments', priority: 'MUST_HAVE', status: 'SPECIFIED', children: ['US-006', 'US-007'] },
    { id: 'FEAT-004', type: 'FEATURE', title: 'Order Lifecycle Management', parentId: 'EPIC-003', module: 'orders', priority: 'MUST_HAVE', status: 'SPECIFIED', children: ['US-008', 'US-009'] },
    { id: 'FEAT-005', type: 'FEATURE', title: 'Real-time Order Updates', parentId: 'EPIC-003', module: 'orders', priority: 'SHOULD_HAVE', status: 'SPECIFIED', children: ['US-010'] },
    { id: 'US-001', type: 'USER_STORY', title: 'As a user, I want to register with email and password', parentId: 'FEAT-001', module: 'auth', priority: 'MUST_HAVE', storyPoints: 5, size: 'M', status: 'DONE', acceptanceCriteria: ['Email validation', 'Password strength check', 'Confirmation email sent'] },
    { id: 'US-002', type: 'USER_STORY', title: 'As a user, I want to login with my credentials', parentId: 'FEAT-001', module: 'auth', priority: 'MUST_HAVE', storyPoints: 3, size: 'S', status: 'IN_PROGRESS', acceptanceCriteria: ['JWT token issued', 'Invalid credentials error', 'Rate limiting'] },
    { id: 'US-003', type: 'USER_STORY', title: 'As a user, I want my session to refresh automatically', parentId: 'FEAT-001', module: 'auth', priority: 'MUST_HAVE', storyPoints: 8, size: 'L', status: 'SPECIFIED', acceptanceCriteria: ['Token rotates on use', 'Old token invalidated', 'Audit log updated'] },
    { id: 'US-004', type: 'USER_STORY', title: 'As a user, I want to login with Google OAuth', parentId: 'FEAT-002', module: 'auth', priority: 'MUST_HAVE', storyPoints: 5, size: 'M', status: 'SPECIFIED', acceptanceCriteria: ['Google OAuth flow', 'Account linking', 'Profile sync'] },
    { id: 'US-005', type: 'USER_STORY', title: 'As a user, I want to login with GitHub OAuth', parentId: 'FEAT-002', module: 'auth', priority: 'MUST_HAVE', storyPoints: 5, size: 'M', status: 'SPECIFIED', acceptanceCriteria: ['GitHub OAuth flow', 'Account linking'] },
    { id: 'US-006', type: 'USER_STORY', title: 'As a customer, I want to pay with Stripe', parentId: 'FEAT-003', module: 'payments', priority: 'MUST_HAVE', storyPoints: 8, size: 'L', status: 'SPECIFIED', acceptanceCriteria: ['Stripe checkout', 'Payment confirmation', 'Receipt email'] },
    { id: 'US-007', type: 'USER_STORY', title: 'As a customer, I want to pay with PayPal', parentId: 'FEAT-003', module: 'payments', priority: 'MUST_HAVE', storyPoints: 8, size: 'L', status: 'SPECIFIED', acceptanceCriteria: ['PayPal integration', 'Redirect flow', 'Payment confirmation'] },
    { id: 'US-008', type: 'USER_STORY', title: 'As a customer, I want to place an order', parentId: 'FEAT-004', module: 'orders', priority: 'MUST_HAVE', storyPoints: 5, size: 'M', status: 'SPECIFIED', acceptanceCriteria: ['Cart checkout', 'Order confirmation', 'Inventory deduction'] },
    { id: 'US-009', type: 'USER_STORY', title: 'As an admin, I want to manage order statuses', parentId: 'FEAT-004', module: 'orders', priority: 'MUST_HAVE', storyPoints: 3, size: 'S', status: 'SPECIFIED', acceptanceCriteria: ['Status transitions', 'History log', 'Notification trigger'] },
    { id: 'US-010', type: 'USER_STORY', title: 'As a customer, I want real-time order tracking', parentId: 'FEAT-005', module: 'orders', priority: 'SHOULD_HAVE', storyPoints: 13, size: 'XL', status: 'SPECIFIED', acceptanceCriteria: ['WebSocket connection', 'Live status updates', 'Map integration'] }
  ]);

  // --- Agents ---
  const agents = [
    {
      agent_id: 'agent_ba_001', agent_name: 'Business Analyst', created_by: 'human_orchestrator', role: 'business_analyst', module_scope: 'global',
      model_provider: 'anthropic_claude', model_variant: 'claude-3-opus', status: 'ACTIVE', lifecycle: 'ACTIVE',
      skills: ['analyze_requirements', 'stakeholder_mapping', 'ambiguity_detection', 'domain_analysis'],
      ceiling_profile: { can_autonomously: ['analyze_requirements', 'flag_ambiguities', 'create_requirement_docs'], must_escalate: ['scope_changes', 'conflicting_requirements'], strictly_forbidden: ['modify_backlog', 'assign_tasks'], risk_sensitivity: 'MEDIUM' },
      metrics: { tasks_completed: 24, escalations_raised: 5, gate_pass_rate: 94 }, createdAt: '2024-01-09T08:00:00Z'
    },
    {
      agent_id: 'agent_pm_001', agent_name: 'Product Manager', created_by: 'human_orchestrator', role: 'product_manager', module_scope: 'global',
      model_provider: 'openai_gpt', model_variant: 'gpt-4o', status: 'ACTIVE', lifecycle: 'ACTIVE',
      skills: ['backlog_management', 'sprint_planning', 'priority_assignment', 'stakeholder_communication'],
      ceiling_profile: { can_autonomously: ['prioritize_stories', 'plan_sprints', 'update_backlog'], must_escalate: ['scope_changes', 'resource_reallocation'], strictly_forbidden: ['architecture_decisions', 'code_changes'], risk_sensitivity: 'MEDIUM' },
      metrics: { tasks_completed: 31, escalations_raised: 3, gate_pass_rate: 97 }, createdAt: '2024-01-09T08:00:00Z'
    },
    {
      agent_id: 'agent_po_001', agent_name: 'Product Owner', created_by: 'human_orchestrator', role: 'product_owner', module_scope: 'global',
      model_provider: 'openai_gpt', model_variant: 'gpt-4o', status: 'ACTIVE', lifecycle: 'ACTIVE',
      skills: ['story_acceptance', 'story_rejection', 'priority_decisions'],
      ceiling_profile: { can_autonomously: ['accept_stories', 'reject_stories', 'reprioritize'], must_escalate: ['epic_cancellation', 'major_scope_change'], strictly_forbidden: ['code_changes', 'architecture_decisions'], risk_sensitivity: 'LOW' },
      metrics: { tasks_completed: 18, escalations_raised: 2, gate_pass_rate: 100 }, createdAt: '2024-01-09T08:00:00Z'
    },
    {
      agent_id: 'agent_tcg_001', agent_name: 'Test Case Generator Agent', created_by: 'human_orchestrator', role: 'test_case_generator', module_scope: 'global',
      model_provider: 'openai_gpt', model_variant: 'gpt-4o', status: 'ACTIVE', lifecycle: 'ACTIVE',
      skills: ['extract_acceptance_criteria', 'generate_positive_tests', 'generate_negative_tests', 'generate_edge_tests'],
      ceiling_profile: { can_autonomously: ['create_test_cases', 'structure_test_data', 'update_test_case_status'], must_escalate: ['acceptance_criteria_conflicts'], strictly_forbidden: ['modify_implementation', 'change_backlog_priority'], risk_sensitivity: 'LOW' },
      metrics: { tasks_completed: 14, escalations_raised: 1, gate_pass_rate: 100 }, createdAt: '2024-01-09T08:00:00Z'
    },
    {
      agent_id: 'agent_sm_001', agent_name: 'Scrum Master', created_by: 'human_orchestrator', role: 'scrum_master', module_scope: 'global',
      model_provider: 'openai_gpt', model_variant: 'gpt-4o', status: 'ACTIVE', lifecycle: 'ACTIVE',
      skills: ['sprint_health_monitoring', 'velocity_tracking', 'impediment_escalation'],
      ceiling_profile: { can_autonomously: ['track_velocity', 'report_health', 'flag_blockers'], must_escalate: ['sprint_cancellation', 'team_changes'], strictly_forbidden: ['code_changes', 'backlog_changes'], risk_sensitivity: 'LOW' },
      metrics: { tasks_completed: 15, escalations_raised: 4, gate_pass_rate: 100 }, createdAt: '2024-01-09T08:00:00Z'
    },
    {
      agent_id: 'agent_chief_arch_001', agent_name: 'Chief / Solution Architect', created_by: 'human_orchestrator', role: 'chief_architect', module_scope: 'global',
      model_provider: 'anthropic_claude', model_variant: 'claude-3-opus', status: 'ACTIVE', lifecycle: 'ACTIVE',
      skills: ['system_architecture', 'module_design', 'tech_stack_decisions', 'api_contract_design', 'release_decisions'],
      ceiling_profile: { can_autonomously: ['design_architecture', 'define_modules', 'select_tech_stack', 'define_api_contracts'], must_escalate: ['infrastructure_changes', 'security_architecture', 'budget_impacting_decisions'], strictly_forbidden: ['production_deployment', 'data_deletion'], risk_sensitivity: 'HIGH' },
      metrics: { tasks_completed: 12, escalations_raised: 2, gate_pass_rate: 92 }, createdAt: '2024-01-09T08:00:00Z'
    },
    {
      agent_id: 'agent_mod_arch_auth', agent_name: 'Module Architect - Auth', created_by: 'human_orchestrator', role: 'module_architect', module_scope: 'auth',
      model_provider: 'anthropic_claude', model_variant: 'claude-3-opus', status: 'ACTIVE', lifecycle: 'EXECUTING',
      skills: ['design_module_architecture', 'create_task_breakdown', 'review_dev_output', 'mock_api_specs'],
      ceiling_profile: { can_autonomously: ['design_module', 'break_down_tasks', 'review_code', 'create_mocks'], must_escalate: ['modify_data_model', 'change_api_contract', 'add_dependency'], strictly_forbidden: ['cross_module_writes', 'production_db_access', 'security_config_changes'], risk_sensitivity: 'HIGH' },
      metrics: { tasks_completed: 8, escalations_raised: 3, gate_pass_rate: 91 }, createdAt: '2024-01-10T10:00:00Z'
    },
    {
      agent_id: 'agent_mod_arch_payments', agent_name: 'Module Architect - Payments', created_by: 'human_orchestrator', role: 'module_architect', module_scope: 'payments',
      model_provider: 'anthropic_claude', model_variant: 'claude-3-opus', status: 'ACTIVE', lifecycle: 'ACTIVE',
      skills: ['design_module_architecture', 'create_task_breakdown', 'review_dev_output'],
      ceiling_profile: { can_autonomously: ['design_module', 'break_down_tasks', 'review_code'], must_escalate: ['modify_data_model', 'change_api_contract', 'add_dependency'], strictly_forbidden: ['cross_module_writes', 'production_db_access'], risk_sensitivity: 'HIGH' },
      metrics: { tasks_completed: 4, escalations_raised: 1, gate_pass_rate: 100 }, createdAt: '2024-01-10T10:00:00Z'
    },
    {
      agent_id: 'agent_mod_arch_orders', agent_name: 'Module Architect - Orders', created_by: 'human_orchestrator', role: 'module_architect', module_scope: 'orders',
      model_provider: 'anthropic_claude', model_variant: 'claude-3-opus', status: 'ACTIVE', lifecycle: 'ACTIVE',
      skills: ['design_module_architecture', 'create_task_breakdown', 'review_dev_output'],
      ceiling_profile: { can_autonomously: ['design_module', 'break_down_tasks', 'review_code'], must_escalate: ['modify_data_model', 'change_api_contract'], strictly_forbidden: ['cross_module_writes', 'production_db_access'], risk_sensitivity: 'HIGH' },
      metrics: { tasks_completed: 3, escalations_raised: 0, gate_pass_rate: 100 }, createdAt: '2024-01-10T10:00:00Z'
    },
    {
      agent_id: 'agent_dev_auth_01', agent_name: 'Developer Agent - Auth 01', created_by: 'agent_mod_arch_auth', role: 'developer', module_scope: 'auth',
      model_provider: 'anthropic_claude', model_variant: 'claude-3-opus', status: 'ACTIVE', lifecycle: 'EXECUTING',
      skills: ['write_code', 'run_unit_tests', 'create_mock_apis', 'task_reports'],
      ceiling_profile: { can_autonomously: ['write_code', 'run_unit_tests', 'create_mock_apis'], must_escalate: ['modify_data_model', 'change_api_contract', 'add_dependency'], strictly_forbidden: ['cross_module_writes', 'production_db_access', 'security_config_changes'], risk_sensitivity: 'HIGH' },
      metrics: { tasks_completed: 6, escalations_raised: 2, gate_pass_rate: 88 }, createdAt: '2024-01-11T09:00:00Z'
    },
    {
      agent_id: 'agent_dev_auth_02', agent_name: 'Developer Agent - Auth 02', created_by: 'agent_mod_arch_auth', role: 'developer', module_scope: 'auth',
      model_provider: 'openai_gpt', model_variant: 'gpt-4o', status: 'ACTIVE', lifecycle: 'EXECUTING',
      skills: ['write_code', 'run_unit_tests', 'create_mock_apis'],
      ceiling_profile: { can_autonomously: ['write_code', 'run_unit_tests', 'create_mock_apis'], must_escalate: ['modify_data_model', 'change_api_contract', 'add_dependency'], strictly_forbidden: ['cross_module_writes', 'production_db_access', 'security_config_changes'], risk_sensitivity: 'HIGH' },
      metrics: { tasks_completed: 5, escalations_raised: 1, gate_pass_rate: 90 }, createdAt: '2024-01-11T09:00:00Z'
    },
    {
      agent_id: 'agent_dev_auth_03', agent_name: 'Developer Agent - Auth 03', created_by: 'agent_mod_arch_auth', role: 'developer', module_scope: 'auth',
      model_provider: 'openai_gpt', model_variant: 'gpt-4o', status: 'BLOCKED', lifecycle: 'EXECUTING',
      skills: ['write_code', 'run_unit_tests', 'create_mock_apis'],
      ceiling_profile: { can_autonomously: ['write_code', 'run_unit_tests', 'create_mock_apis'], must_escalate: ['modify_data_model', 'change_api_contract', 'add_dependency'], strictly_forbidden: ['cross_module_writes', 'production_db_access', 'security_config_changes'], risk_sensitivity: 'HIGH' },
      metrics: { tasks_completed: 4, escalations_raised: 3, gate_pass_rate: 85 }, createdAt: '2024-01-11T09:00:00Z'
    },
    {
      agent_id: 'agent_int_arch_001', agent_name: 'Integration Architect', created_by: 'human_orchestrator', role: 'integration_architect', module_scope: 'global',
      model_provider: 'anthropic_claude', model_variant: 'claude-3-opus', status: 'ACTIVE', lifecycle: 'ACTIVE',
      skills: ['cross_module_integration', 'dependency_resolution', 'integration_testing', 'contract_validation'],
      ceiling_profile: { can_autonomously: ['integrate_modules', 'resolve_dependencies', 'run_integration_tests'], must_escalate: ['contract_violations', 'incompatible_changes'], strictly_forbidden: ['production_deployment', 'security_config_changes'], risk_sensitivity: 'HIGH' },
      metrics: { tasks_completed: 7, escalations_raised: 2, gate_pass_rate: 95 }, createdAt: '2024-01-09T08:00:00Z'
    },
    {
      agent_id: 'agent_qa_001', agent_name: 'QA Agent', created_by: 'human_orchestrator', role: 'qa', module_scope: 'global',
      model_provider: 'openai_gpt', model_variant: 'gpt-4o', status: 'ACTIVE', lifecycle: 'ACTIVE',
      skills: ['test_case_generation', 'test_execution', 'coverage_reporting', 'defect_reporting'],
      ceiling_profile: { can_autonomously: ['generate_tests', 'execute_tests', 'report_coverage', 'file_defects'], must_escalate: ['test_environment_changes', 'acceptance_criteria_disputes'], strictly_forbidden: ['modify_implementation', 'access_code_artifacts'], risk_sensitivity: 'MEDIUM' },
      metrics: { tasks_completed: 20, escalations_raised: 1, gate_pass_rate: 98 }, createdAt: '2024-01-09T08:00:00Z'
    },
    {
      agent_id: 'agent_secdevops_001', agent_name: 'Security / DevOps Agent', created_by: 'human_orchestrator', role: 'security_devops', module_scope: 'global',
      model_provider: 'anthropic_claude', model_variant: 'claude-3-opus', status: 'ACTIVE', lifecycle: 'ACTIVE',
      skills: ['vulnerability_scanning', 'cicd_pipeline', 'deployment_packaging', 'compliance_checking'],
      ceiling_profile: { can_autonomously: ['scan_vulnerabilities', 'build_pipeline', 'package_deployment'], must_escalate: ['security_impacting_changes', 'infrastructure_violations', 'compliance_failures'], strictly_forbidden: ['production_deployment_without_approval', 'disable_security_controls'], risk_sensitivity: 'CRITICAL' },
      metrics: { tasks_completed: 9, escalations_raised: 4, gate_pass_rate: 100 }, createdAt: '2024-01-09T08:00:00Z'
    }
  ];
  NexusStore.setAgents(agents);

  // --- Agent Workspace Files ---
  const workspaces = {
    'agent_mod_arch_auth': {
      'skills': '# SKILLS\n\n## Core Responsibilities\n- Design module architecture for Authentication module\n- Break down PBIs into developer tasks\n- Validate developer outputs against design specs\n- Create and maintain mock API specifications\n\n## Domain Knowledge\n- JWT-based authentication systems\n- OAuth 2.0 / OpenID Connect flows\n- Session management and token rotation\n- Password hashing (bcrypt, argon2)\n- Role-based access control (RBAC)\n\n## Constraints\n- Must follow existing system architecture decisions\n- Cannot redefine system-wide API contracts\n- All design decisions must reference Decision Ledger\n\n## Escalation Awareness\n- Schema changes → escalate to Chief Architect\n- Cross-module dependencies → escalate to Integration Architect\n- Security-impacting changes → escalate to Security Agent',
      'tools': '# TOOLS\n\n## Available Tools\n- code_generator — Generate boilerplate and implementation code\n- api_mock_builder — Create mock API endpoints for testing\n- test_stub_creator — Generate unit test stubs\n- architecture_diagrammer — Create module architecture diagrams\n\n## External Integrations\n- GitHub — Code repository management\n- Local CLI (Cursor) — External coding tools\n- Postman — API testing and documentation\n\n## Tool Usage Rules\n- Cannot deploy directly to production\n- Cannot modify production infrastructure\n- Cannot access other modules\' code repositories\n- Must log all tool invocations to heartbeat',
      'heartbeat': '# HEARTBEAT\n\n## Current Tasks\n- TASK-AUTH-047 → In Progress (Implement refresh token rotation)\n- TASK-AUTH-052 → Blocked (Waiting on escalation ESC-2024-0047)\n- TASK-AUTH-053 → Assigned (OAuth Google integration design)\n\n## Last Actions\n- Generated API contract for POST /auth/refresh endpoint\n- Raised escalation ESC-2024-0047 for schema change approval\n- Reviewed dev output for TASK-AUTH-041 — approved with minor changes\n- Updated mock API specs for token validation\n\n## Status\nACTIVE\n\n## Performance Metrics\n- Tasks completed: 8\n- Escalations raised: 3\n- Gate pass rate: 91%\n- Average task completion time: 2.3 hours',
      'souls': '# SOUL\n\n## Decision References\n- DEC-2024-0089 → Schema changes require migration scripts with rollback steps\n- DEC-2024-0031 → Prefer JWT-based auth patterns across all modules\n- DEC-2024-0044 → OAuth tokens stored in httpOnly secure cookies\n- DEC-2024-0055 → Rate limiting required on all auth endpoints\n\n## Behavioral Traits\n- Risk-aware and cautious with data model changes\n- Favors backward compatibility over performance shortcuts\n- Avoids unnecessary complexity in auth flows\n- Prioritizes security over convenience\n\n## Learned Patterns\n- Prefer extending existing tables over creating new ones for auth data\n- Follow JWT-based auth patterns consistently across system\n- Always include rollback steps in migration scripts\n- Token rotation must invalidate previous tokens atomically\n- Rate limiting should be applied before authentication logic\n\n## Collaboration Style\n- Strict and precise with Developer Agents — clear task specs\n- Transparent and structured in escalation reports\n- Deferential to Chief Architect on system-wide decisions\n- Proactive in flagging potential cross-module impacts'
    },
    'agent_dev_auth_01': {
      'skills': '# SKILLS\n\n## Core Responsibilities\n- Implement assigned coding tasks within Auth module\n- Write unit tests for all implemented features\n- Create mock APIs for integration testing\n- Report task completion with test results\n\n## Domain Knowledge\n- Node.js / Express backend development\n- JWT implementation and validation\n- Password hashing with bcrypt\n- Unit testing with Jest\n\n## Constraints\n- Must work within Auth module boundaries only\n- Cannot modify data models without escalation\n- Must follow API contracts defined by Module Architect\n\n## Escalation Awareness\n- Schema changes → escalate\n- API contract changes → escalate\n- New dependency additions → escalate',
      'tools': '# TOOLS\n\n## Available Tools\n- code_generator — Write implementation code\n- test_runner — Execute unit tests\n- mock_api_builder — Create mock endpoints\n\n## Tool Usage Rules\n- Cannot deploy to production\n- Cannot modify infrastructure\n- Cannot write to other modules',
      'heartbeat': '# HEARTBEAT\n\n## Current Tasks\n- TASK-AUTH-045 → Completed (User registration endpoint)\n- TASK-AUTH-048 → In Progress (Login endpoint with JWT)\n\n## Last Actions\n- Implemented POST /auth/register with email validation\n- Added bcrypt password hashing\n- Created unit tests for registration flow (12 tests, all passing)\n\n## Status\nACTIVE\n\n## Performance Metrics\n- Tasks completed: 6\n- Escalations raised: 2\n- Gate pass rate: 88%',
      'souls': '# SOUL\n\n## Decision References\n- DEC-2024-0031 → Use JWT-based auth\n- DEC-2024-0055 → Rate limiting on auth endpoints\n\n## Behavioral Traits\n- Detail-oriented in implementation\n- Thorough test coverage focus\n- Conservative with external dependencies\n\n## Learned Patterns\n- Always validate input before processing\n- Use parameterized queries for all DB operations\n- Include error codes in API responses\n\n## Collaboration Style\n- Reports blockers immediately\n- Asks clarifying questions before assuming'
    }
  };

  for (const [agentId, files] of Object.entries(workspaces)) {
    for (const [fileName, content] of Object.entries(files)) {
      NexusStore.setWorkspaceFile(agentId, fileName, content);
    }
  }

  // --- Tasks for proj_001 ---
  NexusStore.setTasks('proj_001', [
    { task_id: 'TASK-AUTH-041', title: 'Design auth database schema', module: 'auth', assignedTo: 'agent_mod_arch_auth', status: 'DONE', risk: 'HIGH', storyRef: 'US-001', createdAt: '2024-01-11T10:00:00Z', completedAt: '2024-01-12T14:00:00Z', gateLevel: 'L3', gateStatus: 'PASS', logs: ['Schema designed', 'Reviewed by Chief Architect', 'Gate L3 passed'] },
    { task_id: 'TASK-AUTH-043', title: 'Implement user registration endpoint', module: 'auth', assignedTo: 'agent_dev_auth_01', status: 'DONE', risk: 'MEDIUM', storyRef: 'US-001', createdAt: '2024-01-12T15:00:00Z', completedAt: '2024-01-13T11:00:00Z', gateLevel: 'L2', gateStatus: 'PASS', logs: ['Code implemented', 'Unit tests passed (12/12)', 'Code review approved'] },
    { task_id: 'TASK-AUTH-045', title: 'Implement password hashing service', module: 'auth', assignedTo: 'agent_dev_auth_01', status: 'DONE', risk: 'HIGH', storyRef: 'US-001', createdAt: '2024-01-13T12:00:00Z', completedAt: '2024-01-14T09:00:00Z', gateLevel: 'L3', gateStatus: 'PASS', logs: ['bcrypt implemented', 'Security scan passed', 'Gate L3 cleared'] },
    { task_id: 'TASK-AUTH-047', title: 'Implement refresh token rotation', module: 'auth', assignedTo: 'agent_dev_auth_03', status: 'ESCALATED', risk: 'HIGH', storyRef: 'US-003', createdAt: '2024-01-14T10:00:00Z', completedAt: null, gateLevel: 'L3', gateStatus: 'PENDING', logs: ['Implementation started', 'Schema change required — escalation raised', 'Waiting for ESC-2024-0047 resolution'] },
    { task_id: 'TASK-AUTH-048', title: 'Implement login endpoint with JWT', module: 'auth', assignedTo: 'agent_dev_auth_01', status: 'EXECUTING', risk: 'MEDIUM', storyRef: 'US-002', createdAt: '2024-01-14T11:00:00Z', completedAt: null, gateLevel: 'L2', gateStatus: 'PENDING', logs: ['Implementation in progress', 'JWT signing configured'] },
    { task_id: 'TASK-AUTH-050', title: 'Implement rate limiting middleware', module: 'auth', assignedTo: 'agent_dev_auth_02', status: 'EXECUTING', risk: 'MEDIUM', storyRef: 'US-002', createdAt: '2024-01-14T14:00:00Z', completedAt: null, gateLevel: 'L2', gateStatus: 'PENDING', logs: ['Rate limiter design complete', 'Implementation started'] },
    { task_id: 'TASK-AUTH-052', title: 'Design OAuth Google integration flow', module: 'auth', assignedTo: 'agent_mod_arch_auth', status: 'BLOCKED', risk: 'HIGH', storyRef: 'US-004', createdAt: '2024-01-15T09:00:00Z', completedAt: null, gateLevel: 'L3', gateStatus: 'PENDING', logs: ['Blocked — waiting for schema change decision'] },
    { task_id: 'TASK-PAY-001', title: 'Design payment processing architecture', module: 'payments', assignedTo: 'agent_mod_arch_payments', status: 'SPECIFIED', risk: 'HIGH', storyRef: 'US-006', createdAt: '2024-01-15T10:00:00Z', completedAt: null, gateLevel: 'L3', gateStatus: 'PENDING', logs: ['Task specified, awaiting assignment'] }
  ]);

  // --- Escalations ---
  NexusStore.setEscalations([
    {
      escalation_id: 'ESC-2024-0047', raised_by: 'agent_dev_auth_03', raised_by_name: 'Developer Agent - Auth 03',
      ceiling_violated: 'modify_data_model', status: 'PENDING',
      context: 'User story AUTH-12 requires adding OAuth refresh token field to users table',
      reasoning: 'Cannot proceed without schema change approval — refresh token rotation requires a dedicated token store',
      impact_analysis: 'Affects Auth module, JWT service, and potentially all downstream services',
      options: [
        { option: 'Add refresh_token field to users table with migration script', risk: 'MEDIUM' },
        { option: 'Create separate token_store table', risk: 'HIGH' },
        { option: 'Defer to next sprint', risk: 'LOW' }
      ],
      recommended_action: 'Option A — Add field with migration script',
      escalated_to: 'agent_mod_arch_auth', escalated_to_name: 'Module Architect - Auth',
      timestamp: '2024-01-15T14:32:00Z', resolvedAt: null, resolution: null,
      projectId: 'proj_001', taskRef: 'TASK-AUTH-047'
    },
    {
      escalation_id: 'ESC-2024-0045', raised_by: 'agent_mod_arch_auth', raised_by_name: 'Module Architect - Auth',
      ceiling_violated: 'change_api_contract', status: 'RESOLVED',
      context: 'Login endpoint needs to return user profile data alongside JWT token',
      reasoning: 'Original API contract only specified token response — profile data needed by frontend',
      impact_analysis: 'Changes response schema for POST /auth/login — all consumers affected',
      options: [
        { option: 'Extend login response with profile object', risk: 'LOW' },
        { option: 'Create separate GET /auth/profile endpoint', risk: 'MEDIUM' }
      ],
      recommended_action: 'Option B — Separate profile endpoint (cleaner separation)',
      escalated_to: 'agent_chief_arch_001', escalated_to_name: 'Chief / Solution Architect',
      timestamp: '2024-01-13T10:15:00Z', resolvedAt: '2024-01-13T11:00:00Z',
      resolution: { action: 'APPROVED', chosen_option: 'Create separate GET /auth/profile endpoint', decided_by: 'agent_chief_arch_001', notes: 'Separate endpoint preferred for cache-friendliness and cleaner API design' },
      projectId: 'proj_001', taskRef: 'TASK-AUTH-043'
    },
    {
      escalation_id: 'ESC-2024-0042', raised_by: 'agent_ba_001', raised_by_name: 'Business Analyst',
      ceiling_violated: 'conflicting_requirements', status: 'RESOLVED',
      context: 'Requirement REQ-005 (real-time WebSocket updates) conflicts with REQ-007 (10,000 concurrent users) — WebSocket at scale needs infrastructure review',
      reasoning: 'WebSocket connections at scale require dedicated infrastructure (Redis pub/sub, sticky sessions)',
      impact_analysis: 'May require infrastructure changes, increased hosting costs, and architecture review',
      options: [
        { option: 'Implement WebSocket with Redis pub/sub for scaling', risk: 'MEDIUM' },
        { option: 'Use Server-Sent Events (SSE) instead — simpler scaling', risk: 'LOW' },
        { option: 'Defer real-time updates to Phase 2', risk: 'LOW' }
      ],
      recommended_action: 'Option B — SSE for initial release, WebSocket in Phase 2',
      escalated_to: 'agent_chief_arch_001', escalated_to_name: 'Chief / Solution Architect',
      timestamp: '2024-01-11T16:00:00Z', resolvedAt: '2024-01-12T09:30:00Z',
      resolution: { action: 'APPROVED', chosen_option: 'Use SSE for Phase 1, plan WebSocket migration for Phase 2', decided_by: 'agent_chief_arch_001', human_reviewed: true, notes: 'SSE reduces complexity. WebSocket planned for Q2.' },
      projectId: 'proj_001', taskRef: null
    }
  ]);

  // --- Decisions ---
  NexusStore.setDecisions([
    { decision_id: 'DEC-2024-0031', type: 'ARCHITECTURE', decided_by: 'agent_chief_arch_001', decided_by_name: 'Chief / Solution Architect', human_reviewed: true, context: 'Authentication strategy for the platform', options_considered: ['Session-based auth', 'JWT-based auth', 'OAuth-only'], final_choice: 'JWT-based auth with refresh token rotation', reasoning: 'Stateless, scalable, works well with microservices. Refresh tokens add security.', references: [], timestamp: '2024-01-10T10:00:00Z', immutable: true, projectId: 'proj_001' },
    { decision_id: 'DEC-2024-0044', type: 'SECURITY', decided_by: 'agent_secdevops_001', decided_by_name: 'Security / DevOps Agent', human_reviewed: true, context: 'Token storage strategy on client side', options_considered: ['localStorage', 'sessionStorage', 'httpOnly secure cookies'], final_choice: 'httpOnly secure cookies for refresh tokens, memory for access tokens', reasoning: 'Prevents XSS attacks on refresh tokens. Access tokens in memory are short-lived.', references: ['DEC-2024-0031'], timestamp: '2024-01-11T11:00:00Z', immutable: true, projectId: 'proj_001' },
    { decision_id: 'DEC-2024-0055', type: 'SECURITY', decided_by: 'agent_chief_arch_001', decided_by_name: 'Chief / Solution Architect', human_reviewed: true, context: 'Rate limiting strategy for auth endpoints', options_considered: ['Token bucket', 'Sliding window', 'Fixed window'], final_choice: 'Sliding window rate limiter — 5 attempts per minute per IP', reasoning: 'Best balance between security and UX. Sliding window prevents burst attacks.', references: ['DEC-2024-0031'], timestamp: '2024-01-12T14:00:00Z', immutable: true, projectId: 'proj_001' },
    { decision_id: 'DEC-2024-0067', type: 'ARCHITECTURE', decided_by: 'agent_chief_arch_001', decided_by_name: 'Chief / Solution Architect', human_reviewed: false, context: 'API design for profile retrieval vs login response expansion', options_considered: ['Extend login response with profile', 'Separate GET /auth/profile endpoint'], final_choice: 'Separate GET /auth/profile endpoint', reasoning: 'Cleaner separation of concerns, cache-friendly, follows REST principles', references: ['DEC-2024-0031', 'DEC-2024-0044'], timestamp: '2024-01-13T11:00:00Z', immutable: true, projectId: 'proj_001' },
    { decision_id: 'DEC-2024-0073', type: 'ARCHITECTURE', decided_by: 'agent_chief_arch_001', decided_by_name: 'Chief / Solution Architect', human_reviewed: true, context: 'Real-time updates technology choice', options_considered: ['WebSocket with Redis pub/sub', 'Server-Sent Events (SSE)', 'Long polling'], final_choice: 'SSE for Phase 1, WebSocket migration planned for Phase 2', reasoning: 'SSE is simpler to scale, sufficient for order status updates. WebSocket deferred to reduce initial complexity.', references: [], timestamp: '2024-01-12T09:30:00Z', immutable: true, projectId: 'proj_001' },
    { decision_id: 'DEC-2024-0089', type: 'DATA_MODEL', decided_by: 'agent_chief_arch_001', decided_by_name: 'Chief / Solution Architect', human_reviewed: true, context: 'Auth module schema change request — OAuth refresh token storage', options_considered: ['Add field to users table', 'Separate token_store table', 'Defer'], final_choice: 'Add field with migration script including rollback', reasoning: 'Lowest complexity, backward-compatible, aligns with existing patterns.', references: ['DEC-2024-0031', 'DEC-2024-0044'], timestamp: '2024-01-15T15:00:00Z', immutable: true, projectId: 'proj_001' }
  ]);

  // --- Quality Gate Reviews ---
  NexusStore.setGateReviews('proj_001', [
    { gate_id: 'GATE-001', task_id: 'TASK-AUTH-041', level: 'L3', status: 'PASS', checks: { automated_tests: true, linting: true, reviewer_approval: true, test_coverage: 87, security_scan: true, architect_signoff: true }, reviewedBy: 'agent_chief_arch_001', timestamp: '2024-01-12T14:00:00Z' },
    { gate_id: 'GATE-002', task_id: 'TASK-AUTH-043', level: 'L2', status: 'PASS', checks: { automated_tests: true, linting: true, reviewer_approval: true, test_coverage: 82 }, reviewedBy: 'agent_mod_arch_auth', timestamp: '2024-01-13T11:00:00Z' },
    { gate_id: 'GATE-003', task_id: 'TASK-AUTH-045', level: 'L3', status: 'PASS', checks: { automated_tests: true, linting: true, reviewer_approval: true, test_coverage: 91, security_scan: true, architect_signoff: true }, reviewedBy: 'agent_secdevops_001', timestamp: '2024-01-14T09:00:00Z' }
  ]);

  // --- System logs ---
  const logs = [
    { type: 'SYSTEM', message: 'NEXUS system initialized', agent: 'system' },
    { type: 'PROJECT', message: 'Project "E-Commerce Platform" created', agent: 'human_orchestrator' },
    { type: 'PIPELINE', message: 'Pipeline started for E-Commerce Platform', agent: 'system' },
    { type: 'PIPELINE', message: 'Pipeline completed — 38 requirements extracted, 38 backlog items generated', agent: 'system' },
    { type: 'AGENT', message: 'Module Architect - Auth assigned to Auth module', agent: 'agent_chief_arch_001' },
    { type: 'TASK', message: 'TASK-AUTH-041 completed — Auth schema designed', agent: 'agent_mod_arch_auth' },
    { type: 'GATE', message: 'GATE-001 PASSED (L3) for TASK-AUTH-041', agent: 'system' },
    { type: 'ESCALATION', message: 'ESC-2024-0047 raised by Developer Agent - Auth 03', agent: 'agent_dev_auth_03' },
    { type: 'DECISION', message: 'DEC-2024-0089 recorded — Schema change approved with migration', agent: 'agent_chief_arch_001' }
  ];
  logs.forEach(l => NexusStore.addLog(l));

  NexusStore.setSystemState('EXECUTING');
  NexusStore.markSeeded();
  ensureNexusExtensionData();
}

function ensureBacklogAndTestCaseShape(projectId) {
  const backlog = NexusStore.getBacklog(projectId);
  if (Array.isArray(backlog) && backlog.length) {
    let changed = false;
    const normalized = backlog.map(item => {
      if (item.type !== 'USER_STORY') return item;
      if (Array.isArray(item.acceptanceCriteria)) return item;
      changed = true;
      return { ...item, acceptanceCriteria: [] };
    });
    if (changed) NexusStore.setBacklog(projectId, normalized);
  }

  const project = NexusStore.getProject(projectId);
  if (project && !Array.isArray(project.testCases)) {
    project.testCases = [];
    NexusStore.saveProject(project);
  }

  const testCaseKey = 'test_cases_' + projectId;
  const existingCases = NexusStore.get(testCaseKey);
  if (!Array.isArray(existingCases)) {
    NexusStore.set(testCaseKey, Array.isArray(project?.testCases) ? project.testCases : []);
  }
}

function ensureNexusExtensionData() {
  // Required task dataset used by Flow/Kanban/Live simulation demos.
  const requiredTasks = [
    {
      task_id: 'TASK-AUTH-101',
      title: 'Design auth login architecture contract',
      module: 'auth',
      assignedTo: 'agent_mod_arch_auth',
      status: 'SPECIFIED',
      risk: 'HIGH',
      storyRef: 'US-002',
      createdAt: '2024-01-16T09:00:00Z',
      completedAt: null,
      gateLevel: 'L3',
      gateStatus: 'PENDING',
      tokensUsed: 1200,
      logs: [
        'Backlog approved by Business Analyst and Product Owner',
        'Architecture task created by Chief Architect'
      ]
    },
    {
      task_id: 'TASK-AUTH-102',
      title: 'Implement login API and session audit trail',
      module: 'auth',
      assignedTo: 'agent_dev_auth_01',
      status: 'AGENT_ASSIGNED',
      risk: 'MEDIUM',
      storyRef: 'US-002',
      createdAt: '2024-01-16T10:30:00Z',
      completedAt: null,
      gateLevel: 'L2',
      gateStatus: 'PENDING',
      tokensUsed: 1500,
      logs: [
        'Task assigned to Developer Agent - Auth 01',
        'Implementation plan accepted by Module Architect'
      ]
    }
  ];

  const projectTasks = NexusStore.getTasks('proj_001');
  let tasksChanged = false;
  requiredTasks.forEach(task => {
    if (!projectTasks.some(t => t.task_id === task.task_id)) {
      projectTasks.push(task);
      tasksChanged = true;
    }
  });
  if (tasksChanged) NexusStore.setTasks('proj_001', projectTasks);

  const defaultWorkspaceFiles = {
    skills: '# SKILLS\n\n## Core Responsibilities\n- Analyze and deliver within assigned role\n- Produce structured outputs\n- Escalate on ceiling/risk violations\n',
    tools: '# TOOLS\n\n## Available Tools\n- code_generator\n- test_runner\n- api_mock_builder\n\n## Rules\n- No production access\n- Log all major actions\n',
    heartbeat: '# HEARTBEAT\n\n## Current Task\n- Awaiting simulation updates\n\n## Status\nIDLE\n\n## Tokens Used\n0\n',
    souls: '# SOUL\n\n## Behavioral Traits\n- Governance-first\n- Transparent escalation\n\n## Collaboration\n- Works through approved flow\n'
  };

  [
    'agent_ba_001',
    'agent_po_001',
    'agent_tcg_001',
    'agent_chief_arch_001',
    'agent_mod_arch_auth',
    'agent_dev_auth_01',
    'agent_qa_001',
    'agent_secdevops_001'
  ].forEach(agentId => {
    Object.entries(defaultWorkspaceFiles).forEach(([fileName, content]) => {
      if (!NexusStore.getWorkspaceFile(agentId, fileName)) {
        NexusStore.setWorkspaceFile(agentId, fileName, content);
      }
    });
  });

  NexusStore.getProjects().forEach(project => {
    ensureBacklogAndTestCaseShape(project.id);
  });
}
