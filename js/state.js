// NEXUS Multi-Tenant State Management
const TenantState = {
  _storageKey: 'nexus_tenants',
  _currentKey: 'nexus_currentTenant',

  defaultTenants: [
    {
      tenant_id: "TNT-001",
      name: "Infosys",
      domain: "infosys.com",
      status: "ACTIVE",
      subscription: "PREMIUM",
      users: 250,
      projects: 18,
      agents: 75,
      storage_used: 120,
      api_usage: 45000,
      escalations: 2,
      region: "AP-SOUTH-1",
      created_at: "2025-08-15T10:00:00Z",
      admin_name: "Rajesh Kumar",
      admin_email: "rajesh.kumar@infosys.com",
      tenant_type: "Enterprise"
    },
    {
      tenant_id: "TNT-002",
      name: "TCS",
      domain: "tcs.com",
      status: "ACTIVE",
      subscription: "STANDARD",
      users: 80,
      projects: 10,
      agents: 30,
      storage_used: 40,
      api_usage: 12000,
      escalations: 1,
      region: "AP-SOUTH-1",
      created_at: "2025-09-01T14:30:00Z",
      admin_name: "Priya Sharma",
      admin_email: "priya.sharma@tcs.com",
      tenant_type: "Enterprise"
    },
    {
      tenant_id: "TNT-003",
      name: "Wipro",
      domain: "wipro.com",
      status: "ACTIVE",
      subscription: "BASIC",
      users: 35,
      projects: 5,
      agents: 12,
      storage_used: 18,
      api_usage: 4500,
      escalations: 0,
      region: "US-EAST-1",
      created_at: "2025-10-20T09:00:00Z",
      admin_name: "Anil Mehta",
      admin_email: "anil.mehta@wipro.com",
      tenant_type: "SMB"
    }
  ],

  subscriptionLimits: {
    PREMIUM: { users: 1000, projects: 100, agents: 500, storage: 1000, api: 100000, label: "Premium", color: "#a855f7", icon: "💎" },
    STANDARD: { users: 200, projects: 30, agents: 100, storage: 200, api: 30000, label: "Standard", color: "#3b82f6", icon: "⭐" },
    BASIC: { users: 50, projects: 10, agents: 20, storage: 50, api: 10000, label: "Basic", color: "#6b7280", icon: "🔹" }
  },

  tenantUsers: {
    "TNT-001": [
      { id: "USR-001", name: "Rajesh Kumar", email: "rajesh.kumar@infosys.com", role: "Admin", status: "ACTIVE", last_login: "2026-04-23T08:30:00Z" },
      { id: "USR-002", name: "Sneha Patel", email: "sneha.patel@infosys.com", role: "Developer", status: "ACTIVE", last_login: "2026-04-23T09:15:00Z" },
      { id: "USR-003", name: "Vikram Singh", email: "vikram.singh@infosys.com", role: "Developer", status: "ACTIVE", last_login: "2026-04-22T17:40:00Z" },
      { id: "USR-004", name: "Meera Nair", email: "meera.nair@infosys.com", role: "Operator", status: "ACTIVE", last_login: "2026-04-23T07:10:00Z" },
      { id: "USR-005", name: "Arjun Desai", email: "arjun.desai@infosys.com", role: "Developer", status: "INACTIVE", last_login: "2026-04-18T14:20:00Z" }
    ],
    "TNT-002": [
      { id: "USR-010", name: "Priya Sharma", email: "priya.sharma@tcs.com", role: "Admin", status: "ACTIVE", last_login: "2026-04-23T10:00:00Z" },
      { id: "USR-011", name: "Karthik Iyer", email: "karthik.iyer@tcs.com", role: "Viewer", status: "ACTIVE", last_login: "2026-04-22T16:30:00Z" },
      { id: "USR-012", name: "Ananya Roy", email: "ananya.roy@tcs.com", role: "Developer", status: "ACTIVE", last_login: "2026-04-23T09:45:00Z" }
    ],
    "TNT-003": [
      { id: "USR-020", name: "Anil Mehta", email: "anil.mehta@wipro.com", role: "Admin", status: "ACTIVE", last_login: "2026-04-23T08:00:00Z" },
      { id: "USR-021", name: "Divya Gupta", email: "divya.gupta@wipro.com", role: "Developer", status: "ACTIVE", last_login: "2026-04-22T18:00:00Z" }
    ]
  },

  // Initialize tenants in localStorage
  init() {
    if (!localStorage.getItem(this._storageKey)) {
      localStorage.setItem(this._storageKey, JSON.stringify(this.defaultTenants));
    }
    if (!localStorage.getItem('nexus_tenant_users')) {
      localStorage.setItem('nexus_tenant_users', JSON.stringify(this.tenantUsers));
    }
  },

  getTenants() {
    try {
      return JSON.parse(localStorage.getItem(this._storageKey)) || this.defaultTenants;
    } catch { return this.defaultTenants; }
  },

  setTenants(tenants) {
    localStorage.setItem(this._storageKey, JSON.stringify(tenants));
  },

  // --- Role / Auth helpers ---
  getRole() {
    return localStorage.getItem('nexus_role') || null;
  },
  isSystemAdmin() {
    return this.getRole() === 'SYSTEM_ADMIN';
  },
  isTenantUser() {
    return this.getRole() === 'TENANT_USER';
  },
  isLoggedIn() {
    return localStorage.getItem('nexus_isLoggedIn') === 'true';
  },
  loginAsSystemAdmin(email) {
    localStorage.setItem('nexus_role', 'SYSTEM_ADMIN');
    localStorage.setItem('nexus_isLoggedIn', 'true');
    localStorage.setItem('nexus_login_email', email);
    localStorage.removeItem(this._currentKey);
  },
  loginAsTenantUser(email, tenant) {
    localStorage.setItem('nexus_role', 'TENANT_USER');
    localStorage.setItem('nexus_isLoggedIn', 'true');
    localStorage.setItem('nexus_login_email', email);
    this.setCurrentTenant(tenant);
  },
  logoutSession() {
    localStorage.removeItem('nexus_role');
    localStorage.removeItem('nexus_isLoggedIn');
    localStorage.removeItem('nexus_login_email');
    localStorage.removeItem(this._currentKey);
    localStorage.removeItem('selectedTenantId');
  },
  getLoginEmail() {
    return localStorage.getItem('nexus_login_email') || '';
  },

  getCurrentTenant() {
    // System admins have no single tenant
    if (this.isSystemAdmin()) return null;
    try {
      const stored = localStorage.getItem(this._currentKey);
      if (stored) return JSON.parse(stored);
      return null;
    } catch {
      return null;
    }
  },

  setCurrentTenant(tenant) {
    localStorage.setItem(this._currentKey, JSON.stringify(tenant));
  },

  addTenant(tenant) {
    const tenants = this.getTenants();
    tenants.push(tenant);
    this.setTenants(tenants);
    // Init empty user list
    const users = this.getAllTenantUsers();
    users[tenant.tenant_id] = [];
    localStorage.setItem('nexus_tenant_users', JSON.stringify(users));
  },

  updateTenant(tenantId, updates) {
    const tenants = this.getTenants();
    const idx = tenants.findIndex(t => t.tenant_id === tenantId);
    if (idx >= 0) {
      tenants[idx] = { ...tenants[idx], ...updates };
      this.setTenants(tenants);
      // Update currentTenant if it's the active one
      const current = this.getCurrentTenant();
      if (current && current.tenant_id === tenantId) {
        this.setCurrentTenant(tenants[idx]);
      }
      return tenants[idx];
    }
    return null;
  },

  generateTenantId() {
    const tenants = this.getTenants();
    const maxNum = tenants.reduce((max, t) => {
      const num = parseInt(t.tenant_id.replace('TNT-', ''));
      return num > max ? num : max;
    }, 0);
    return `TNT-${String(maxNum + 1).padStart(3, '0')}`;
  },

  getSubscriptionLimits(plan) {
    return this.subscriptionLimits[plan] || this.subscriptionLimits.BASIC;
  },

  getAllTenantUsers() {
    try {
      return JSON.parse(localStorage.getItem('nexus_tenant_users')) || this.tenantUsers;
    } catch { return this.tenantUsers; }
  },

  getTenantUsers(tenantId) {
    const all = this.getAllTenantUsers();
    return all[tenantId] || [];
  },

  addTenantUser(tenantId, user) {
    const all = this.getAllTenantUsers();
    if (!all[tenantId]) all[tenantId] = [];
    all[tenantId].push(user);
    localStorage.setItem('nexus_tenant_users', JSON.stringify(all));
  },

  removeTenantUser(tenantId, userId) {
    const all = this.getAllTenantUsers();
    if (all[tenantId]) {
      all[tenantId] = all[tenantId].filter(u => u.id !== userId);
      localStorage.setItem('nexus_tenant_users', JSON.stringify(all));
    }
  },

  generateUserId() {
    return 'USR-' + String(Math.floor(Math.random() * 9000) + 1000);
  },

  // Check limits and return warnings
  checkLimits(tenant) {
    const limits = this.getSubscriptionLimits(tenant.subscription);
    const warnings = [];
    if (tenant.users >= limits.users) {
      warnings.push({ type: 'users', message: `User limit reached (${tenant.users}/${limits.users})`, severity: 'critical' });
    } else if (tenant.users >= limits.users * 0.8) {
      warnings.push({ type: 'users', message: `Approaching user limit (${tenant.users}/${limits.users})`, severity: 'warning' });
    }
    if (tenant.api_usage >= limits.api) {
      warnings.push({ type: 'api', message: `API usage limit reached (${tenant.api_usage.toLocaleString()}/${limits.api.toLocaleString()})`, severity: 'critical' });
    } else if (tenant.api_usage >= limits.api * 0.8) {
      warnings.push({ type: 'api', message: `Approaching API limit (${tenant.api_usage.toLocaleString()}/${limits.api.toLocaleString()})`, severity: 'warning' });
    }
    if (tenant.storage_used >= limits.storage) {
      warnings.push({ type: 'storage', message: `Storage limit reached (${tenant.storage_used}GB/${limits.storage}GB)`, severity: 'critical' });
    }
    return warnings;
  },

  // Reset everything
  resetTenantData() {
    localStorage.removeItem(this._storageKey);
    localStorage.removeItem(this._currentKey);
    localStorage.removeItem('nexus_tenant_users');
    this.init();
  },

  // Find tenant by email domain
  findTenantByDomain(domain) {
    return this.getTenants().find(t => t.domain === domain) || null;
  }
};

// Auto-init on load
TenantState.init();
