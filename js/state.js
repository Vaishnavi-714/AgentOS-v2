// NEXUS Multi-Tenant State Management
const TenantState = {
  _storageKey: 'nexus_tenants',
  _currentKey: 'nexus_currentTenant',
  _currentUserKey: 'nexus_currentTenantUser',
  _invitationsKey: 'nexus_tenant_invitations',

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
    free: { users: 3, projects: 1, agents: 5, storage: 5, api: 1000, label: "Free", color: "#6b7280", icon: "◇" },
    pro: { users: 25, projects: 20, agents: 50, storage: 100, api: 25000, label: "Pro", color: "#3b82f6", icon: "◆" },
    business: { users: 100, projects: 999, agents: 200, storage: 500, api: 100000, label: "Business", color: "#6366f1", icon: "◆" },
    enterprise: { users: 9999, projects: 9999, agents: 999, storage: 5000, api: 1000000, label: "Enterprise", color: "#a855f7", icon: "◆" },
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
    if (!localStorage.getItem(this._invitationsKey)) {
      localStorage.setItem(this._invitationsKey, JSON.stringify({}));
    }
    this.normalizeTenantData();
  },

  getTenants() {
    try {
      return (JSON.parse(localStorage.getItem(this._storageKey)) || this.defaultTenants).map(t => this.normalizeTenant(t));
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
    const tenantUser = this.findTenantUserByEmail(tenant.tenant_id || tenant.id, email);
    if (tenantUser) this.setCurrentTenantUser(tenantUser);
  },
  logoutSession() {
    localStorage.removeItem('nexus_role');
    localStorage.removeItem('nexus_isLoggedIn');
    localStorage.removeItem('nexus_login_email');
    localStorage.removeItem(this._currentKey);
    localStorage.removeItem(this._currentUserKey);
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
    localStorage.setItem(this._currentKey, JSON.stringify(this.normalizeTenant(tenant)));
  },

  getCurrentTenantUser() {
    try {
      const stored = localStorage.getItem(this._currentUserKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return this.normalizeTenantUser(parsed.tenantId, parsed, 999);
      }
    } catch {}
    const current = this.getCurrentTenant();
    const email = this.getLoginEmail();
    return current && email ? this.findTenantUserByEmail(current.tenant_id || current.id, email) : null;
  },

  setCurrentTenantUser(user) {
    if (!user) {
      localStorage.removeItem(this._currentUserKey);
      return;
    }
    localStorage.setItem(this._currentUserKey, JSON.stringify(user));
  },

  addTenant(tenant) {
    const tenants = this.getTenants();
    tenants.push(this.normalizeTenant(tenant));
    this.setTenants(tenants);
    const users = this.getAllTenantUsers();
    const tenantId = tenant.tenant_id || tenant.id;
    if (!users[tenantId]) users[tenantId] = [];
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
      const all = JSON.parse(localStorage.getItem('nexus_tenant_users')) || this.tenantUsers;
      Object.keys(all).forEach(tenantId => {
        all[tenantId] = (all[tenantId] || []).map((u, idx) => this.normalizeTenantUser(tenantId, u, idx));
      });
      return all;
    } catch { return this.tenantUsers; }
  },

  getTenantUsers(tenantId) {
    const all = this.getAllTenantUsers();
    return all[tenantId] || [];
  },

  addTenantUser(tenantId, user) {
    const all = this.getAllTenantUsers();
    if (!all[tenantId]) all[tenantId] = [];
    const normalized = this.normalizeTenantUser(tenantId, user, all[tenantId].length);
    const existingIdx = all[tenantId].findIndex(u => u.email.toLowerCase() === normalized.email.toLowerCase());
    if (existingIdx >= 0) all[tenantId][existingIdx] = { ...all[tenantId][existingIdx], ...normalized };
    else all[tenantId].push(normalized);
    localStorage.setItem('nexus_tenant_users', JSON.stringify(all));
    return normalized;
  },

  updateTenantUser(tenantId, userId, updates) {
    const all = this.getAllTenantUsers();
    const users = all[tenantId] || [];
    const idx = users.findIndex(u => u.id === userId);
    if (idx < 0) return null;
    users[idx] = this.normalizeTenantUser(tenantId, { ...users[idx], ...updates }, idx);
    all[tenantId] = users;
    localStorage.setItem('nexus_tenant_users', JSON.stringify(all));
    const current = this.getCurrentTenantUser();
    if (current && current.id === userId) this.setCurrentTenantUser(users[idx]);
    return users[idx];
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

  generateInvitationId() {
    return 'INV-' + Date.now().toString(36).toUpperCase() + '-' + String(Math.floor(Math.random() * 900) + 100);
  },

  findTenantUserByEmail(tenantId, email) {
    if (!tenantId || !email) return null;
    return this.getTenantUsers(tenantId).find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  getTenantInvitations(tenantId) {
    try {
      const all = JSON.parse(localStorage.getItem(this._invitationsKey)) || {};
      return all[tenantId] || [];
    } catch { return []; }
  },

  addTenantInvitation(tenantId, invitation) {
    const all = (() => {
      try { return JSON.parse(localStorage.getItem(this._invitationsKey)) || {}; }
      catch { return {}; }
    })();
    if (!all[tenantId]) all[tenantId] = [];
    const normalized = {
      id: invitation.id || this.generateInvitationId(),
      tenantId,
      email: (invitation.email || '').trim().toLowerCase(),
      tenantRole: invitation.tenantRole === 'admin' ? 'admin' : 'member',
      invitationStatus: invitation.invitationStatus || 'pending',
      invitedBy: invitation.invitedBy || this.getCurrentTenantUser()?.id || null,
      invitedAt: invitation.invitedAt || new Date().toISOString(),
      acceptedAt: invitation.acceptedAt || null,
      expiresAt: invitation.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString()
    };
    const idx = all[tenantId].findIndex(inv => inv.email === normalized.email);
    if (idx >= 0) all[tenantId][idx] = { ...all[tenantId][idx], ...normalized };
    else all[tenantId].push(normalized);
    localStorage.setItem(this._invitationsKey, JSON.stringify(all));
    return normalized;
  },

  updateTenantInvitation(tenantId, invitationId, updates) {
    const all = (() => {
      try { return JSON.parse(localStorage.getItem(this._invitationsKey)) || {}; }
      catch { return {}; }
    })();
    const list = all[tenantId] || [];
    const idx = list.findIndex(inv => inv.id === invitationId);
    if (idx < 0) return null;
    list[idx] = { ...list[idx], ...updates };
    all[tenantId] = list;
    localStorage.setItem(this._invitationsKey, JSON.stringify(all));
    return list[idx];
  },

  acceptInvitationForEmail(tenantId, email) {
    const invitation = this.getTenantInvitations(tenantId)
      .find(inv => inv.email.toLowerCase() === email.toLowerCase() && inv.invitationStatus === 'pending');
    if (!invitation) return null;
    const accepted = this.updateTenantInvitation(tenantId, invitation.id, {
      invitationStatus: 'accepted',
      acceptedAt: new Date().toISOString()
    });
    const user = this.findTenantUserByEmail(tenantId, email);
    if (user) this.updateTenantUser(tenantId, user.id, { invitationStatus: 'accepted', status: 'ACTIVE' });
    return accepted;
  },

  normalizeTenant(tenant) {
    if (!tenant) return tenant;
    const tenantId = tenant.tenant_id || tenant.id || this.generateTenantId();
    const primaryAdmin = tenant.primaryAdmin || {
      name: tenant.admin_name || '',
      email: tenant.admin_email || '',
      jobTitle: tenant.job_title || '',
      phone: tenant.phone || ''
    };
    return {
      ...tenant,
      id: tenant.id || tenantId,
      tenant_id: tenantId,
      slug: tenant.slug || (tenant.name || tenantId).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      organizationType: tenant.organizationType || tenant.tenant_type || tenant.org_type || 'Enterprise',
      industry: tenant.industry || 'Technology',
      companySize: tenant.companySize || tenant.company_size || '',
      website: tenant.website || '',
      description: tenant.description || '',
      primaryAdmin,
      paymentStatus: tenant.paymentStatus || tenant.payment_status || 'pending',
      detectedLocale: tenant.detectedLocale || tenant.language || navigator.language || 'en-US',
      detectedTimezone: tenant.detectedTimezone || tenant.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      detectedRegion: tenant.detectedRegion || tenant.region || 'US-EAST-1',
      createdAt: tenant.createdAt || tenant.created_at || new Date().toISOString(),
      created_at: tenant.created_at || tenant.createdAt || new Date().toISOString()
    };
  },

  normalizeTenantUser(tenantId, user, index = 0) {
    const legacyRole = user.tenantRole || user.role || 'member';
    const tenantRole = String(legacyRole).toLowerCase() === 'admin' ? 'admin' : 'member';
    const status = user.status || (user.invitationStatus === 'pending' ? 'PENDING' : 'ACTIVE');
    const isTenantOwner = Boolean(user.isTenantOwner || user.isOriginalTenantAdmin || (tenantRole === 'admin' && index === 0));
    return {
      ...user,
      id: user.id || this.generateUserId(),
      tenantId: user.tenantId || tenantId,
      name: user.name || (user.email ? user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Tenant User'),
      email: (user.email || '').trim().toLowerCase(),
      tenantRole,
      role: tenantRole === 'admin' ? 'Admin' : 'Member',
      invitationStatus: user.invitationStatus || (status === 'PENDING' ? 'pending' : 'accepted'),
      status,
      isTenantOwner,
      isOriginalTenantAdmin: isTenantOwner,
      createdAt: user.createdAt || user.created_at || new Date().toISOString(),
      last_login: user.last_login || null
    };
  },

  normalizeTenantData() {
    const tenants = (JSON.parse(localStorage.getItem(this._storageKey)) || this.defaultTenants).map(t => this.normalizeTenant(t));
    localStorage.setItem(this._storageKey, JSON.stringify(tenants));
    const all = JSON.parse(localStorage.getItem('nexus_tenant_users')) || this.tenantUsers;
    tenants.forEach(tenant => {
      const tenantId = tenant.tenant_id;
      const list = all[tenantId] || [];
      const normalized = list.map((u, idx) => this.normalizeTenantUser(tenantId, u, idx));
      if (!normalized.some(u => u.tenantRole === 'admin')) {
        normalized.unshift(this.normalizeTenantUser(tenantId, {
          name: tenant.primaryAdmin?.name || tenant.admin_name || 'Tenant Admin',
          email: tenant.primaryAdmin?.email || tenant.admin_email || `admin@${tenant.domain}`,
          tenantRole: 'admin',
          isTenantOwner: true,
          invitationStatus: 'accepted',
          status: 'ACTIVE'
        }, 0));
      }
      const firstAdmin = normalized.find(u => u.tenantRole === 'admin');
      if (firstAdmin) {
        normalized.forEach(u => {
          if (u.id !== firstAdmin.id) {
            u.isTenantOwner = Boolean(u.isTenantOwner && u.email === firstAdmin.email);
            u.isOriginalTenantAdmin = u.isTenantOwner;
          }
        });
        firstAdmin.isTenantOwner = true;
        firstAdmin.isOriginalTenantAdmin = true;
      }
      all[tenantId] = normalized;
    });
    localStorage.setItem('nexus_tenant_users', JSON.stringify(all));
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
    localStorage.removeItem(this._currentUserKey);
    localStorage.removeItem('nexus_tenant_users');
    localStorage.removeItem(this._invitationsKey);
    this.init();
  },

  // Find tenant by email domain
  findTenantByDomain(domain) {
    return this.getTenants().find(t => t.domain === domain) || null;
  }
};

// Auto-init on load
TenantState.init();
