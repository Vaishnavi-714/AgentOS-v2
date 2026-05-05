const DevRender = {
  _refreshTimer: null,
  _activeConfig: null,

  tabs: [
    { id: 'overview', label: 'Overview', href: 'dev-overview.html' },
    { id: 'scope', label: 'Scope', href: 'dev-scope.html' },
    { id: 'deliverables', label: 'Deliverables', href: 'dev-deliverables.html' },
    { id: 'schedule', label: 'Schedule', href: 'dev-schedule.html' },
    { id: 'quality', label: 'Quality', href: 'dev-quality.html' },
    { id: 'resources', label: 'Resources', href: 'dev-resources.html' },
    { id: 'risks', label: 'Risks', href: 'dev-risks.html' },
    { id: 'summary', label: 'Summary', href: 'dev-summary.html' }
  ],

  escape(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(value);
    const div = document.createElement('div');
    div.textContent = value || '';
    return div.innerHTML;
  },

  mount(targetId, html) {
    const el = document.getElementById(targetId);
    if (el) el.innerHTML = html;
  },

  list(items, fallback) {
    return Array.isArray(items) && items.length ? items : fallback;
  },

  metric(value, fallback) {
    return value ?? fallback;
  },

  renderTabs(activeTab) {
    return `
      <div class="tabs" data-tab-group="dev-dashboard">
        ${this.tabs.map(tab => `<a href="${tab.href}" class="tab nav-link ${tab.id === activeTab ? 'active' : ''}">${tab.label}</a>`).join('')}
      </div>
    `;
  },

  renderHeader(meta, activeTab, pageTitle, pageSubtitle) {
    return `
      <div class="page-header">
        <div style="display:flex;align-items:center;gap:12px">
          <a href="role-dashboard.html" class="back-btn">← Control Center</a>
          <div>
            <h1 class="page-title">${pageTitle}</h1>
            <p class="page-subtitle">${pageSubtitle}</p>
          </div>
        </div>
        <div class="page-actions">
          <span class="tag">${this.escape(meta.domain)}</span>
          <span class="status-badge">${this.escape(meta.projectStatus)}</span>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">${this.escape(meta.projectName)}</h3>
            <p class="card-subtitle">${this.escape(meta.audience)}</p>
          </div>
          <span class="tag">${this.escape(activeTab.charAt(0).toUpperCase() + activeTab.slice(1))}</span>
        </div>
        <div class="grid grid-4">
          <div class="stat-card"><span class="stat-label">Purpose</span><span class="stat-value" style="font-size:16px">${this.escape(meta.purpose)}</span></div>
          <div class="stat-card"><span class="stat-label">Tech Stack</span><span class="stat-value" style="font-size:16px">${this.escape(meta.techStack.join(', '))}</span></div>
          <div class="stat-card"><span class="stat-label">Domain</span><span class="stat-value" style="font-size:16px">${this.escape(meta.domain)}</span></div>
          <div class="stat-card"><span class="stat-label">Project Status</span><span class="stat-value" style="font-size:16px">${this.escape(meta.projectStatus)}</span></div>
        </div>
      </div>
    `;
  },

  async bootstrapPage(config) {
    this._activeConfig = config;
    const role = localStorage.getItem('role');
    if (role !== 'tenant') {
      window.location.href = '../index.html';
      return;
    }

    seedNexusData();
    createNavigation('role-dashboard');
    if (TenantState.isTenantUser()) injectTenantInfoCard();

    const meta = await DevData.loadMeta();
    this.mount('devPageChrome', `${this.renderHeader(meta, config.activeTab, config.pageTitle, config.pageSubtitle)}${this.renderTabs(config.activeTab)}`);
    if (typeof showLoading === 'function') showLoading(`Loading ${config.pageTitle}...`);
    try {
      const data = await DevData.loadSection(config.section);
      this[config.renderMethod](data);
      if (config.section !== 'overview') {
        this.startRealtime();
      } else if (this._refreshTimer) {
        clearInterval(this._refreshTimer);
        this._refreshTimer = null;
      }
    } finally {
      if (typeof hideLoading === 'function') hideLoading();
    }
  },

  startRealtime() {
    if (this._refreshTimer) clearInterval(this._refreshTimer);
    this._refreshTimer = setInterval(async () => {
      DevData.updateRandomTaskStatus();
      if (!this._activeConfig) return;
      const data = await DevData.loadSection(this._activeConfig.section);
      this[this._activeConfig.renderMethod](data);
    }, 5000);
  },

  renderOverview(data) {
    const deliverables = { completed: 62, inProgress: 66, pending: 1 };
    const modules = [
      { name: 'auth', progress: 100, completed: 5, total: 5 },
      { name: 'payments', progress: 25, completed: 1, total: 4 },
      { name: 'dashboard', progress: 50, completed: 2, total: 4 }
    ];
    const achievements = this.list(data?.keyAchievements, DevData.defaultAchievements);
    const challenges = this.list(data?.challenges, DevData.defaultChallenges);
    const forwardPlan = this.list(data?.forwardPlan, [
      'Advance payments integration implementation',
      'Close open module blockers',
      'Prepare next dev review checkpoint'
    ]);
    const recommendations = this.list(data?.recommendations, [
      'Focus on critical path execution',
      'Increase testing rigor on active stories',
      'Stabilize dependencies before widening scope'
    ]);

    this.mount('devPageContent', `
      <div class="grid grid-3" style="margin-bottom:20px">
        <div class="stat-card"><span class="stat-label">Completed Deliverables</span><span id="completedDeliverables" class="stat-value" style="color:var(--success)">62</span></div>
        <div class="stat-card"><span class="stat-label">In Progress</span><span id="inProgress" class="stat-value" style="color:var(--accent)">66</span></div>
        <div class="stat-card"><span class="stat-label">Pending</span><span id="pending" class="stat-value" style="color:var(--warning)">1</span></div>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">Modules</h3></div>
        ${modules.map(module => `<div class="metric-bar"><span class="metric-label">${this.escape(module.name)}</span><div class="metric-track"><div class="metric-fill" style="width:${module.progress}%;background:${module.progress >= 80 ? '#10b981' : module.progress >= 40 ? '#3b82f6' : '#f59e0b'}"></div></div><span class="metric-value">${module.completed}/${module.total}</span></div>`).join('')}
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        <div class="card"><div class="card-header"><h3 class="card-title">Key Achievements</h3></div>${achievements.map(item => `<div class="pipeline-stage completed"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
        <div class="card"><div class="card-header"><h3 class="card-title">Challenges</h3></div>${challenges.map(item => `<div class="pipeline-stage pending"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        <div class="card"><div class="card-header"><h3 class="card-title">Forward Plan</h3></div>${forwardPlan.map(item => `<div class="pipeline-stage in-progress"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
        <div class="card"><div class="card-header"><h3 class="card-title">Recommendations</h3></div>${recommendations.map(item => `<div class="pipeline-stage completed"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
      </div>
    `);
  },

  renderScope(data) {
    const definedScope = this.list(data?.definedScope, [
      { id: 'SCP-001', title: 'Authentication flow hardening', module: 'auth', status: 'IN_PROGRESS' },
      { id: 'SCP-002', title: 'Payments API delivery', module: 'payments', status: 'PENDING' }
    ]);
    const scopeChanges = this.list(data?.scopeChanges, [
      { id: 'SCH-001', title: 'Reporting module optimization added', module: 'reports', impact: 'Medium', status: 'IN_PROGRESS' }
    ]);
    const changeRequests = this.list(data?.changeRequests, [
      { id: 'CR-001', title: 'Expand dashboard analytics support', module: 'dashboard', impact: 'SHOULD_HAVE', status: 'OPEN' }
    ]);

    this.mount('devPageContent', `
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Defined Scope</h3></div>
          ${definedScope.map(item => `<div class="decision-log-item"><div class="decision-log-title">${this.escape(item.title)}</div><div class="decision-log-meta"><span>${this.escape(item.id)}</span><span>${this.escape(item.module)}</span><span>${statusBadge(item.status || 'IN_PROGRESS')}</span></div></div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Scope Changes Affecting Development</h3></div>
          ${scopeChanges.map(item => `<div class="decision-log-item"><div class="decision-log-title">${this.escape(item.title)}</div><div class="decision-log-meta"><span>${this.escape(item.module)}</span><span>${this.escape(item.impact)}</span><span>${statusBadge(item.status || 'PENDING')}</span></div></div>`).join('')}
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-header"><h3 class="card-title">Change Requests Impacting Dev Work</h3></div>
        <div class="table-container"><table><thead><tr><th>ID</th><th>Request</th><th>Module</th><th>Impact</th><th>Status</th></tr></thead><tbody>
          ${changeRequests.map(item => `<tr><td style="font-family:var(--mono);color:var(--accent)">${this.escape(item.id)}</td><td>${this.escape(item.title)}</td><td>${this.escape(item.module)}</td><td>${this.escape(item.impact)}</td><td>${statusBadge(item.status || 'OPEN')}</td></tr>`).join('')}
        </tbody></table></div>
      </div>
    `);
  },

  renderDeliverables(data) {
    const deliverables = this.list(data?.assignedDeliverables, [
      { id: 'DEV-001', title: 'Complete authentication delivery', module: 'auth', assignee: 'Developer Agent - Auth 01', rawStatus: 'DONE', progress: 100 },
      { id: 'DEV-002', title: 'Stabilize payments integration', module: 'payments', assignee: 'Developer Agent - Payments 01', rawStatus: 'IN_PROGRESS', progress: 68 }
    ]);
    const modules = this.list(data?.moduleBreakdown, [
      { name: 'auth', progress: 82, completed: 4, total: 5 },
      { name: 'payments', progress: 54, completed: 2, total: 4 }
    ]);

    this.mount('devPageContent', `
      <div class="card">
        <div class="card-header"><h3 class="card-title">Assigned Deliverables</h3></div>
        <div class="table-container"><table><thead><tr><th>ID</th><th>Deliverable</th><th>Module</th><th>Assignee</th><th>Status</th><th>Progress</th></tr></thead><tbody>
          ${deliverables.map(item => `<tr><td style="font-family:var(--mono);color:var(--accent)">${this.escape(item.id)}</td><td>${this.escape(item.title)}</td><td><span class="tag">${this.escape(item.module)}</span></td><td>${this.escape(item.assignee)}</td><td>${statusBadge(item.rawStatus || 'IN_PROGRESS')}</td><td style="min-width:180px"><div class="progress-bar"><div class="progress-fill" style="width:${item.progress || 25}%"></div></div></td></tr>`).join('')}
        </tbody></table></div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-header"><h3 class="card-title">Module-Level Breakdown</h3></div>
        ${modules.map(module => `<div class="metric-bar"><span class="metric-label">${this.escape(module.name)}</span><div class="metric-track"><div class="metric-fill" style="width:${module.progress || 20}%;background:${(module.progress || 20) >= 80 ? '#10b981' : (module.progress || 20) >= 40 ? '#3b82f6' : '#f59e0b'}"></div></div><span class="metric-value">${this.metric(module.completed, module.done || 1)}/${this.metric(module.total, 2)}</span></div>`).join('')}
      </div>
    `);
  },

  renderSchedule(data) {
    const milestones = this.list(data?.milestones, [
      { name: 'Auth module', progress: 78 },
      { name: 'Payments module', progress: 52 },
      { name: 'Reports module', progress: 34 }
    ]);
    const delays = this.list(data?.delays, [{ title: 'Payments API stabilization', module: 'payments', status: 'BLOCKED' }]);
    const delayReasons = this.list(data?.delayReasons, DevData.defaultChallenges);
    const mitigationActions = this.list(data?.mitigationActions, [
      'Increase dependency follow-up with external API owners',
      'Shift dev agent focus toward blocked modules'
    ]);

    this.mount('devPageContent', `
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="stat-card"><span class="stat-label">Dev Progress</span><span class="stat-value">${this.metric(data?.progress, 48)}%</span></div>
        <div class="stat-card"><span class="stat-label">Milestones</span><span class="stat-value">${milestones.length}</span></div>
        <div class="stat-card"><span class="stat-label">Delays</span><span class="stat-value" style="color:${delays.length ? 'var(--warning)' : 'var(--success)'}">${delays.length}</span></div>
        <div class="stat-card"><span class="stat-label">Mitigations</span><span class="stat-value">${mitigationActions.length}</span></div>
      </div>
      <div class="card"><div class="card-header"><h3 class="card-title">Development Milestones</h3></div>${milestones.map(item => `<div class="metric-bar"><span class="metric-label">${this.escape(item.name)}</span><div class="metric-track"><div class="metric-fill" style="width:${item.progress || 20}%;background:${(item.progress || 20) >= 80 ? '#10b981' : (item.progress || 20) >= 40 ? '#3b82f6' : '#f59e0b'}"></div></div><span class="metric-value">${item.progress || 20}%</span></div>`).join('')}</div>
      <div class="grid grid-2" style="margin-top:16px">
        <div class="card"><div class="card-header"><h3 class="card-title">Delay Reasons</h3></div>${delayReasons.map(item => `<div class="pipeline-stage pending"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
        <div class="card"><div class="card-header"><h3 class="card-title">Mitigation Actions</h3></div>${mitigationActions.map(item => `<div class="pipeline-stage completed"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
      </div>
    `);
  },

  renderQuality(data) {
    const qualityRisks = this.list(data?.qualityRisks, [
      'Regression-heavy paths remain in reporting',
      'Integration touchpoints need stronger test coverage'
    ]);
    const improvementActions = this.list(data?.improvementActions, [
      'Expand automation coverage on active modules',
      'Add QA checkpoints before closing in-progress stories'
    ]);

    this.mount('devPageContent', `
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="stat-card"><span class="stat-label">Defect Density</span><span class="stat-value">${this.metric(data?.defectDensity, 0.74)}</span></div>
        <div class="stat-card"><span class="stat-label">Defect Leakage</span><span class="stat-value">${this.metric(data?.defectLeakage, 12)}%</span></div>
        <div class="stat-card"><span class="stat-label">Test Coverage</span><span class="stat-value">${this.metric(data?.testCoverage, 72)}%</span></div>
        <div class="stat-card"><span class="stat-label">Automation Coverage</span><span class="stat-value">${this.metric(data?.automationCoverage, 68)}%</span></div>
      </div>
      <div class="grid grid-2">
        <div class="card"><div class="card-header"><h3 class="card-title">Quality Risks</h3></div>${qualityRisks.map(item => `<div class="pipeline-stage pending"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
        <div class="card"><div class="card-header"><h3 class="card-title">Improvement Actions</h3></div>${improvementActions.map(item => `<div class="pipeline-stage completed"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
      </div>
    `);
  },

  renderResources(data) {
    const skillUpdates = this.list(data?.skillUpdates, [
      'Node.js and React execution flow remains active',
      'Developer agents aligned on auth and payments delivery'
    ]);

    this.mount('devPageContent', `
      <div class="grid grid-3" style="margin-bottom:20px">
        <div class="stat-card"><span class="stat-label">Dev Team Size</span><span class="stat-value">${this.metric(data?.teamSize, 3)}</span></div>
        <div class="stat-card"><span class="stat-label">Utilization</span><span class="stat-value">${this.metric(data?.utilization, 74)}%</span></div>
        <div class="stat-card"><span class="stat-label">Training Impact</span><span class="stat-value" style="font-size:18px">${this.escape(data?.trainingImpact || 'Execution-focused upskilling underway')}</span></div>
      </div>
      <div class="grid grid-2">
        <div class="card"><div class="card-header"><h3 class="card-title">Skill Updates</h3></div>${skillUpdates.map(item => `<div class="pipeline-stage in-progress"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
        <div class="card"><div class="card-header"><h3 class="card-title">Workload Signal</h3></div><div class="metric-bar"><span class="metric-label">Team Utilization</span><div class="metric-track"><div class="metric-fill" style="width:${this.metric(data?.utilization, 74)}%;background:${this.metric(data?.utilization, 74) > 85 ? '#ef4444' : this.metric(data?.utilization, 74) > 70 ? '#f59e0b' : '#10b981'}"></div></div><span class="metric-value">${this.metric(data?.utilization, 74)}%</span></div></div>
      </div>
    `);
  },

  renderRisks(data) {
    const developmentRisks = this.list(data?.developmentRisks, [
      { title: 'Vendor dependency affecting payments flow', impact: 'High', probability: 'Medium', mitigation: 'Stabilize external API contract before next merge window' }
    ]);
    const stakeholderConcerns = this.list(data?.stakeholderConcerns, [
      'Scope pressure on current sprint delivery',
      'Tight deadlines across active modules'
    ]);
    const activeIssues = this.list(data?.activeIssues, [
      { id: 'ISS-DEV-01', title: 'Payments integration blocker', module: 'payments', owner: 'Developer Agent - Payments 01', status: 'BLOCKED' }
    ]);

    this.mount('devPageContent', `
      <div class="grid grid-2">
        <div class="card"><div class="card-header"><h3 class="card-title">Development Risks</h3></div>${developmentRisks.map(item => `<div class="decision-log-item"><div class="decision-log-title">${this.escape(item.title)}</div><div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">${this.escape(item.mitigation)}</div><div class="decision-log-meta"><span>Impact: ${this.escape(item.impact)}</span><span>Probability: ${this.escape(item.probability)}</span></div></div>`).join('')}</div>
        <div class="card"><div class="card-header"><h3 class="card-title">Stakeholder Concerns</h3></div>${stakeholderConcerns.map(item => `<div class="pipeline-stage pending"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-header"><h3 class="card-title">Active Issues</h3></div>
        <div class="table-container"><table><thead><tr><th>ID</th><th>Issue</th><th>Module</th><th>Owner</th><th>Status</th></tr></thead><tbody>
          ${activeIssues.map(item => `<tr><td style="font-family:var(--mono);color:var(--accent)">${this.escape(item.id)}</td><td>${this.escape(item.title)}</td><td><span class="tag">${this.escape(item.module)}</span></td><td>${this.escape(item.owner)}</td><td>${statusBadge(item.status || 'BLOCKED')}</td></tr>`).join('')}
        </tbody></table></div>
      </div>
    `);
  },

  renderSummary(data) {
    const achievements = this.list(data?.keyAchievements, DevData.defaultAchievements);
    const challenges = this.list(data?.challenges, DevData.defaultChallenges);
    const forwardPlan = this.list(data?.forwardPlan, [
      'Advance active deliverables through code review',
      'Resolve dependency blockers before next sprint checkpoint'
    ]);
    const recommendations = this.list(data?.recommendations, [
      'Maintain critical path focus on active modules',
      'Increase testing rigor before final merges'
    ]);

    this.mount('devPageContent', `
      <div class="grid grid-2">
        <div class="card"><div class="card-header"><h3 class="card-title">Key Achievements</h3></div>${achievements.map(item => `<div class="pipeline-stage completed"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
        <div class="card"><div class="card-header"><h3 class="card-title">Challenges</h3></div>${challenges.map(item => `<div class="pipeline-stage pending"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        <div class="card"><div class="card-header"><h3 class="card-title">Forward Plan</h3></div>${forwardPlan.map(item => `<div class="pipeline-stage in-progress"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
        <div class="card"><div class="card-header"><h3 class="card-title">Recommendations</h3></div>${recommendations.map(item => `<div class="pipeline-stage completed"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}</div>
      </div>
    `);
  }
};
