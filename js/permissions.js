// NEXUS RBAC Permission Engine
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

  // Page-level access matrix: role → allowed pages
  roleAccess: {
    Admin: ['dashboard','requirements','pipeline','system-flow','llm_bridge','backlog','test-cases','agents','tasks','escalations','decisions','gates','monitoring','tenants','subscription','resources','tenant-users','code-review','incidents','command-center','ai-safety','devops','integrations','notifications','compliance','observability','settings'],
    Developer: ['dashboard','requirements','pipeline','system-flow','llm_bridge','backlog','test-cases','agents','tasks','escalations','decisions','gates','monitoring','code-review','command-center','devops','notifications','observability','settings'],
    Operator: ['dashboard','pipeline','system-flow','monitoring','tasks','escalations','tenants','subscription','resources','tenant-users','incidents','devops','notifications','compliance','observability','settings'],
    Viewer: ['dashboard','monitoring','decisions','notifications','observability','settings']
  },

  // Feature-level permissions
  featureAccess: {
    Admin: ['create_project','create_agent','resolve_escalation','manage_tenants','manage_users','manage_subscriptions','approve_gates','manage_integrations','manage_compliance','deploy_production','manage_secrets'],
    Developer: ['create_project','create_agent','resolve_escalation','approve_gates','view_integrations','deploy_staging'],
    Operator: ['resolve_escalation','manage_tenants','manage_users','approve_gates','deploy_staging','deploy_production','manage_integrations'],
    Viewer: ['view_only']
  },

  canAccessPage(page) {
    const user = NexusStore.getUser();
    if (!user) return false;
    const role = this._resolveRole(user.role);
    const allowed = this.roleAccess[role] || [];
    return allowed.includes(page);
  },

  canPerform(feature) {
    const user = NexusStore.getUser();
    if (!user) return false;
    const role = this._resolveRole(user.role);
    const allowed = this.featureAccess[role] || [];
    return allowed.includes(feature);
  },

  getCurrentRole() {
    const user = NexusStore.getUser();
    return user ? this._resolveRole(user.role) : 'Viewer';
  },

  enforcePageAccess(page) {
    if (!this.canAccessPage(page)) {
      showToast('Access denied: insufficient permissions', 'error');
      setTimeout(() => window.location.href = 'dashboard.html', 1000);
      return false;
    }
    return true;
  }
};
