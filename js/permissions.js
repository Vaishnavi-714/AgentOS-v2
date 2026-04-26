// NEXUS Enterprise RBAC + ABAC Permission Engine
const NexusPermissions = {
  // Map domain/display roles to RBAC tiers
  roleMap: {
    'Admin': 'Admin',
    'Human Orchestrator': 'Admin',
    'Product Manager': 'Admin',
    'Developer': 'Developer',
    'Operator': 'Operator',
    'Viewer': 'Viewer'
  },

  _resolveRole(raw) {
    return this.roleMap[raw] || 'Admin';
  },

  // Page-level access matrix: role → allowed pages (enterprise nav)
  roleAccess: {
    Admin: [
      'dashboard','workspace','projects','agents','workflows','repositories',
      'testing','deployments','analytics','integrations','admin','billing',
      'security','support','settings'
    ],
    Developer: [
      'dashboard','workspace','projects','agents','workflows','repositories',
      'testing','deployments','analytics','integrations','support','settings'
    ],
    Operator: [
      'dashboard','workspace','projects','agents','workflows',
      'testing','deployments','analytics','integrations','support','settings'
    ],
    Viewer: [
      'dashboard','workspace','projects','analytics','support','settings'
    ]
  },

  // Feature-level permissions
  featureAccess: {
    Admin: [
      'create_project','create_agent','resolve_escalation','manage_tenants',
      'manage_users','manage_subscriptions','approve_gates','manage_integrations',
      'manage_compliance','deploy_production','manage_secrets','manage_billing',
      'manage_security','manage_workflows','manage_repositories','view_audit',
      'manage_ai_models','manage_policies','create_workflow','delete_project',
      'manage_knowledge','view_analytics','manage_settings'
    ],
    Developer: [
      'create_project','create_agent','resolve_escalation','approve_gates',
      'view_integrations','deploy_staging','manage_repositories','create_workflow',
      'view_analytics','manage_settings','view_audit'
    ],
    Operator: [
      'resolve_escalation','manage_tenants','manage_users','approve_gates',
      'deploy_staging','deploy_production','manage_integrations','view_analytics',
      'manage_settings'
    ],
    Viewer: ['view_only','view_analytics']
  },

  // Agent-role gating: which agent roles can access which modules
  agentModuleAccess: {
    'developer': ['repositories', 'testing'],
    'module_architect': ['repositories', 'testing', 'projects'],
    'chief_architect': ['repositories', 'testing', 'projects', 'deployments'],
    'qa': ['testing'],
    'security_devops': ['security', 'deployments', 'testing'],
    'business_analyst': ['projects'],
    'product_manager': ['projects'],
    'product_owner': ['projects'],
    'scrum_master': ['projects', 'workflows'],
    'integration_architect': ['repositories', 'integrations'],
    'test_case_generator': ['testing']
  },

  canAccessPage(page) {
    const user = NexusStore.getUser();
    if (!user) return false;
    // System admins can access everything
    if (TenantState.isSystemAdmin()) return true;
    const role = this._resolveRole(user.role);
    const allowed = this.roleAccess[role] || [];
    return allowed.includes(page);
  },

  canPerform(feature) {
    const user = NexusStore.getUser();
    if (!user) return false;
    if (TenantState.isSystemAdmin()) return true;
    const role = this._resolveRole(user.role);
    const allowed = this.featureAccess[role] || [];
    return allowed.includes(feature);
  },

  getCurrentRole() {
    const user = NexusStore.getUser();
    return user ? this._resolveRole(user.role) : 'Viewer';
  },

  // Check if a specific agent type should see a module
  canAgentAccessModule(agentRole, module) {
    const access = this.agentModuleAccess[agentRole] || [];
    return access.includes(module);
  },

  // Coding module: only active when Developer Agent is active
  isCodingModuleActive() {
    const agents = NexusStore.getAgents();
    return agents.some(a =>
      a.role === 'developer' &&
      (a.status === 'ACTIVE' || a.lifecycle === 'EXECUTING')
    );
  },

  // Code Review: only active for Reviewer / Architect Agent
  isCodeReviewActive() {
    const agents = NexusStore.getAgents();
    return agents.some(a =>
      (a.role === 'module_architect' || a.role === 'chief_architect' || a.role === 'qa') &&
      (a.status === 'ACTIVE' || a.lifecycle === 'EXECUTING')
    );
  },

  enforcePageAccess(page) {
    if (!this.canAccessPage(page)) {
      showToast('Access denied: insufficient permissions', 'error');
      setTimeout(() => window.location.href = 'dashboard.html', 1000);
      return false;
    }
    return true;
  },

  // Tenant isolation: ensure data operations are scoped to current tenant
  enforceTenantIsolation(tenantId) {
    if (TenantState.isSystemAdmin()) return true; // sys admin sees all
    const current = TenantState.getCurrentTenant();
    if (!current) return false;
    return current.tenant_id === tenantId;
  },

  // Get tenant-scoped data key
  getTenantScopedKey(baseKey) {
    if (TenantState.isSystemAdmin()) return baseKey;
    const current = TenantState.getCurrentTenant();
    return current ? `${baseKey}_${current.tenant_id}` : baseKey;
  }
};
