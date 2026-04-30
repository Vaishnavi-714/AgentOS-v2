// NEXUS Navigation Component — Enterprise Multi-Tenant Platform
function createNavigation(activePage) {
  // Session protection: must be logged in
  if (activePage !== 'login' && activePage !== 'landing') {
    if (!TenantState.isLoggedIn()) {
      window.location.href = 'index.html';
      return;
    }
  }

  const user = NexusStore.getUser();
  const systemState = NexusStore.getSystemState();
  const role = TenantState.getRole();


  // ─── Master Navigation Structure ───
  const mainNavItems = [
    { id: 'portfolio', label: 'Portfolio', icon: '🏢', href: 'portfolio.html' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'dashboard.html' },
    { id: 'workspace', label: 'Workspace', icon: '💬', href: 'workspace.html' },
    { id: 'projects', label: 'Projects', icon: '📂', href: 'projects.html' },
    { id: 'agents', label: 'Agents', icon: '🤖', href: 'agents.html' },
    { id: 'workflows', label: 'Workflows', icon: '🔄', href: 'workflows.html' },
    { id: 'repositories', label: 'Repositories', icon: '📦', href: 'repositories.html' },
    { id: 'testing', label: 'Testing', icon: '🧪', href: 'testing.html' },
    { id: 'deployments', label: 'Deployments', icon: '🚀', href: 'deployments.html' },
    { id: 'analytics', label: 'Analytics', icon: '📈', href: 'analytics.html' },
    { id: 'integrations', label: 'Integrations', icon: '🔗', href: 'integrations.html' }
  ];

  const controlNavItems = [
    { id: 'support', label: 'Support', icon: '🚨', href: 'support.html' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: 'settings.html' }
  ];

  const filteredControlItems = controlNavItems;

  const pendingEscalations = NexusStore.getEscalations().filter(e => e.status === 'PENDING').length;
  const unreadNotifs = (NexusStore.getNotifications() || []).filter(n => !n.read).length;

  const stateColors = { IDLE: '#6b7280', EXECUTING: '#10b981', ESCALATION_PENDING: '#f59e0b', BLOCKED: '#ef4444', GATE_REVIEW: '#8b5cf6', RELEASED: '#3b82f6' };

  const nav = document.createElement('nav');
  nav.className = 'nexus-nav';
  nav.innerHTML = `
    <div class="nav-header">
      <div class="nav-brand">
        <span class="brand-icon">🧠</span>
        <span class="brand-text">NEXUS</span>
      </div>
      <div class="system-state" style="background: ${stateColors[systemState] || '#6b7280'}20; color: ${stateColors[systemState] || '#6b7280'}; border: 1px solid ${stateColors[systemState] || '#6b7280'}40">
        <span class="state-dot" style="background: ${stateColors[systemState] || '#6b7280'}"></span>
        ${systemState}
      </div>
    </div>
    <div class="nav-links">
      ${mainNavItems.map(item => `
        <a href="${item.href}" class="nav-link ${activePage === item.id ? 'active' : ''}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
          ${item.id === 'support' && pendingEscalations > 0 ? `<span class="nav-badge">${pendingEscalations}</span>` : ''}
        </a>
      `).join('')}
      <div class="nav-section-divider">Control Plane</div>
      ${filteredControlItems.map(item => `
        <a href="${item.href}" class="nav-link ${activePage === item.id ? 'active' : ''}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
          ${item.id === 'support' && pendingEscalations > 0 ? `<span class="nav-badge">${pendingEscalations}</span>` : ''}
        </a>
      `).join('')}
    </div>
    <div class="nav-footer">
      <div class="nav-user">
        <span class="user-avatar">${user?.avatar || '👤'}</span>
        <div class="user-info">
          <span class="user-name">${user?.name || 'Guest'}</span>
          <span class="user-role">${user?.role || ''}</span>
        </div>
      </div>
      <button class="nav-logout" onclick="handleLogout()">Logout</button>
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
            <span>👨‍💻</span> Tenant User / Developer <span style="font-size: 11px; color: var(--text-muted);">🔒</span>
          </div>
        `;
      }
      navHeader.appendChild(tenantLabel);
    }
  }
}

function handleLogout() {
  NexusStore.addLog({ type: 'AUTH', message: `${NexusStore.getUser()?.name} logged out`, agent: 'system' });
  NexusStore.logout();
  TenantState.logoutSession();
  localStorage.removeItem("role");
  window.location.href = '../index.html';
}

// Project selector component for pages that need it
function createProjectSelector(containerId, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const projects = NexusStore.getProjects();
  const selected = sessionStorage.getItem('nexus_selected_project') || (projects[0]?.id || '');

  container.innerHTML = `
    <select id="projectSelect" class="project-select" onchange="window._onProjectChange && window._onProjectChange(this.value)">
      ${projects.map(p => `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${p.name} (${p.status})</option>`).join('')}
    </select>
  `;

  window._onProjectChange = (val) => {
    sessionStorage.setItem('nexus_selected_project', val);
    if (onChange) onChange(val);
  };

  return selected;
}

function getSelectedProject() {
  return sessionStorage.getItem('nexus_selected_project') || NexusStore.getProjects()[0]?.id || '';
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
