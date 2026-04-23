// NEXUS Multi-Tenant App Utilities

// Tenant switcher is now auto-injected by nav.js — this is kept as a safe no-op
function injectTenantSwitcher() {}

// Inject tenant info card at top of main content
function injectTenantInfoCard() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  const tenant = TenantState.getCurrentTenant();
  if (!tenant) return;

  const limits = TenantState.getSubscriptionLimits(tenant.subscription);
  const warnings = TenantState.checkLimits(tenant);

  const card = document.createElement('div');
  card.className = 'tenant-info-bar fade-in';
  card.id = 'tenantInfoBar';
  card.innerHTML = `
    <div class="tenant-info-main">
      <div class="tenant-info-identity">
        <span class="tenant-info-icon">${limits.icon}</span>
        <div>
          <span class="tenant-info-name">${tenant.name}</span>
          <span class="tenant-info-domain">${tenant.domain}</span>
        </div>
      </div>
      <div class="tenant-info-badges">
        <span class="tenant-plan-badge" style="background: ${limits.color}20; color: ${limits.color}; border: 1px solid ${limits.color}40">
          ${limits.label}
        </span>
        <span class="status-badge" style="background: #10b98120; color: #10b981; border: 1px solid #10b98140">
          ${tenant.status}
        </span>
        <span class="tenant-region-badge">🌍 ${tenant.region}</span>
      </div>
    </div>
    ${warnings.length > 0 ? `
      <div class="tenant-warnings">
        ${warnings.map(w => `
          <span class="tenant-warning-badge ${w.severity}">
            ⚠ ${w.message}
          </span>
        `).join('')}
      </div>
    ` : ''}
  `;

  mainContent.insertBefore(card, mainContent.firstChild);
}

// Render subscription badge
function subscriptionBadge(plan) {
  const limits = TenantState.subscriptionLimits[plan];
  if (!limits) return '';
  return `<span class="status-badge" style="background: ${limits.color}20; color: ${limits.color}; border: 1px solid ${limits.color}40">${limits.icon} ${limits.label}</span>`;
}

// Escape HTML
function escapeHtmlSafe(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
