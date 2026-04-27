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

// Scroll-to-section logic for tabs/nav items
document.addEventListener('DOMContentLoaded', () => {
  const mainContainer = document.querySelector('.main-content');
  
  // Initialize scroll listeners
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);

      if (target && mainContainer) {
        const offset = 80;
        mainContainer.scrollTo({
          top: target.offsetTop - offset,
          behavior: "smooth"
        });
        
        // Remove active class from all tabs, add to clicked
        document.querySelectorAll(".nav-link.tab, .tab").forEach(link => {
          link.classList.remove("active");
        });
        this.classList.add("active");
      }
    });
  });

  if (mainContainer) {
    mainContainer.addEventListener("scroll", () => {
      const sections = document.querySelectorAll("section, div[id$='-section'], .tab-content");
      const scrollPos = mainContainer.scrollTop + 100;

      sections.forEach(section => {
        if (
          scrollPos >= section.offsetTop &&
          scrollPos < section.offsetTop + section.offsetHeight
        ) {
          document.querySelectorAll(".nav-link.tab, .tab").forEach(link => {
            link.classList.remove("active");
          });

          const activeLink = document.querySelector(`a[href="#${section.id}"]`);
          if (activeLink) activeLink.classList.add("active");
        }
      });
    });
  }
});
