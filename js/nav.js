// NEXUS Navigation Component — Enterprise Multi-Tenant Platform
const NexusRoleUtils = {
  projectRoleLabels: {
    EXECUTIVE_STRATEGIC: 'Executive & Strategic',
    GOVERNANCE_ADMIN: 'Governance & Admin',
    PRODUCT_DELIVERY: 'Product & Delivery',
    TECHNICAL_EXECUTION: 'Technical Execution',
    QA_TESTING: 'QA / Testing',
    RELEASE_DEVOPS: 'Release / DevOps',
    WORKSPACE_UNIVERSAL: 'Workspace / Universal'
  },

  normalizeProjectRole(role) {
    if (!role) return '';
    return String(role).trim().toUpperCase().replace(/[\s/&-]+/g, '_');
  },

  projectRoleLabel(role) {
    const normalized = this.normalizeProjectRole(role);
    return this.projectRoleLabels[normalized] || '';
  },

  getCurrentUser() {
    if (typeof TenantState !== 'undefined') {
      return TenantState.getCurrentTenantUser() || NexusStore.getUser();
    }
    return NexusStore.getUser();
  },

  getProjectAssignments(project) {
    return Array.isArray(project?.assignedUsers) ? project.assignedUsers : (Array.isArray(project?.members) ? project.members : []);
  },

  findUserAssignment(project, user = this.getCurrentUser()) {
    if (!project || !user) return null;
    const assignments = this.getProjectAssignments(project);
    return assignments.find(assignment => assignment.userId && assignment.userId === user.id)
      || assignments.find(assignment => assignment.id && assignment.id === user.id)
      || assignments.find(assignment => assignment.email && user.email && assignment.email.toLowerCase() === user.email.toLowerCase())
      || null;
  },

  getAssignedProjects(projects = NexusStore.getProjects(), user = this.getCurrentUser()) {
    return (projects || []).filter(project => Boolean(this.findUserAssignment(project, user)));
  },

  getSelectedProject(projects = NexusStore.getProjects()) {
    const selectedId = this.getSelectedProjectId();
    if (selectedId) return (projects || []).find(project => project.id === selectedId) || null;
    const fallback = (projects || [])[0] || null;
    if (fallback?.id) this.setSelectedProjectId(fallback.id, { silent: true });
    return fallback;
  },

  getSelectedProjectId() {
    return sessionStorage.getItem('nexus_selected_project') || localStorage.getItem('nexus_selected_project') || NexusStore.getActiveProject?.() || '';
  },

  setSelectedProjectId(projectId, options = {}) {
    if (!projectId) return;
    sessionStorage.setItem('nexus_selected_project', projectId);
    localStorage.setItem('nexus_selected_project', projectId);
    if (options.silent) return;
    this.refreshNavigationRole();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nexus:selected-project-changed', { detail: { projectId } }));
    }
  },

  getPrimaryProjectRole(projects = NexusStore.getProjects(), user = this.getCurrentUser()) {
    const selectedProjectId = this.getSelectedProjectId();
    if (!selectedProjectId) {
      const firstAssignedProject = this.getAssignedProjects(projects, user)[0];
      const fallbackAssignment = this.findUserAssignment(firstAssignedProject, user);
      return this.normalizeProjectRole(fallbackAssignment?.projectRole);
    }
    const selectedProject = this.getSelectedProject(projects);
    const selectedAssignment = this.findUserAssignment(selectedProject, user);
    return this.normalizeProjectRole(selectedAssignment?.projectRole);
  },

  getTenantRoleLabel(user = this.getCurrentUser()) {
    if (!user) return '';
    const rawRole = typeof NexusPermissions !== 'undefined'
      ? NexusPermissions.normalizeRole(user.tenantRole || user.role || '')
      : String(user.tenantRole || user.role || '').trim().toLowerCase();
    const tenant = typeof TenantState !== 'undefined' ? TenantState.getCurrentTenant?.() : null;
    const ownerEmail = (tenant?.primaryAdmin?.email || tenant?.admin_email || '').trim().toLowerCase();
    const userEmail = (user.email || '').trim().toLowerCase();
    const isExplicitOwner = rawRole === 'tenant_admin' || (Boolean(user.isTenantOwner || user.isOriginalTenantAdmin) && (!ownerEmail || ownerEmail === userEmail));
    if (isExplicitOwner) return 'Tenant Admin';
    if (rawRole === 'admin') return 'Admin';
    if (rawRole === 'member') return 'Member';
    return 'Member';
  },

  getSidebarRoleLabel(user = this.getCurrentUser(), projects = NexusStore.getProjects()) {
    const tenantRole = this.getTenantRoleLabel(user);
    const projectRole = this.projectRoleLabel(this.getPrimaryProjectRole(projects, user));
    return projectRole ? `${tenantRole} (${projectRole})` : tenantRole;
  },

  getDashboardHref(projects = NexusStore.getProjects(), user = this.getCurrentUser()) {
    return this.getPrimaryProjectRole(projects, user) === 'PRODUCT_DELIVERY'
      ? 'product-delivery-dashboard.html'
      : 'role-dashboard.html';
  },

  refreshNavigationRole() {
    const roleEl = document.querySelector('.nav-footer .user-role');
    if (roleEl) roleEl.textContent = this.getSidebarRoleLabel();
    const dashboardLink = document.querySelector('.nav-link[href$="role-dashboard.html"], .nav-link[href$="product-delivery-dashboard.html"]');
    if (dashboardLink) dashboardLink.setAttribute('href', this.getDashboardHref());
  }
};
if (typeof window !== 'undefined') window.NexusRoleUtils = NexusRoleUtils;

const NexusSidebar = {
  storageKey: 'nexus_sidebar_collapsed',

  isCollapsed() {
    return localStorage.getItem(this.storageKey) === 'true';
  },

  apply(collapsed = this.isCollapsed()) {
    const nav = document.querySelector('.nexus-nav');
    document.documentElement.classList.toggle('sidebar-collapsed', collapsed);
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    if (nav) {
      nav.classList.toggle('collapsed', collapsed);
      const toggle = nav.querySelector('.nav-collapse-toggle');
      if (toggle) {
        toggle.setAttribute('aria-expanded', String(!collapsed));
        toggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
        toggle.setAttribute('title', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
      }
    }
  },

  toggle() {
    const collapsed = !this.isCollapsed();
    localStorage.setItem(this.storageKey, String(collapsed));
    this.apply(collapsed);
  }
};
if (typeof window !== 'undefined') window.NexusSidebar = NexusSidebar;

function ensureFontAwesome() {
  if (document.querySelector('link[data-nexus-fontawesome], link[href*="font-awesome"], link[href*="fontawesome"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
  link.setAttribute('data-nexus-fontawesome', 'true');
  document.head.appendChild(link);
}

function createNavigation(activePage) {
  // Session protection: must be logged in
  if (activePage !== 'login' && activePage !== 'landing') {
    if (!TenantState.isLoggedIn()) {
      window.location.href = 'index.html';
      return;
    }
  }

  const user = NexusStore.getUser();
  const role = TenantState.getRole();
  const tenantUser = typeof TenantState !== 'undefined' ? TenantState.getCurrentTenantUser() : null;
  const tenantRoleLabel = tenantUser ? NexusRoleUtils.getTenantRoleLabel(tenantUser) : (user?.role || '');
  const sidebarRoleLabel = tenantUser ? NexusRoleUtils.getSidebarRoleLabel(tenantUser) : (user?.role || '');
  const projectRoleLabel = NexusRoleUtils.projectRoleLabel(NexusRoleUtils.getPrimaryProjectRole(NexusStore.getProjects(), tenantUser || user));
  const dashboardHref = NexusRoleUtils.getDashboardHref();
  ensureFontAwesome();


  // ─── Master Navigation Structure ───
  const mainNavItems = [
    { id: 'role-dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge-high', href: dashboardHref, activePages: ['role-dashboard', 'product-delivery-dashboard'] },
    { id: 'dashboard', label: 'Projects Hub', icon: 'fa-solid fa-folder-tree', href: 'dashboard.html' },
    { id: 'workspace', label: 'Workspace', icon: 'fa-solid fa-comments', href: 'workspace.html' },
    { id: 'agents', label: 'Agents', icon: 'fa-solid fa-robot', href: 'agents.html' },
    { id: 'workflows', label: 'Workflows', icon: 'fa-solid fa-diagram-project', href: 'workflows.html' },
    { id: 'repositories', label: 'Repositories', icon: 'fa-solid fa-code-branch', href: 'repositories.html' },
    { id: 'testing', label: 'Testing', icon: 'fa-solid fa-vial', href: 'testing.html' },
    { id: 'deployments', label: 'Deployments', icon: 'fa-solid fa-rocket', href: 'deployments.html' },
    { id: 'integrations', label: 'Integrations', icon: 'fa-solid fa-link', href: 'integrations.html' }
  ];

  const controlNavItems = [
    { id: 'support', label: 'Support', icon: 'fa-solid fa-headset', href: 'support.html' },
    { id: 'settings', label: 'Settings', icon: 'fa-solid fa-gear', href: 'settings.html' }
  ];

  const filteredControlItems = controlNavItems;
  const canInviteUsers = typeof NexusPermissions !== 'undefined' && NexusPermissions.canInviteUsers();

  const pendingEscalations = NexusStore.getEscalations().filter(e => e.status === 'PENDING').length;
  const unreadNotifs = (NexusStore.getNotifications() || []).filter(n => !n.read).length;

  const nav = document.createElement('nav');
  const sidebarCollapsed = NexusSidebar.isCollapsed();
  document.documentElement.classList.toggle('sidebar-collapsed', sidebarCollapsed);
  document.body.classList.toggle('sidebar-collapsed', sidebarCollapsed);
  nav.className = `nexus-nav${sidebarCollapsed ? ' collapsed' : ''}`;
  nav.innerHTML = `
    <div class="nav-header">
      <div class="nav-brand">
        <span class="brand-icon"><i class="fa-solid fa-layer-group" aria-hidden="true"></i></span>
        <span class="brand-text">NEXUS</span>
        <button class="nav-collapse-toggle" type="button" onclick="NexusSidebar.toggle()" aria-label="${sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}" aria-expanded="${String(!sidebarCollapsed)}" title="${sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}">
          <i class="nav-collapse-glyph fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
      </div>
    </div>
    <div class="nav-links">
      ${mainNavItems.map(item => `
        <a href="${item.href}" class="nav-link ${(item.activePages || [item.id]).includes(activePage) ? 'active' : ''}" title="${item.label}" aria-label="${item.label}">
          <span class="nav-icon"><i class="${item.icon}" aria-hidden="true"></i></span>
          <span class="nav-label">${item.label}</span>
          ${item.id === 'support' && pendingEscalations > 0 ? `<span class="nav-badge">${pendingEscalations}</span>` : ''}
        </a>
      `).join('')}
      <div class="nav-section-divider">Control Panel</div>
      ${filteredControlItems.map(item => `
        <a href="${item.href}" class="nav-link ${activePage === item.id ? 'active' : ''}" title="${item.label}" aria-label="${item.label}">
          <span class="nav-icon"><i class="${item.icon}" aria-hidden="true"></i></span>
          <span class="nav-label">${item.label}</span>
          ${item.id === 'support' && pendingEscalations > 0 ? `<span class="nav-badge">${pendingEscalations}</span>` : ''}
        </a>
      `).join('')}
    </div>
    <div class="nav-footer">
      <div class="nav-user">
        <span class="user-avatar"><i class="fa-solid fa-user" aria-hidden="true"></i></span>
        <div class="user-info">
          <span class="user-name">${user?.name || 'Guest'}</span>
          <span class="user-role">${sidebarRoleLabel}</span>
        </div>
      </div>
      <button class="nav-logout" onclick="handleLogout()" title="Logout" aria-label="Logout"><i class="nav-logout-icon fa-solid fa-right-from-bracket" aria-hidden="true"></i><span class="nav-logout-label">Logout</span></button>
      <div class="nav-profile-popover" role="tooltip">
        <div class="nav-profile-popover-head">
          <span class="user-avatar"><i class="fa-solid fa-user" aria-hidden="true"></i></span>
          <div>
            <strong>${user?.name || 'Guest'}</strong>
            <span>${tenantRoleLabel || 'User'}</span>
          </div>
        </div>
        ${projectRoleLabel ? `<div class="nav-profile-role">Project role: ${projectRoleLabel}</div>` : ''}
        <button class="nav-popover-logout" onclick="handleLogout()" type="button"><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Logout</button>
      </div>
    </div>
  `;

  document.body.prepend(nav);

  // Show tenant/role label (NO dropdown — tenant is locked to session)
  if (typeof TenantState !== 'undefined') {
    const navHeader = document.querySelector('.nav-header');
    if (navHeader) {
      const current = TenantState.getCurrentTenant();
      const tenantLabel = document.createElement('div');
      tenantLabel.className = 'tenant-switcher';
      if (role === 'tenant' || TenantState.isTenantUser()) {
        tenantLabel.innerHTML = `
          <label class="tenant-switcher-label">ROLE</label>
          <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; padding: 6px 0;">
            <span class="tenant-switcher-value">${tenantRoleLabel || 'Tenant User'}</span>
          </div>
        `;
      }
      navHeader.appendChild(tenantLabel);
    }
  }
  NexusSidebar.apply(sidebarCollapsed);
}

function handleLogout() {
  NexusStore.addLog({ type: 'AUTH', message: `${NexusStore.getUser()?.name} logged out`, agent: 'system' });
  localStorage.removeItem("isLoggedIn");
  NexusStore.logout();
  TenantState.logoutSession();
  localStorage.removeItem("role");
  window.location.href = '../index.html';
}

// Project selector component for pages that need it
function createProjectSelector(containerId, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const projects = typeof NexusPermissions !== 'undefined'
    ? NexusPermissions.getVisibleProjects(NexusStore.getProjects())
    : NexusStore.getProjects();
  const saved = NexusRoleUtils.getSelectedProjectId();
  const selected = projects.some(p => p.id === saved) ? saved : (projects[0]?.id || '');
  if (selected) NexusRoleUtils.setSelectedProjectId(selected, { silent: true });
  NexusRoleUtils.refreshNavigationRole();

  container.innerHTML = `
    <select id="projectSelect" class="project-select" onchange="window._onProjectChange && window._onProjectChange(this.value)">
      ${projects.map(p => `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${p.name}</option>`).join('')}
    </select>
  `;

  window._onProjectChange = (val) => {
    NexusRoleUtils.setSelectedProjectId(val);
    if (onChange) onChange(val);
  };

  return selected;
}

function getSelectedProject() {
  const projects = typeof NexusPermissions !== 'undefined'
    ? NexusPermissions.getVisibleProjects(NexusStore.getProjects())
    : NexusStore.getProjects();
  const saved = NexusRoleUtils.getSelectedProjectId();
  if (projects.some(p => p.id === saved)) return saved;
  const fallback = projects[0]?.id || '';
  if (fallback) NexusRoleUtils.setSelectedProjectId(fallback, { silent: true });
  return fallback;
}

// Toast notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// Loading overlay
function showLoading(text = 'Processing...') {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `<div class="loading-content"><div class="spinner"></div><p>${text}</p></div>`;
  overlay.classList.add('show');
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.remove('show');
}

const InviteUsersModal = {
  filters: [
    { id: 'all', label: 'All' },
    { id: 'sentPending', label: 'Pending Invitations' },
    { id: 'sentAccepted', label: 'Accepted Invitations' }
  ],
  state: {
    rows: [],
    filter: 'all',
    search: '',
    editId: null,
    editErrors: {}
  }
};

function getInviteTenantId() {
  const tenant = TenantState.getCurrentTenant();
  return tenant?.tenant_id || tenant?.id || '';
}

function getInviteCurrentUser() {
  return TenantState.getCurrentTenantUser() || NexusStore.getUser();
}

function ensureInviteUsersModal() {
  if (document.getElementById('inviteUsersModal')) return;
  const modal = document.createElement('div');
  modal.id = 'inviteUsersModal';
  modal.className = 'modal-overlay invite-users-overlay';
  modal.onclick = handleInviteUsersOverlayClick;
  modal.innerHTML = `
    <div class="modal invite-users-modal" role="dialog" aria-modal="true" aria-labelledby="inviteUsersTitle" onclick="event.stopPropagation()">
      <div class="modal-header invite-modal-header">
        <div>
          <h3 class="modal-title" id="inviteUsersTitle">Add Collaborators</h3>
          <p class="invite-modal-subtitle">Add tenant users and assign tenant-level access</p>
        </div>
        <button class="modal-close" aria-label="Close Collaborate" onclick="closeInviteUsersModal()">&times;</button>
      </div>
      <div class="modal-body invite-modal-body">
        <div class="invite-section">
          <div class="invite-section-header">
            <div>
              <h4 class="invite-section-title">New Invitations</h4>
              <p class="invite-section-subtitle">Add one or more people, then choose tenant Admin or Member access.</p>
            </div>
            <button class="btn btn-outline btn-sm" type="button" onclick="addInviteModalRow()">Add Another User</button>
          </div>
          <div id="inviteModalRows"></div>
        </div>

        <div class="invite-section invite-status-section">
          <div class="invite-section-header">
            <div>
              <h4 class="invite-section-title">Invitation Status</h4>
              <p class="invite-section-subtitle">Track pending and accepted invitations without leaving this page.</p>
            </div>
          </div>
          <div class="invite-status-toolbar">
            <div class="invite-filter-pills" id="inviteFilterPills"></div>
            <input type="search" class="form-input invite-search" id="inviteSearchInput" placeholder="Search email or name" oninput="setInviteSearch(this.value)">
          </div>
          <div class="table-container invite-table-wrap">
            <table>
              <thead><tr><th>Email</th><th>Tenant Role</th><th>Status</th><th>Invited Date</th><th>Actions</th></tr></thead>
              <tbody id="inviteStatusTable"></tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="modal-footer invite-modal-footer">
        <button class="btn btn-outline" type="button" onclick="closeInviteUsersModal()">Cancel</button>
        <button class="btn btn-primary" type="button" id="sendInvitationsBtn" onclick="submitInviteModalRows()" disabled>Send Invitations</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const editModal = document.createElement('div');
  editModal.id = 'editInvitationModal';
  editModal.className = 'modal-overlay invite-edit-overlay';
  editModal.innerHTML = `
    <div class="modal invite-edit-modal" role="dialog" aria-modal="true" aria-labelledby="editInvitationTitle" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3 class="modal-title" id="editInvitationTitle">Edit Invitation</h3>
        <button class="modal-close" aria-label="Close Edit Invitation" onclick="closeEditInvitationModal()">&times;</button>
      </div>
      <div class="modal-body" id="editInvitationBody"></div>
      <div class="modal-footer">
        <button class="btn btn-outline" type="button" onclick="closeEditInvitationModal()">Cancel</button>
        <button class="btn btn-primary" type="button" onclick="saveInvitationEdit()">Save Changes</button>
      </div>
    </div>
  `;
  document.body.appendChild(editModal);
}

function openInviteUsersModal() {
  if (!NexusPermissions.canInviteUsers()) {
    showToast('Only the original tenant admin can collaborate.', 'error');
    return;
  }
  ensureInviteUsersModal();
  InviteUsersModal.state.rows = [{ id: Date.now(), email: '', tenantRole: 'member', errors: {} }];
  InviteUsersModal.state.filter = InviteUsersModal.state.filter || 'all';
  InviteUsersModal.state.search = '';
  document.getElementById('inviteSearchInput').value = '';
  renderInviteUsersModal();
  document.getElementById('inviteUsersModal').classList.add('show');
}

function closeInviteUsersModal(force = false) {
  if (!force && hasUnsavedInviteInput() && !confirm('Discard unsent invitation details?')) return;
  document.getElementById('inviteUsersModal')?.classList.remove('show');
}

function handleInviteUsersOverlayClick(event) {
  if (event.target?.id === 'inviteUsersModal') closeInviteUsersModal();
}

function hasUnsavedInviteInput() {
  const rows = [...document.querySelectorAll('#inviteModalRows .invite-row')];
  return rows.some(row => row.querySelector('.invite-email')?.value.trim());
}

function addInviteModalRow(email = '', tenantRole = 'member') {
  InviteUsersModal.state.rows.push({ id: Date.now() + Math.random(), email, tenantRole, errors: {} });
  renderInviteRows();
  updateSendInvitationsState();
}

function removeInviteModalRow(rowId) {
  InviteUsersModal.state.rows = InviteUsersModal.state.rows.filter(row => String(row.id) !== String(rowId));
  if (!InviteUsersModal.state.rows.length) addInviteModalRow();
  else {
    renderInviteRows();
    updateSendInvitationsState();
  }
}

function renderInviteUsersModal() {
  renderInviteRows();
  renderInviteFilters();
  renderInvitationStatusTable();
  updateSendInvitationsState();
}

function renderInviteRows() {
  const rowsEl = document.getElementById('inviteModalRows');
  if (!rowsEl) return;
  rowsEl.innerHTML = InviteUsersModal.state.rows.map(row => `
    <div class="invite-row" data-row-id="${row.id}">
      <div>
        <input type="email" class="form-input invite-email" placeholder="user@company.com" value="${escapeHtml(row.email)}" oninput="syncInviteRow('${row.id}', 'email', this.value)">
        ${row.errors?.email ? `<div class="form-error">${escapeHtml(row.errors.email)}</div>` : ''}
      </div>
      <div>
        <select class="form-select invite-role" onchange="syncInviteRow('${row.id}', 'tenantRole', this.value)">
          <option value="">Select role</option>
          <option value="member" ${row.tenantRole === 'member' ? 'selected' : ''}>Member</option>
          <option value="admin" ${row.tenantRole === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
        ${row.errors?.tenantRole ? `<div class="form-error">${escapeHtml(row.errors.tenantRole)}</div>` : ''}
      </div>
      <button class="btn btn-outline btn-sm" type="button" onclick="removeInviteModalRow('${row.id}')">Remove</button>
    </div>
  `).join('');
}

function syncInviteRow(rowId, key, value) {
  const row = InviteUsersModal.state.rows.find(item => String(item.id) === String(rowId));
  if (!row) return;
  row[key] = key === 'email' ? value.trim().toLowerCase() : value;
  row.errors = {};
  updateSendInvitationsState();
}

function getInviteRowsFromDom() {
  return [...document.querySelectorAll('#inviteModalRows .invite-row')].map(row => ({
    id: row.dataset.rowId,
    email: row.querySelector('.invite-email').value.trim().toLowerCase(),
    tenantRole: row.querySelector('.invite-role').value,
    errors: {}
  }));
}

function isInviteEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateInviteRows(rows) {
  const tenantId = getInviteTenantId();
  const users = TenantState.getTenantUsers(tenantId);
  const invitations = TenantState.getTenantInvitations(tenantId);
  const seen = new Set();
  let ok = true;

  rows.forEach(row => {
    row.errors = {};
    if (!row.email) row.errors.email = 'Email is required.';
    else if (!isInviteEmailValid(row.email)) row.errors.email = 'Enter a valid email address.';
    else if (seen.has(row.email)) row.errors.email = 'This email is already in the invite list.';
    else {
      const activeUser = users.find(user => user.email === row.email && user.status === 'ACTIVE');
      const pendingInvite = invitations.find(inv => inv.email === row.email && inv.invitationStatus === 'pending');
      if (activeUser) row.errors.email = 'This email already belongs to an active tenant user.';
      else if (pendingInvite) row.errors.email = 'This email already has a pending invitation.';
    }
    if (!row.tenantRole) row.errors.tenantRole = 'Choose a tenant role.';
    seen.add(row.email);
    if (Object.keys(row.errors).length) ok = false;
  });

  return ok;
}

function updateSendInvitationsState() {
  const btn = document.getElementById('sendInvitationsBtn');
  if (!btn) return;
  const rows = getInviteRowsFromDom();
  btn.disabled = !rows.some(row => row.email && isInviteEmailValid(row.email) && row.tenantRole);
}

function submitInviteModalRows() {
  if (!NexusPermissions.canInviteUsers()) {
    showToast('Only the original tenant admin can collaborate.', 'error');
    return;
  }

  const tenantId = getInviteTenantId();
  const rows = getInviteRowsFromDom().filter(row => row.email);
  if (!rows.length) {
    showToast('Add at least one email address.', 'error');
    return;
  }
  if (!validateInviteRows(rows)) {
    InviteUsersModal.state.rows = rows;
    renderInviteRows();
    updateSendInvitationsState();
    showToast('Please fix invitation details.', 'error');
    return;
  }

  rows.forEach(item => {
    const invitation = TenantState.addTenantInvitation(tenantId, {
      email: item.email,
      tenantRole: item.tenantRole,
      invitationStatus: 'pending',
      invitedBy: getInviteCurrentUser()?.id || null,
      lastSentAt: new Date().toISOString()
    });
    const existing = TenantState.findTenantUserByEmail(tenantId, item.email);
    if (!existing) {
      TenantState.addTenantUser(tenantId, {
        id: TenantState.generateUserId(),
        tenantId,
        name: item.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        email: item.email,
        tenantRole: item.tenantRole,
        invitationStatus: 'pending',
        status: 'PENDING',
        createdAt: invitation.invitedAt
      });
    } else {
      TenantState.updateTenantUser(tenantId, existing.id, {
        tenantRole: item.tenantRole,
        role: item.tenantRole === 'admin' ? 'Admin' : 'Member',
        invitationStatus: existing.invitationStatus || 'pending'
      });
    }
  });

  TenantState.updateTenant(tenantId, { users: TenantState.getTenantUsers(tenantId).length });
  NexusStore.addLog({ type: 'USERS', message: `${rows.length} invitation(s) sent`, agent: 'system' });
  InviteUsersModal.state.rows = [{ id: Date.now(), email: '', tenantRole: 'member', errors: {} }];
  renderInviteUsersModal();
  showToast(`${rows.length} invitation${rows.length === 1 ? '' : 's'} sent.`, 'success');
}

function invitationMatchesFilter(invitation) {
  const filter = InviteUsersModal.state.filter;
  if (filter === 'sentPending') return invitation.invitationStatus === 'pending';
  if (filter === 'sentAccepted') return invitation.invitationStatus === 'accepted';
  return true;
}

function setInviteFilter(filter) {
  InviteUsersModal.state.filter = filter;
  renderInviteFilters();
  renderInvitationStatusTable();
}

function setInviteSearch(value) {
  InviteUsersModal.state.search = value.trim().toLowerCase();
  renderInvitationStatusTable();
}

function renderInviteFilters() {
  const el = document.getElementById('inviteFilterPills');
  if (!el) return;
  el.innerHTML = InviteUsersModal.filters.map(filter => `
    <button type="button" class="invite-filter-pill ${InviteUsersModal.state.filter === filter.id ? 'active' : ''}" onclick="setInviteFilter('${filter.id}')">${filter.label}</button>
  `).join('');
}

function getInvitationEmptyState() {
  const labels = {
    sentPending: 'No pending invitations',
    sentAccepted: 'No accepted invitations yet',
    all: 'No invitations found'
  };
  return labels[InviteUsersModal.state.filter] || labels.all;
}

function renderInvitationStatusTable() {
  const tenantId = getInviteTenantId();
  const users = TenantState.getTenantUsers(tenantId);
  const query = InviteUsersModal.state.search;
  const invitations = TenantState.getTenantInvitations(tenantId)
    .filter(invitationMatchesFilter)
    .filter(inv => {
      if (!query) return true;
      const user = users.find(item => item.email === inv.email);
      return inv.email.includes(query) || (user?.name || '').toLowerCase().includes(query);
    });

  const body = document.getElementById('inviteStatusTable');
  if (!body) return;
  body.innerHTML = invitations.map(inv => {
    const user = users.find(item => item.email === inv.email);
    return `
      <tr>
        <td><div class="invite-email-cell">${escapeHtml(user?.name || inv.email.split('@')[0])}<span>${escapeHtml(inv.email)}</span></div></td>
        <td><span class="tag">${inv.tenantRole === 'admin' ? 'Admin' : 'Member'}</span></td>
        <td>${renderInviteStatusBadge(inv.invitationStatus)}</td>
        <td><span title="${escapeHtml(formatTime(inv.invitedAt))}">${formatTime(inv.invitedAt)}</span>${inv.lastSentAt ? `<div class="invite-date-sub">Last sent ${formatTime(inv.lastSentAt)}</div>` : ''}</td>
        <td><div class="invite-actions">${renderInvitationActions(inv, user)}</div></td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="5"><div class="invite-empty-state">${getInvitationEmptyState()}</div></td></tr>`;
}

function renderInviteStatusBadge(status) {
  const value = String(status || 'pending').toLowerCase();
  const label = value.replace(/\b\w/g, c => c.toUpperCase());
  const colors = {
    pending: '#f59e0b',
    accepted: '#10b981',
    cancelled: '#6b7280',
    expired: '#ef4444'
  };
  const color = colors[value] || '#6b7280';
  return `<span class="status-badge" style="background:${color}20;color:${color};border:1px solid ${color}40">${label}</span>`;
}

function renderInvitationActions(invitation, user) {
  const status = invitation.invitationStatus;
  if (status === 'pending') {
    return `
      <button class="btn btn-outline btn-sm" onclick="openEditInvitationModal('${invitation.id}')">Edit</button>
      <button class="btn btn-outline btn-sm" onclick="resendInvitation('${invitation.id}')">Resend</button>
      <button class="btn btn-outline btn-sm" onclick="cancelInvitation('${invitation.id}')">Cancel</button>
      <button class="btn btn-outline btn-sm danger-action" onclick="deleteInvitation('${invitation.id}')">Delete</button>
    `;
  }
  if (status === 'accepted') {
    return `
      <button class="btn btn-outline btn-sm" onclick="viewInviteDetails('${invitation.id}')">View User</button>
      ${user && !user.isTenantOwner ? `<button class="btn btn-outline btn-sm" onclick="openEditInvitationModal('${invitation.id}', true)">Change Role</button><button class="btn btn-outline btn-sm danger-action" onclick="removeTenantUserFromInvite('${user.id}')">Remove User</button>` : '<span class="invite-readonly">Owner</span>'}
    `;
  }
  return `<button class="btn btn-outline btn-sm" onclick="viewInviteDetails('${invitation.id}')">View Details</button>`;
}

function openEditInvitationModal(invitationId, manageAccepted = false) {
  const tenantId = getInviteTenantId();
  const invitation = TenantState.getTenantInvitations(tenantId).find(inv => inv.id === invitationId);
  if (!invitation) return;
  InviteUsersModal.state.editId = invitationId;
  InviteUsersModal.state.editErrors = {};
  renderEditInvitationModal(invitation, manageAccepted);
  document.getElementById('editInvitationModal').classList.add('show');
}

function renderEditInvitationModal(invitation, manageAccepted = false) {
  document.getElementById('editInvitationTitle').textContent = manageAccepted ? 'Manage User Role' : 'Edit Invitation';
  document.getElementById('editInvitationBody').innerHTML = `
    <div class="form-group">
      <label class="form-label">Email Address</label>
      <input class="form-input" id="editInviteEmail" type="email" value="${escapeHtml(invitation.email)}" ${manageAccepted ? 'readonly' : ''}>
      ${InviteUsersModal.state.editErrors.email ? `<div class="form-error">${escapeHtml(InviteUsersModal.state.editErrors.email)}</div>` : ''}
    </div>
    <div class="form-group">
      <label class="form-label">Tenant Role</label>
      <select class="form-select" id="editInviteRole">
        <option value="member" ${invitation.tenantRole === 'member' ? 'selected' : ''}>Member</option>
        <option value="admin" ${invitation.tenantRole === 'admin' ? 'selected' : ''}>Admin</option>
      </select>
      ${InviteUsersModal.state.editErrors.tenantRole ? `<div class="form-error">${escapeHtml(InviteUsersModal.state.editErrors.tenantRole)}</div>` : ''}
    </div>
  `;
}

function closeEditInvitationModal() {
  document.getElementById('editInvitationModal')?.classList.remove('show');
  InviteUsersModal.state.editId = null;
}

function saveInvitationEdit() {
  const tenantId = getInviteTenantId();
  const invitation = TenantState.getTenantInvitations(tenantId).find(inv => inv.id === InviteUsersModal.state.editId);
  if (!invitation) return;
  const email = document.getElementById('editInviteEmail').value.trim().toLowerCase();
  const tenantRole = document.getElementById('editInviteRole').value;
  InviteUsersModal.state.editErrors = {};

  if (!email) InviteUsersModal.state.editErrors.email = 'Email is required.';
  else if (!isInviteEmailValid(email)) InviteUsersModal.state.editErrors.email = 'Enter a valid email address.';
  if (!tenantRole) InviteUsersModal.state.editErrors.tenantRole = 'Choose a tenant role.';

  const activeUser = TenantState.getTenantUsers(tenantId)
    .find(user => user.email === email && user.email !== invitation.email && user.status === 'ACTIVE');
  const duplicate = TenantState.getTenantInvitations(tenantId)
    .find(inv => inv.id !== invitation.id && inv.email === email && inv.invitationStatus === 'pending');
  if (activeUser) InviteUsersModal.state.editErrors.email = 'This email already belongs to an active tenant user.';
  else if (duplicate) InviteUsersModal.state.editErrors.email = 'This email already has a pending invitation.';

  if (Object.keys(InviteUsersModal.state.editErrors).length) {
    renderEditInvitationModal(invitation, invitation.invitationStatus === 'accepted');
    return;
  }

  const updated = TenantState.updateTenantInvitation(tenantId, invitation.id, { email, tenantRole });
  const user = TenantState.findTenantUserByEmail(tenantId, invitation.email);
  if (user) TenantState.updateTenantUser(tenantId, user.id, { email, tenantRole, role: tenantRole === 'admin' ? 'Admin' : 'Member' });
  closeEditInvitationModal();
  renderInviteUsersModal();
  showToast(updated?.invitationStatus === 'accepted' ? 'User role updated.' : 'Invitation updated.', 'success');
}

function resendInvitation(invitationId) {
  TenantState.updateTenantInvitation(getInviteTenantId(), invitationId, { lastSentAt: new Date().toISOString() });
  renderInvitationStatusTable();
  showToast('Invitation resent.', 'success');
}

function cancelInvitation(invitationId) {
  const tenantId = getInviteTenantId();
  const invitation = TenantState.updateTenantInvitation(tenantId, invitationId, { invitationStatus: 'cancelled', cancelledAt: new Date().toISOString() });
  const user = invitation ? TenantState.findTenantUserByEmail(tenantId, invitation.email) : null;
  if (user && user.status === 'PENDING') TenantState.removeTenantUser(tenantId, user.id);
  TenantState.updateTenant(tenantId, { users: TenantState.getTenantUsers(tenantId).length });
  renderInviteUsersModal();
  showToast('Invitation cancelled.', 'success');
}

function deleteInvitation(invitationId) {
  if (!confirm('Are you sure you want to delete this invitation?')) return;
  const tenantId = getInviteTenantId();
  const invitation = TenantState.getTenantInvitations(tenantId).find(inv => inv.id === invitationId);
  TenantState.removeTenantInvitation(tenantId, invitationId);
  const user = invitation ? TenantState.findTenantUserByEmail(tenantId, invitation.email) : null;
  if (user && user.status === 'PENDING') TenantState.removeTenantUser(tenantId, user.id);
  TenantState.updateTenant(tenantId, { users: TenantState.getTenantUsers(tenantId).length });
  renderInviteUsersModal();
  showToast('Invitation deleted.', 'success');
}

function removeTenantUserFromInvite(userId) {
  if (!confirm('Are you sure you want to remove this user from the tenant?\n\nUser access will be revoked.')) return;
  const tenantId = getInviteTenantId();
  const user = TenantState.getTenantUsers(tenantId).find(item => item.id === userId);
  if (!user || user.isTenantOwner) return;
  TenantState.removeTenantUser(tenantId, userId);
  const invitation = TenantState.getTenantInvitations(tenantId).find(inv => inv.email === user.email);
  if (invitation) TenantState.updateTenantInvitation(tenantId, invitation.id, { invitationStatus: 'cancelled', removedAt: new Date().toISOString() });
  TenantState.updateTenant(tenantId, { users: TenantState.getTenantUsers(tenantId).length });
  renderInviteUsersModal();
  showToast('User removed from tenant.', 'success');
}

function viewInviteDetails(invitationId) {
  const inv = TenantState.getTenantInvitations(getInviteTenantId()).find(item => item.id === invitationId);
  if (!inv) return;
  showToast(`${inv.email} is ${inv.invitationStatus}.`, 'info');
}

// Format timestamp
function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Status badge
function statusBadge(status) {
  const colors = {
    'COMPLETED': '#10b981', 'DONE': '#10b981', 'PASS': '#10b981', 'PASSED': '#10b981', 'ACTIVE': '#10b981', 'APPROVED': '#10b981', 'RESOLVED': '#10b981',
    'IN_PROGRESS': '#3b82f6', 'EXECUTING': '#3b82f6',
    'PENDING': '#f59e0b', 'SPECIFIED': '#f59e0b', 'CONFIGURED': '#f59e0b',
    'AGENT_ASSIGNED': '#8b5cf6', 'GATE_REVIEW': '#8b5cf6',
    'BLOCKED': '#ef4444', 'FAIL': '#ef4444', 'FAILED': '#ef4444', 'REJECTED': '#ef4444',
    'ESCALATED': '#f97316',
    'IDLE': '#6b7280',
    'CREATED': '#8b5cf6', 'LEARNING': '#8b5cf6', 'OPTIMIZED': '#a855f7',
    'RETIRED': '#6b7280', 'NOT_STARTED': '#6b7280'
  };
  const color = colors[status] || '#6b7280';
  return `<span class="status-badge" style="background: ${color}20; color: ${color}; border: 1px solid ${color}40">${status}</span>`;
}

// Risk badge
function riskBadge(risk) {
  const colors = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };
  const color = colors[risk] || '#6b7280';
  return `<span class="risk-badge" style="background: ${color}20; color: ${color}; border: 1px solid ${color}40">${risk}</span>`;
}

// Priority badge
function priorityBadge(priority) {
  const labels = { MUST_HAVE: 'Must Have', SHOULD_HAVE: 'Should Have', COULD_HAVE: 'Could Have', WONT_HAVE: "Won't Have", UNCLASSIFIED: 'Unclassified' };
  const colors = { MUST_HAVE: '#ef4444', SHOULD_HAVE: '#f59e0b', COULD_HAVE: '#3b82f6', WONT_HAVE: '#6b7280', UNCLASSIFIED: '#6b7280' };
  const label = labels[priority] || priority;
  const color = colors[priority] || '#6b7280';
  return `<span class="priority-badge" style="background: ${color}20; color: ${color}; border: 1px solid ${color}40">${label}</span>`;
}

// Tab switching helper
function switchTab(tabGroup, tabId) {
  document.querySelectorAll(`[data-tab-group="${tabGroup}"] .tab`).forEach(t => t.classList.remove('active'));
  document.querySelectorAll(`[data-tab-group="${tabGroup}"] .tab-content`).forEach(c => c.classList.remove('active'));
  document.querySelector(`[data-tab-group="${tabGroup}"] .tab[data-tab="${tabId}"]`)?.classList.add('active');
  document.getElementById(tabId)?.classList.add('active');
}

// Generic escape HTML
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Section divider for nav
function navSectionDivider(text) {
  return `<div class="nav-section-divider">${text}</div>`;
}
