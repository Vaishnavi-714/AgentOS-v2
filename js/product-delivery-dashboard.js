const ProductDeliveryDashboard = (() => {
  const state = {
    expandedProductProjectId: null,
    expandedCrossProjectId: null,
    openDetailSections: {},
    roadmapFilter: 'ALL',
    roadmapPage: 0,
    resizeTimer: null,
    expandedEscalationRows: {}
  };

  function init() {
    seedNexusData();
    createNavigation('product-delivery-dashboard');
    window.addEventListener('nexus:selected-project-changed', render);
    window.addEventListener('resize', () => {
      clearTimeout(state.resizeTimer);
      state.resizeTimer = setTimeout(render, 120);
    });
    render();
  }

  function render() {
    const model = getDashboardModel();
    const root = document.getElementById('productDeliveryDashboardRoot');
    if (!root) return;

    if (model.selectedProjectRole !== 'PRODUCT_DELIVERY') {
      root.innerHTML = roleMismatchState(model);
      return;
    }

    if (!model.assignedProjects.length) {
      root.innerHTML = noAssignedProjects();
      return;
    }

    root.innerHTML = `
      <div class="pd-command-shell">
        ${renderCommandHero()}
        ${renderProductProjectRail(model.productDeliveryProjects, model)}
        <section class="pd-section pd-command-section pd-compact-cross-role" id="cross-role-projects">
          <div class="pd-unified-section-card pd-project-rail-card">
            <div class="pd-section-header pd-unified-section-header">
              <div>
                <span class="pd-section-eyebrow">Portfolio adjacency</span>
                <h2>Cross-Role Projects</h2>
                <p>Projects where you support delivery through another role, module, or workstream.</p>
              </div>
            </div>
            ${renderCrossRoleTable(model.crossRoleProjects, model)}
          </div>
        </section>
      </div>
    `;
  }

  function getDashboardModel() {
    const currentUser = NexusRoleUtils.getCurrentUser();
    const projects = NexusStore.getProjects();
    const assignedProjects = NexusRoleUtils.getAssignedProjects(projects, currentUser);
    const productDeliveryProjects = assignedProjects.filter(project => getProjectRole(project, currentUser) === 'PRODUCT_DELIVERY');
    const crossRoleProjects = assignedProjects.filter(project => getProjectRole(project, currentUser) !== 'PRODUCT_DELIVERY');
    const rawSelectedProject = NexusRoleUtils.getSelectedProject(projects);
    const selectedProject = getProjectRole(rawSelectedProject, currentUser) === 'PRODUCT_DELIVERY'
      ? rawSelectedProject
      : productDeliveryProjects[0] || rawSelectedProject;
    const selectedProjectRole = getProjectRole(selectedProject, currentUser);
    const tenantId = TenantState.getCurrentTenant()?.tenant_id || TenantState.getCurrentTenant()?.id || '';
    const tenantUsers = tenantId ? TenantState.getTenantUsers(tenantId) : [];

    return {
      currentUser,
      tenantUsers,
      selectedProject,
      selectedProjectRole,
      selectedProjectRoleLabel: NexusRoleUtils.projectRoleLabel(selectedProjectRole),
      assignedProjects,
      productDeliveryProjects,
      crossRoleProjects,
      crossRoleBlockers: crossRoleProjects.filter(project => getCrossRoleBlocker(project, getProjectRole(project, currentUser)) !== 'None').length
    };
  }

  function getProjectRole(project, user) {
    return NexusRoleUtils.normalizeProjectRole(NexusRoleUtils.findUserAssignment(project, user)?.projectRole);
  }

  function summaryCard(title, value, description, stat, progress, targetId) {
    return `
      <button class="pd-summary-card" type="button" onclick="ProductDeliveryDashboard.scrollToSection('${targetId}')">
        <span class="pd-summary-label">${escapeHtml(title)}</span>
        <strong>${value}</strong>
        <span class="pd-summary-subtitle">${escapeHtml(description)}</span>
        <span class="pd-summary-stat">${escapeHtml(stat)}</span>
        <span class="pd-card-meter"><i style="width:${clampPercent(progress)}%"></i></span>
      </button>
    `;
  }

  function projectMixProgress(model) {
    if (!model.assignedProjects.length) return 0;
    return (model.productDeliveryProjects.length / model.assignedProjects.length) * 100;
  }

  function renderCommandHero() {
    return `
      <section class="pd-command-hero" aria-label="Product and Delivery Command Center">
        <div class="pd-command-hero-main">
          <span class="pd-hero-kicker">Product &amp; Delivery</span>
          <h1>Product &amp; Delivery Dashboard</h1>
          <p>Structured project execution and aligned delivery.</p>
        </div>
      </section>
    `;
  }

  function noProductDeliveryProjects() {
    return `
      <section class="pd-section" id="product-delivery-projects">
        <div class="pd-empty-state">
          <h3>No Product &amp; Delivery Projects</h3>
          <p>You are not assigned as Product &amp; Delivery on the selected project or any current project.</p>
        </div>
      </section>
    `;
  }

  function renderProductProjectRail(projects, model) {
    return `
      <section class="pd-section pd-command-section" id="product-delivery-projects">
        <div class="pd-unified-section-card pd-project-rail-card">
          <div class="pd-section-header pd-unified-section-header">
            <div>
              <span class="pd-section-eyebrow">Project selector</span>
              <h2>Product &amp; Delivery Projects</h2>
              <p>Requirement intake, planning boards, task tracking, roadmap visibility, backlog approvals, and stage progression.</p>
            </div>
          </div>
          ${renderProductDeliveryTable(projects, model)}
        </div>
      </section>
    `;
  }

  function productProjectTile(project, activeProject, model) {
    const detail = buildProductDeliveryDetail(project);
    const active = project.id === activeProject?.id;
    return `
      <button class="pd-project-tile ${active ? 'is-active' : ''}" type="button" onclick="ProductDeliveryDashboard.toggleProductDetails('${project.id}')">
        <span class="pd-project-tile-top">
          <strong>${escapeHtml(project.name)}</strong>
          ${statusBadge(project.status || 'ACTIVE')}
        </span>
        <span class="pd-project-tile-description">${escapeHtml(project.description || 'No description provided')}</span>
        <span class="pd-project-tile-meta">
          <span>Started <b>${formatDate(project.createdAt || project.created_at)}</b></span>
          <span>Delivery <b>${formatDate(getDeliveryDate(project))}</b></span>
          <span>Team <b>${NexusRoleUtils.getProjectAssignments(project).length}</b></span>
        </span>
        <span class="pd-project-tile-health">
          ${deliveryHealthBadge(detail.roadmap.deliveryHealth)}
          ${miniProgress(detail.workflow.completionPercentage)}
        </span>
      </button>
    `;
  }

  function roleMismatchState(model) {
    const roleLabel = model.selectedProjectRoleLabel || 'no assigned project role';
    return `
      <div class="page-header pd-page-header">
        <div>
          <h1 class="page-title">Product &amp; Delivery Dashboard</h1>
          <p class="page-subtitle">Structured project execution and aligned delivery.</p>
        </div>
      </div>
      <div class="pd-empty-state pd-role-empty">
        <h3>This dashboard is for Product &amp; Delivery.</h3>
        <p>Your selected project role is ${escapeHtml(roleLabel)}.</p>
        <div class="pd-empty-actions">
          <a class="btn btn-primary" href="dashboard.html">Go to Projects Hub</a>
          <span>Select a Product &amp; Delivery project from the Projects Hub to use this dashboard.</span>
        </div>
      </div>
    `;
  }

  function noAssignedProjects() {
    return `
      <div class="pd-empty-state">
        <h3>No Assigned Projects</h3>
        <p>You are not currently assigned to any projects.</p>
      </div>
    `;
  }

  function renderProductDeliveryTable(projects, model) {
    if (!projects.length) {
      return `
        <div class="pd-empty-state">
          <h3>No Product &amp; Delivery Projects</h3>
          <p>You are not assigned as Product &amp; Delivery on the selected project or any current project.</p>
        </div>
      `;
    }

    return `
      <div class="pd-project-summary-list" role="list">
        ${projects.map(project => productDeliveryRow(project, model)).join('')}
      </div>
    `;
  }

  function productDeliveryRow(project, model) {
    const expanded = state.expandedProductProjectId === project.id;
    const detail = buildProductDeliveryDetail(project);
    const owner = deliveryOwner(project, model.tenantUsers);
    const blockers = Number(detail.risks.summary.blockers || 0) + Number(detail.escalations.summary.slaBreaches || 0);
    const topRisk = detail.risks.items.find(item => item.status !== 'RESOLVED') || detail.risks.items[0];
    return `
      <article class="pd-project-summary-row ${expanded ? 'is-expanded' : ''}" role="listitem">
        <div class="pd-project-summary-main">
          <span class="pd-health-dot ${healthDotClass(detail.roadmap.deliveryHealth)}" title="${escapeHtml(detail.roadmap.deliveryHealth)}"></span>
          <div class="pd-project-name-block">
            <strong title="${escapeHtml(project.name)}">${escapeHtml(project.name)}</strong>
            <span title="${escapeHtml(project.description || 'No description provided')}">${escapeHtml(project.description || 'No description provided')}</span>
          </div>
        </div>
        <div class="pd-project-summary-meta">
          <span><b>Owner</b>${escapeHtml(owner)}</span>
          <span><b>Priority</b>${priorityBadge(detail.prioritization.priorityRank)}</span>
          <span><b>Status</b>${statusBadge(project.status || 'ACTIVE')}</span>
          <span><b>Sprint</b><i>${escapeHtml(shortSprintName(detail.overview.currentSprint))}</i></span>
          <span><b>Risk</b>${blockersBadge(blockers ? `${blockers} open` : 'None')}</span>
        </div>
        <div class="pd-project-summary-progress">
          <div>
            <strong style="color:${getProgressColor(detail.workflow.completionPercentage, project.status, blockers)}">${detail.workflow.completionPercentage}%</strong>
            <span>progress</span>
          </div>
        </div>
        <button class="pd-view-details-btn" type="button" onclick="ProductDeliveryDashboard.toggleProductDetails('${project.id}')">${expanded ? 'Hide Details' : 'View Details'}</button>
        ${topRisk ? `<div class="pd-project-risk-note"><span>${escapeHtml(topRisk.category)}</span>${escapeHtml(topRisk.name)} · ${escapeHtml(topRisk.owner)}</div>` : ''}
      </article>
      ${expanded ? `<div class="pd-details-row">${renderProductDeliveryDetails(project)}</div>` : ''}
    `;
  }

  function emptyWidget(message) {
    return `<div class="pd-widget-empty">${escapeHtml(message)}</div>`;
  }

  function deliveryOwner(project, tenantUsers) {
    const assignment = NexusRoleUtils.getProjectAssignments(project).find(item => getProjectRole(project, { id: item.userId, email: item.email }) === 'PRODUCT_DELIVERY')
      || NexusRoleUtils.getProjectAssignments(project)[0];
    const user = tenantUsers.find(item => item.id === assignment?.userId || item.email === assignment?.email);
    return user?.name || assignment?.name || assignment?.persona || assignment?.role || 'Delivery Manager';
  }

  function shortSprintName(value) {
    return String(value || 'Sprint').replace(/^Sprint\s+/i, 'S');
  }

  function healthDotClass(value) {
    const normalized = String(value || '').toLowerCase();
    if (normalized.includes('red') || normalized.includes('risk') || normalized.includes('blocked')) return 'is-red';
    if (normalized.includes('amber') || normalized.includes('watch')) return 'is-amber';
    return 'is-green';
  }

  function renderProductDeliveryDetails(project) {
    const detail = buildProductDeliveryDetail(project);
    return `
      <div class="pd-details-card pd-pdm-details pd-command-center-grid">
        <div class="pd-details-titlebar">
          <div>
            <h3>${escapeHtml(project.name || 'Project')} Product &amp; Delivery View</h3>
            <p>${escapeHtml(project.description || 'Project-specific delivery management data generated for this project.')}</p>
          </div>
          <div class="pd-details-titlebar-meta">
            ${deliveryHealthBadge(detail.roadmap.deliveryHealth)}
            <span class="pd-mini-chip">${escapeHtml(detail.overview.currentSprint)}</span>
            <span class="pd-mini-chip">${escapeHtml(String(detail.workflow.completionPercentage))}% complete</span>
          </div>
        </div>
        ${renderExecutiveKpiStrip(detail)}
        <div class="pd-dashboard-grid">
          ${renderDeliveryHealth(detail)}
          ${renderRoadmapTimeline(detail)}
          ${renderRequirementBacklog(detail)}
          ${renderFeatureProgress(detail)}
          ${renderPrioritization(detail)}
          ${renderSprintPlanning(detail)}
          ${renderResourcePlanning(detail)}
          <div class="pd-governance-zone">
            ${renderMilestones(detail)}
            ${renderStageGates(detail)}
            ${renderDependencies(detail)}
            ${renderRisks(detail)}
          ${renderEscalations(detail)}
          </div>
          ${renderCostBudget(detail)}
          ${renderDecisionLog(detail)}
          ${renderStakeholders(detail)}
        </div>
      </div>
    `;
  }

  function renderDetailBlock(title, body, className = '', options = {}) {
    const widgetClass = `pd-widget-${String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    return `
      <section class="pd-management-section ${widgetClass} ${className}">
        <div class="pd-management-head">
          <div>
            <span class="pd-section-eyebrow">${escapeHtml(options.eyebrow || 'Command widget')}</span>
            <h3>${escapeHtml(title)}</h3>
          </div>
          ${options.summary ? `<div class="pd-accordion-summary">${options.summary}</div>` : ''}
        </div>
        ${body}
      </section>
    `;
  }

  function renderExecutiveKpiStrip(detail) {
    const items = [
      ['Total Requirements', detail.overview.totalRequirements, 'Intake scope', 'var(--text-primary)'],
      ['Ready for Backlog', detail.overview.readyForBacklog, 'Reviewed and ready', 'var(--text-primary)'],
      ['Backlog Generated', detail.overview.backlogItemsGenerated, 'Automation output', 'var(--text-primary)'],
      ['Backlog Approved', detail.overview.backlogItemsApproved, 'Approved delivery items', 'var(--text-primary)'],
      ['Completion %', `${detail.overview.overallCompletion}%`, 'Overall progression', getProgressColor(detail.overview.overallCompletion, detail.workflow.currentStage, detail.workflow.blockedStages)],
      ['Delivery Confidence', detail.overview.deliveryConfidence, 'Execution confidence', getConfidenceColor(detail.overview.deliveryConfidence)],
      ['Days Remaining', detail.overview.daysRemaining, 'Target delivery clock', getDaysRemainingColor(detail.overview.daysRemaining)],
      ['Project Health', detail.overview.projectHealth, 'Delivery signal', getHealthColor(detail.overview.projectHealth)]
    ];
    return `
      <section class="pd-executive-kpi-strip" aria-label="Executive Product and Delivery KPIs">
        ${items.map(([label, value, helper, color]) => `
          <article class="pd-exec-kpi">
            <div>
              <span>${escapeHtml(label)}</span>
              <strong style="color:${color}">${escapeHtml(String(value))}</strong>
              <small>${escapeHtml(helper)}</small>
            </div>
            <i aria-hidden="true">${metricIcon(label)}</i>
          </article>
        `).join('')}
      </section>
    `;
  }

  function metricIcon(label) {
    if (/requirement/i.test(label)) return 'R';
    if (/backlog/i.test(label)) return 'B';
    if (/completion/i.test(label)) return '%';
    if (/confidence/i.test(label)) return 'C';
    if (/days/i.test(label)) return 'D';
    return 'H';
  }

  function confidencePercent(value) {
    const normalized = String(value || '').toLowerCase();
    if (normalized.includes('high')) return 92;
    if (normalized.includes('medium')) return 64;
    if (normalized.includes('low')) return 36;
    return 50;
  }

  function daysRemainingPercent(value) {
    const days = Number(value);
    if (!Number.isFinite(days)) return 0;
    return clampPercent((days / 90) * 100);
  }

  function detailSectionKey(title) {
    const projectId = state.expandedProductProjectId || state.expandedCrossProjectId || 'global';
    return `${projectId}-${String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  function sectionSummary(items) {
    return items.map(([label, value]) => `<span><b>${escapeHtml(label)}</b> ${escapeHtml(String(value))}</span>`).join('');
  }

  function renderMetricCards(items, className = '') {
    return `<div class="pd-management-kpis ${className}">${items.map(([label, value]) => `
      <article class="pd-management-kpi">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value))}</strong>
      </article>
    `).join('')}</div>`;
  }

  function metricStrip(items, className = '') {
    return `
      <div class="pd-metric-strip ${className}">
        ${items.map(([label, value]) => `
          <article>
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(String(value))}</strong>
          </article>
        `).join('')}
      </div>
    `;
  }

  function agentWorkforceGrid(agents) {
    return `
      <div class="pd-agent-grid">
        ${agents.map(agent => `
          <article class="pd-agent-card">
            <div class="pd-agent-card-head">
              <div>
                <h4>${escapeHtml(agent.name)}</h4>
                <span>${escapeHtml(agent.type)}</span>
              </div>
              ${statusBadge(agent.status)}
            </div>
            <p>${escapeHtml(agent.responsibilityArea)}</p>
            <div class="pd-agent-util">
              <span>Utilization <strong>${agent.utilization}%</strong></span>
            </div>
            <div class="pd-agent-card-foot">
              <span>${escapeHtml(agent.workflowStage)}</span>
              ${deliveryHealthBadge(agent.health)}
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  function riskIssueList(items) {
    return `
      <div class="pd-risk-list">
        ${items.map(item => `
          <article>
            <div class="pd-risk-main">
              <h4>${escapeHtml(item.name)}</h4>
              <span>${escapeHtml(item.category)} · ${escapeHtml(item.probability)} probability · ${escapeHtml(item.impact)} impact</span>
            </div>
            <div class="pd-risk-meta">
              ${deliveryHealthBadge(item.severity)}
              ${statusBadge(item.status)}
              <span>Owner: ${escapeHtml(item.owner)}</span>
            </div>
            <p>${escapeHtml(item.mitigation)}</p>
          </article>
        `).join('')}
      </div>
    `;
  }

  function escalationList(items) {
    return `
      <div class="pd-responsive-table pd-escalation-table">
        <table>
          <colgroup>
            <col class="pd-escalation-topic-col">
            <col class="pd-escalation-level-col">
            <col class="pd-escalation-owner-col">
            <col class="pd-escalation-sla-col">
            <col class="pd-escalation-status-col">
            <col class="pd-escalation-date-col">
            <col class="pd-escalation-action-col">
          </colgroup>
          <thead>
            <tr>
              <th>Escalation Topic</th>
              <th>Current Level</th>
              <th>Owner</th>
              <th>SLA</th>
              <th>Status</th>
              <th>Next Escalation Date</th>
              <th>Action / Details</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => escalationTableRows(item, index)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function escalationTableRows(item, index) {
    const rowKey = `${state.expandedProductProjectId || 'project'}-${index}`;
    const expanded = Boolean(state.expandedEscalationRows[rowKey]);
    return `
      <tr class="pd-main-row">
        <td data-label="Escalation Topic"><strong>${escapeHtml(item.topic)}</strong></td>
        <td data-label="Current Level">${levelBadge(item.currentLevel)}</td>
        <td data-label="Owner">${escapeHtml(item.owner)}</td>
        <td data-label="SLA"><span class="pd-mini-chip">${escapeHtml(item.sla)}</span></td>
        <td data-label="Status">${statusBadge(item.status)}</td>
        <td data-label="Next Escalation Date">${formatDate(item.nextEscalationDate)}</td>
        <td data-label="Action / Details">
          <button class="pd-row-detail-btn" type="button" onclick="ProductDeliveryDashboard.toggleEscalationRow('${rowKey}')" aria-expanded="${String(expanded)}">
            ${expanded ? 'Hide' : 'View'} Details <span>${expanded ? '&#9650;' : '&#9660;'}</span>
          </button>
        </td>
      </tr>
      ${expanded ? `
        <tr class="pd-details-subrow">
          <td colspan="7">
            <div class="pd-escalation-detail-grid">
              <article><span>Trigger Condition</span><p>${escapeHtml(item.trigger)}</p></article>
              <article><span>Resolution Plan</span><p>${escapeHtml(item.resolutionPlan)}</p></article>
              <article><span>Level Meaning</span><p>${escapeHtml(levelMeaning(item.currentLevel))}</p></article>
            </div>
          </td>
        </tr>
      ` : ''}
    `;
  }

  function levelBadge(value) {
    const num = String(value || '').match(/\d+/)?.[0] || '1';
    return `<span class="pd-level-badge" title="${escapeHtml(levelMeaning(value))}">L${num}</span>`;
  }

  function levelMeaning(value) {
    const meanings = {
      1: 'Team Lead / Product Owner',
      2: 'Delivery Manager',
      3: 'Governance / PMO',
      4: 'Executive Sponsor',
      5: 'Client Steering Committee'
    };
    const num = String(value || '').match(/\d+/)?.[0] || '1';
    return meanings[num] || 'Escalation owner';
  }

  function costBreakdownList(items) {
    return `
      <div class="pd-cost-breakdown">
        ${items.map(item => `
          <article>
            <div>
              <span>${escapeHtml(item.label)}</span>
              <strong>${currency(item.value)}</strong>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  function stakeholderGrid(items) {
    return `
      <div class="pd-responsive-table pd-stakeholder-table">
        <table>
          <colgroup>
            <col class="pd-stakeholder-name-col">
            <col class="pd-stakeholder-role-col">
            <col class="pd-stakeholder-frequency-col">
            <col class="pd-stakeholder-contact-col">
            <col class="pd-stakeholder-decision-col">
            <col class="pd-stakeholder-health-col">
          </colgroup>
          <thead>
            <tr>
              <th>Stakeholder</th>
              <th>Role</th>
              <th>Frequency</th>
              <th>Last Contact</th>
              <th>Pending Decision</th>
              <th>Health</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td data-label="Stakeholder"><strong class="pd-clamp-2">${escapeHtml(item.name)}</strong></td>
                <td data-label="Role"><span class="pd-clamp-2">${escapeHtml(item.role)}</span></td>
                <td data-label="Frequency">${escapeHtml(item.frequency)}</td>
                <td data-label="Last Contact">${formatDate(item.lastContacted)}</td>
                <td data-label="Pending Decision"><span class="pd-clamp-2">${escapeHtml(item.pendingDecision)}</span></td>
                <td data-label="Health">${compactHealthBadge(item.sentiment)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function compactHealthBadge(value) {
    const label = String(value || '').toLowerCase().includes('red') ? 'Risk'
      : String(value || '').toLowerCase().includes('amber') ? 'Watch'
      : 'Green';
    const tone = label === 'Risk' ? 'danger' : label === 'Watch' ? 'warning' : 'success';
    return `<span class="pd-badge pd-badge-${tone}">${label}</span>`;
  }

  function renderRequirementBacklog(detail) {
    const req = detail.requirements;
    const total = Math.max(req.totalReceived, 1);
    return renderDetailBlock('Requirement Intake & Backlog Automation', `
      <div class="pd-backlog-automation-layout">
        <div class="pd-pipeline-panel" aria-label="Pipeline progress">
          <h4>Pipeline Progress</h4>
          <div class="pd-funnel-visual pd-funnel-visual-focus">
            ${req.funnel.map((item, index) => `
              ${(() => {
                const fill = clampPercent((item.value / total) * 100);
                return `
              <div class="pd-funnel-row pd-funnel-step-${index + 1}">
                <span>${escapeHtml(item.label)}</span>
                <strong>${item.value}</strong>
                <i><b style="width:${fill}%;--pd-rag-fill:${getFunnelStepColor(item.label, fill, item.value, total)}"></b></i>
              </div>
                `;
              })()}
            `).join('')}
          </div>
        </div>
        ${scheduleStatusChart(detail)}
      </div>
    `, 'pd-detail-full', {
      summary: sectionSummary([
        ['On schedule', detail.backlog.onScheduleCount],
        ['Behind', detail.backlog.offScheduleCount],
        ['Approved', detail.backlog.approved]
      ])
    });
  }

  function scheduleStatusChart(detail) {
    const items = [
      ['On Schedule', detail.backlog.onScheduleCount, 'success', getHealthToneColor('green')],
      ['Behind', detail.backlog.offScheduleCount, 'warning', getScheduleBehindColor(detail.backlog.offScheduleCount, detail.backlog.generated)],
      ['Approved', detail.backlog.approved, 'success', getHealthToneColor('green')]
    ];
    const max = Math.max(...items.map(item => Number(item[1]) || 0), 1);
    return `
      <aside class="pd-schedule-status-card" aria-label="Schedule Status">
        <div class="pd-mini-section-head">
          <h4>Schedule Status</h4>
        </div>
        <div class="pd-schedule-bars">
          ${items.map(([label, value, tone, color]) => `
            <div class="pd-schedule-bar pd-schedule-${tone}" style="--pd-schedule-color:${color}">
              <strong style="color:${tone === 'state' ? 'var(--text-primary)' : color}">${value}</strong>
              <i><b style="height:${clampPercent((value / max) * 100)}%"></b></i>
              <span>${escapeHtml(label)}</span>
            </div>
          `).join('')}
        </div>
      </aside>
    `;
  }

  function renderFeatureProgress(detail) {
    return renderDetailBlock('Feature / Module Progress', renderDataTable(
      ['Module', 'Owner', 'Priority', 'SP', 'Status', 'Completion', 'Sprints', 'Blockers', 'RAG'],
      detail.features.map(feature => {
        const health = getFeatureHealthTone(feature);
        return [
          escapeHtml(feature.name),
          escapeHtml(feature.owner),
          priorityBadge(feature.priority),
          `<span class="pd-story-points">${feature.storyPoints || 5}</span>`,
          statusBadge(feature.status),
          `<div class="pd-progress-cell"><span style="color:${getHealthToneColor(health)}">${feature.completion}%</span></div>`,
          sprintChips(feature.linkedSprints),
          featureBlockersCell(feature.blockers),
          ragStatusDot(health, feature.blockers)
        ];
      }),
      'pd-feature-table'
    ), 'pd-detail-full', {
      summary: sectionSummary([
        ['Modules', detail.features.length],
        ['Avg complete', `${Math.round(detail.features.reduce((sum, item) => sum + item.completion, 0) / Math.max(detail.features.length, 1))}%`],
        ['Blockers', detail.features.reduce((sum, item) => sum + Number(item.blockers || 0), 0)]
      ])
    });
  }

  function renderPrioritization(detail) {
    const mix = detail.prioritization.mix;
    const total = Math.max(mix.mustHave + mix.shouldHave + mix.couldHave + mix.deferred, 1);
    return renderDetailBlock('Prioritization', `
      <div class="pd-priority-quickview">
        ${pieChart([
          ['Must', mix.mustHave, 'danger'],
          ['Should', mix.shouldHave, 'warning'],
          ['Could', mix.couldHave, 'info'],
          ['Deferred', mix.deferred, 'success']
        ], total)}
        <div class="pd-priority-compact-grid">
          ${compactPriorityCard('Business Value', detail.prioritization.businessValueScore, 'Impact')}
          ${compactPriorityCard('Effort', detail.prioritization.effortScore, 'Delivery lift')}
          ${compactPriorityCard('Risk', detail.prioritization.riskScore, 'Heat')}
          ${compactPriorityCard('Tier', detail.prioritization.priorityRank, 'Priority')}
        </div>
      </div>
    `, '', {
      summary: sectionSummary([
        ['Must', mix.mustHave],
        ['Should', mix.shouldHave],
        ['Tier', detail.prioritization.priorityRank]
      ])
    });
  }

  function pieChart(items, total) {
    let cursor = 0;
    const stops = items.map(([label, value, tone]) => {
      const start = cursor;
      cursor += (Number(value) || 0) / Math.max(total, 1) * 100;
      return `var(--pd-${tone}) ${start}% ${cursor}%`;
    }).join(', ');
    return `
      <div class="pd-pie-summary">
        <div class="pd-pie-chart" style="background: conic-gradient(${stops})"><span>${total}</span></div>
        <div class="pd-pie-legend">
          ${items.map(([label, value, tone]) => `<span><i class="pd-dot pd-tone-${tone}"></i>${escapeHtml(label)} <b>${value}</b></span>`).join('')}
        </div>
      </div>
    `;
  }

  function compactPriorityCard(label, value, caption) {
    return `
      <button class="pd-priority-mini-card" type="button">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value))}${typeof value === 'number' ? '%' : ''}</strong>
        <small>${escapeHtml(caption)}</small>
      </button>
    `;
  }

  function renderSprintPlanning(detail) {
    const sprint = detail.sprints.current;
    return renderDetailBlock('Sprint Planning', `
      <div class="pd-sprint-planning-compact">
        ${renderMetricCards([
          ['Current Sprint', sprint.name],
          ['Start Date', formatDate(sprint.startDate)],
          ['End Date', formatDate(sprint.endDate)],
          ['Sprint Goal', sprint.goal]
        ], 'pd-kpis-compact pd-sprint-summary-kpis')}
        <div class="pd-sprint-stack">
          ${detail.sprints.list.map(item => `
            <article class="pd-sprint-card">
              <div><strong>${escapeHtml(item.name)}</strong>${statusBadge(item.status)}</div>
              ${bar(item.completion, getSprintProgressColor(item))}
              <span style="color:${getSprintProgressColor(item)}">${item.completion}% complete</span>
            </article>
          `).join('')}
        </div>
      </div>
    `, '', {
      summary: sectionSummary([
        ['Current', sprint.name],
        ['Velocity', sprint.velocity],
        ['Confidence', sprint.confidence]
      ])
    });
  }

  function renderRoadmapTimeline(detail) {
    const filtered = filteredRoadmapPhases(detail.roadmap.phases);
    const visibleCount = roadmapVisibleCount();
    const maxIndex = Math.max(0, filtered.length - visibleCount);
    const page = Math.min(state.roadmapPage, maxIndex);
    return renderDetailBlock('Roadmap', `
      <div class="pd-roadmap-toolbar">
        <div class="pd-filter-chips" aria-label="Roadmap filters">
          ${roadmapFilterButton('ALL', 'All')}
          ${roadmapFilterButton('NOT_STARTED', 'Not Started')}
          ${roadmapFilterButton('IN_PROGRESS', 'In Progress')}
          ${roadmapFilterButton('COMPLETED', 'Completed')}
        </div>
      </div>
      <div class="pd-roadmap-carousel">
        ${filtered.length > 0 && page > 0 ? `<button class="pd-carousel-arrow pd-carousel-arrow-left" type="button" onclick="ProductDeliveryDashboard.moveRoadmapCarousel(-1)" aria-label="Previous roadmap phase">&#8249;</button>` : ''}
        <div class="pd-roadmap-track" style="transform: translateX(calc(var(--pd-roadmap-step) * -${page}))">
          ${filtered.map(phase => roadmapPhaseCard(phase)).join('') || '<div class="pd-carousel-empty">No roadmap phases match this filter.</div>'}
        </div>
        ${filtered.length > 0 && page < maxIndex ? `<button class="pd-carousel-arrow pd-carousel-arrow-right" type="button" onclick="ProductDeliveryDashboard.moveRoadmapCarousel(1)" aria-label="Next roadmap phase">&#8250;</button>` : ''}
      </div>
      ${renderFeatureRoadmap(detail.roadmap.featureRoadmap || [])}
    `, 'pd-detail-full', {
      summary: sectionSummary([
        ['In progress', detail.roadmap.phases.filter(phase => phase.status === 'IN_PROGRESS').length],
        ['Completed', detail.roadmap.phases.filter(phase => phase.status === 'COMPLETED').length],
        ['Upcoming', detail.roadmap.phases.filter(isNotStartedRoadmapPhase).length]
      ]),
      defaultOpen: true
    });
  }

  function renderFeatureRoadmap(items) {
    const features = Array.isArray(items) ? items : [];
    if (!features.length) {
      return `
        <article class="pd-feature-roadmap-card">
          <div class="pd-feature-roadmap-head">
            <div>
              <h4>Feature Roadmap</h4>
              <p>Planned feature delivery timeline</p>
            </div>
          </div>
          <div class="pd-feature-roadmap-empty">No feature roadmap available for this project yet.</div>
        </article>
      `;
    }

    const range = featureRoadmapRange(features);
    const months = featureRoadmapMonths(range.start, range.end);
    const now = new Date();
    const todayLeft = featureRoadmapRawPercent(now, range.start, range.end);
    const showToday = todayLeft >= 0 && todayLeft <= 100;
    return `
      <article class="pd-feature-roadmap-card">
        <div class="pd-feature-roadmap-head">
          <div>
            <h4>Feature Roadmap</h4>
            <p>Project-specific feature timeline and delivery progress</p>
          </div>
          <span>${escapeHtml(featureRoadmapQuarterLabel(range.start, range.end))}</span>
        </div>
        <div class="pd-feature-roadmap-chart" style="--pd-feature-months:${months.length}">
          <div class="pd-feature-roadmap-axis">
            <div class="pd-feature-roadmap-axis-spacer"></div>
            <div class="pd-feature-roadmap-months">
              ${months.map(month => `<span class="${isSameMonth(month.date, now) ? 'is-current' : ''}">${escapeHtml(month.label)}</span>`).join('')}
            </div>
          </div>
          <div class="pd-feature-roadmap-body">
            ${showToday ? `<div class="pd-feature-today-marker" style="left:calc(var(--pd-feature-label-width) + ((100% - var(--pd-feature-label-width)) * ${todayLeft / 100}))"><span>TODAY</span></div>` : ''}
            ${features.map(feature => renderFeatureRoadmapRow(feature, range)).join('')}
          </div>
        </div>
      </article>
    `;
  }

  function renderFeatureRoadmapRow(feature, range) {
    const left = featureRoadmapPercent(new Date(feature.startDate), range.start, range.end);
    const right = featureRoadmapPercent(new Date(feature.endDate), range.start, range.end);
    const width = Math.max(4, right - left);
    const progress = clampPercent(feature.progress);
    const showProgress = progress > 0 && !/not started|upcoming|pending/i.test(titleCase(feature.status));
    const barColor = getFeatureRoadmapColor(feature);
    return `
      <div class="pd-feature-roadmap-row">
        <div class="pd-feature-roadmap-label">
          <span>FT</span>
          <strong title="${escapeHtml(feature.name)}">${escapeHtml(feature.name)}</strong>
        </div>
        <div class="pd-feature-roadmap-lane" aria-label="${escapeHtml(feature.name)} timeline">
          <i class="pd-feature-roadmap-bar" style="left:${left}%;width:${width}%;background:${barColor}">
            ${showProgress ? `<b>${progress}%</b>` : ''}
          </i>
        </div>
      </div>
    `;
  }

  function featureRoadmapRange(features) {
    const starts = features.map(item => new Date(item.startDate)).filter(date => !Number.isNaN(date.getTime()));
    const ends = features.map(item => new Date(item.endDate)).filter(date => !Number.isNaN(date.getTime()));
    const fallback = new Date();
    const min = starts.length ? new Date(Math.min(...starts.map(date => date.getTime()))) : fallback;
    const max = ends.length ? new Date(Math.max(...ends.map(date => date.getTime()))) : addMonths(fallback, 6);
    const start = new Date(min.getFullYear(), min.getMonth(), 1);
    const end = new Date(max.getFullYear(), max.getMonth() + 1, 0, 23, 59, 59, 999);
    if (monthsBetween(start, end) < 5) {
      return { start, end: new Date(start.getFullYear(), start.getMonth() + 6, 0, 23, 59, 59, 999) };
    }
    return { start, end };
  }

  function featureRoadmapMonths(start, end) {
    const months = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end && months.length < 12) {
      months.push({
        date: new Date(cursor),
        label: cursor.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  }

  function featureRoadmapPercent(date, start, end) {
    return Math.max(0, Math.min(100, featureRoadmapRawPercent(date, start, end)));
  }

  function featureRoadmapRawPercent(date, start, end) {
    const safeDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(safeDate.getTime())) return 0;
    const total = end.getTime() - start.getTime();
    if (total <= 0) return 0;
    return ((safeDate.getTime() - start.getTime()) / total) * 100;
  }

  function featureRoadmapTone(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized.includes('completed')) return 'completed';
    if (normalized.includes('risk') || normalized.includes('watch') || normalized.includes('blocked')) return 'risk';
    if (normalized.includes('progress')) return 'progress';
    return 'upcoming';
  }

  function featureRoadmapQuarterLabel(start, end) {
    const startLabel = `Q${Math.floor(start.getMonth() / 3) + 1}`;
    const endLabel = `Q${Math.floor(end.getMonth() / 3) + 1}`;
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    if (startYear === endYear) return `${startLabel} - ${endLabel} ${startYear}`;
    return `${startLabel} ${startYear} - ${endLabel} ${endYear}`;
  }

  function monthsBetween(start, end) {
    return (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1;
  }

  function addMonths(value, months) {
    const date = new Date(value || Date.now());
    date.setMonth(date.getMonth() + months);
    return date;
  }

  function isSameMonth(first, second) {
    return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
  }

  function filteredRoadmapPhases(phases) {
    if (state.roadmapFilter === 'COMPLETED') return phases.filter(phase => phase.status === 'COMPLETED');
    if (state.roadmapFilter === 'IN_PROGRESS') return phases.filter(phase => phase.status === 'IN_PROGRESS');
    if (state.roadmapFilter === 'NOT_STARTED') return phases.filter(isNotStartedRoadmapPhase);
    return phases;
  }

  function isNotStartedRoadmapPhase(phase) {
    const status = String(phase?.status || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    return !status || status === 'not_started' || status === 'planned' || status === 'to_do' || status === 'todo';
  }

  function roadmapFilterButton(value, label) {
    const active = state.roadmapFilter === value;
    return `<button class="${active ? 'active' : ''}" type="button" onclick="ProductDeliveryDashboard.setRoadmapFilter('${value}')">${escapeHtml(label)}</button>`;
  }

  function roadmapVisibleCount() {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth <= 700) return 1;
    if (window.innerWidth <= 1000) return 2;
    return 4;
  }

  function roadmapPhaseCard(phase) {
    const riskColor = getDelayRiskColor(phase.delayRisk);
    const progressColor = getRoadmapPhaseProgressColor(phase);
    return `
      <article class="pd-roadmap-phase" style="--pd-roadmap-risk:${riskColor}">
        <span>${escapeHtml(phase.name)}</span>
        ${statusBadge(phase.status)}
        <small>Planned: ${formatDate(phase.plannedDate)}</small>
        <small>Forecast: ${formatDate(phase.forecastDate)}</small>
        <small class="pd-delay-risk">Delay risk: <b><i></i>${escapeHtml(phase.delayRisk)}</b></small>
        ${bar(phase.completion, progressColor)}
      </article>
    `;
  }

  function renderMilestones(detail) {
    return renderDetailBlock('Milestones', renderDataTable(
      ['Milestone', 'Owner', 'Due Date', 'Status', 'Health', 'Dependency', 'Approval Required'],
      detail.milestones.map(item => [
        escapeHtml(item.name),
        escapeHtml(item.owner),
        formatDate(item.dueDate),
        statusBadge(item.status),
        deliveryHealthBadge(item.health),
        escapeHtml(item.dependency),
        escapeHtml(item.approvalRequired)
      ])
    ), 'pd-detail-full', {
      summary: sectionSummary([
        ['Milestones', detail.milestones.length],
        ['At risk', detail.milestones.filter(item => item.health.includes('Red')).length],
        ['Approvals', detail.milestones.filter(item => item.approvalRequired === 'Yes').length]
      ]),
      defaultOpen: true
    });
  }

  function renderResourcePlanning(detail) {
    return renderDetailBlock('Resource Planning', `
      ${metricStrip([
        ['Active Agents', detail.resources.summary.totalActiveAgents],
        ['Available', detail.resources.summary.availableAgents],
        ['High Utilization', detail.resources.summary.highUtilizationAgents],
        ['Blocked', detail.resources.summary.blockedAgents],
        ['Coverage', `${detail.resources.summary.automationCoverage}%`],
        ['Efficiency', `${detail.resources.summary.agentEfficiency}%`]
      ], 'pd-resource-strip')}
      ${agentWorkforceGrid(detail.resources.agents)}
    `, 'pd-detail-full', {
      summary: sectionSummary([
        ['Active agents', detail.resources.summary.totalActiveAgents],
        ['Blocked', detail.resources.summary.blockedAgents],
        ['Coverage', `${detail.resources.summary.automationCoverage}%`]
      ])
    });
  }

  function renderStageGates(detail) {
    return renderDetailBlock('Stage Gates', renderDataTable(
      ['Gate Name', 'Status', 'Approver', 'Decision Date', 'Comments', 'Next Action'],
      detail.stageGates.map(gate => [
        escapeHtml(gate.name),
        statusBadge(gate.status),
        escapeHtml(gate.approver),
        formatDate(gate.decisionDate),
        escapeHtml(gate.comments),
        escapeHtml(gate.nextAction)
      ])
    ), 'pd-detail-full', {
      summary: sectionSummary([
        ['Gates', detail.stageGates.length],
        ['Approved', detail.stageGates.filter(gate => gate.status === 'APPROVED').length],
        ['Blocked', detail.stageGates.filter(gate => gate.status === 'BLOCKED').length]
      ])
    });
  }

  function renderDependencies(detail) {
    return renderDetailBlock('Dependencies', `
      ${dependencySummaryStrip(detail.dependencies.summary)}
      ${renderDataTable(
        ['Dependency Name', 'Type', 'Owner', 'Impact', 'Due Date', 'Status', 'Linked Milestone', 'Risk Level'],
        detail.dependencies.items.map(item => [
          escapeHtml(item.name),
          escapeHtml(item.type),
          escapeHtml(item.owner),
          escapeHtml(item.impact),
          formatDate(item.dueDate),
          statusBadge(item.status),
          escapeHtml(item.linkedMilestone),
          deliveryHealthBadge(item.riskLevel)
        ])
      )}
    `, 'pd-detail-full', {
      summary: sectionSummary([
        ['Internal', detail.dependencies.summary.internal],
        ['External', detail.dependencies.summary.external],
        ['Client', detail.dependencies.summary.client]
      ])
    });
  }

  function renderRisks(detail) {
    const riskTotal = Math.max(detail.risks.summary.high + detail.risks.summary.medium + detail.risks.summary.low, 1);
    return renderDetailBlock('Risks & Issues', `
      <div class="pd-risk-quickview">
        ${pieChart([
          ['High', detail.risks.summary.high, 'danger'],
          ['Medium', detail.risks.summary.medium, 'warning'],
          ['Low', detail.risks.summary.low, 'success']
        ], riskTotal)}
        ${renderMetricCards([
          ['Open Issues', detail.risks.summary.openIssues],
          ['Resolved Issues', detail.risks.summary.resolvedIssues],
          ['Blockers', detail.risks.summary.blockers],
          ['High Risks', detail.risks.summary.high]
        ], 'pd-kpis-compact pd-risk-kpis')}
      </div>
      ${riskIssueList(detail.risks.items)}
    `, 'pd-detail-full', {
      summary: sectionSummary([
        ['High', detail.risks.summary.high],
        ['Open', detail.risks.summary.openIssues],
        ['Blockers', detail.risks.summary.blockers]
      ])
    });
  }

  function renderEscalations(detail) {
    return renderDetailBlock('Escalation Roadmap', `
      ${metricStrip([
        ['Active', detail.escalations.summary.active],
        ['Due Today', detail.escalations.summary.dueToday],
        ['SLA Breaches', detail.escalations.summary.slaBreaches],
        ['Resolved', detail.escalations.summary.resolved],
        ['Executive Attention', detail.escalations.summary.executiveAttention]
      ], 'pd-escalation-strip')}
      ${escalationList(detail.escalations.items)}
    `, 'pd-detail-full', {
      summary: sectionSummary([
        ['Active', detail.escalations.summary.active],
        ['Due today', detail.escalations.summary.dueToday],
        ['SLA breaches', detail.escalations.summary.slaBreaches]
      ])
    });
  }

  function renderCostBudget(detail) {
    return renderDetailBlock('Cost & Budget', `
      ${metricStrip([
        ['Budget', currency(detail.cost.approvedBudget)],
        ['Actual', currency(detail.cost.actualCost)],
        ['Forecast', currency(detail.cost.forecastCost)],
        ['Utilization', `${detail.cost.budgetUtilization}%`],
        ['Variance', currency(detail.cost.costVariance)],
        ['Burn Rate', currency(detail.cost.burnRate)]
      ], 'pd-cost-strip')}
      <div class="pd-cost-dashboard">
        ${costBreakdownList(detail.cost.breakdown)}
      </div>
    `, 'pd-detail-full', {
      summary: sectionSummary([
        ['Budget', currency(detail.cost.approvedBudget)],
        ['Forecast', currency(detail.cost.forecastCost)],
        ['Risk', detail.cost.costRisk]
      ])
    });
  }

  function renderStakeholders(detail) {
    return renderDetailBlock('Stakeholder Communication', `
      ${metricStrip([
        ['Last Client Update', formatDate(detail.stakeholders.summary.lastClientUpdate)],
        ['Next Steering', formatDate(detail.stakeholders.summary.nextSteeringMeeting)],
        ['Pending Decisions', detail.stakeholders.summary.pendingDecisions],
        ['Open Questions', detail.stakeholders.summary.openQuestions],
        ['Health', detail.stakeholders.summary.communicationHealth]
      ], 'pd-stakeholder-strip')}
      ${stakeholderGrid(detail.stakeholders.items)}
    `, 'pd-detail-full', {
      summary: sectionSummary([
        ['Pending decisions', detail.stakeholders.summary.pendingDecisions],
        ['Open questions', detail.stakeholders.summary.openQuestions],
        ['Health', detail.stakeholders.summary.communicationHealth]
      ])
    });
  }

  function renderDecisionLog(detail) {
    const stakeholderDecisions = detail.stakeholders.items
      .filter(item => item.pendingDecision !== 'None')
      .map(item => ({
        decision: item.pendingDecision,
        owner: item.name,
        status: 'PENDING',
        date: detail.stakeholders.summary.nextSteeringMeeting,
        health: item.sentiment
      }));
    const gateDecisions = detail.stageGates
      .filter(gate => gate.decisionDate || gate.status !== 'APPROVED')
      .slice(0, 4)
      .map(gate => ({
        decision: gate.name,
        owner: gate.approver,
        status: gate.status,
        date: gate.decisionDate,
        health: gate.status === 'BLOCKED' ? 'Red / At Risk' : gate.status === 'PENDING' ? 'Amber / Watch' : 'Green / Healthy'
      }));
    const items = stakeholderDecisions.concat(gateDecisions).slice(0, 6);
    return renderDetailBlock('Decision Log', `
      <div class="pd-decision-list">
        ${items.map(item => `
          <article>
            <div>
              <strong title="${escapeHtml(item.decision)}">${escapeHtml(item.decision)}</strong>
              <span>${escapeHtml(item.owner)} · ${formatDate(item.date)}</span>
            </div>
            ${statusBadge(item.status)}
            ${deliveryHealthBadge(item.health)}
          </article>
        `).join('') || emptyWidget('No pending decisions')}
      </div>
    `, 'pd-detail-full', {
      summary: sectionSummary([
        ['Pending', stakeholderDecisions.length],
        ['Gate items', gateDecisions.length]
      ])
    });
  }

  function renderDeliveryHealth(detail) {
    return renderDetailBlock('Delivery Health', `
      <div class="pd-health-grid">
        ${detail.health.items.map(item => `
          <article class="pd-health-metric-card" style="--pd-health-color:${getHealthColor(item.status)}">
            <div class="pd-health-card-head">
              <span>${escapeHtml(item.label)}</span>
              ${deliveryHealthBadge(item.status)}
            </div>
          </article>
        `).join('')}
      </div>
      <div class="pd-overall-confidence">
        <span>Overall Delivery Confidence</span>
        <strong style="color:${getHealthColor(detail.health.overallDeliveryConfidence)}">${escapeHtml(detail.health.overallDeliveryConfidence)}</strong>
      </div>
    `, 'pd-detail-full', {
      summary: `
        <span><b>Confidence</b> <i style="color:${getHealthColor(detail.health.overallDeliveryConfidence)}">${escapeHtml(detail.health.overallDeliveryConfidence)}</i></span>
        <span><b>Signals</b> ${detail.health.items.length}</span>
        <span><b>Watch</b> ${detail.health.items.filter(item => item.status.includes('Amber')).length}</span>
      `,
      defaultOpen: true
    });
  }

  function renderDataTable(headers, rows, className = '') {
    return `
      <div class="table-container pd-inner-table ${className}">
        <table class="pd-table pd-compact-table">
          <thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(row => `<tr>${row.map((cell, index) => `<td data-label="${escapeHtml(headers[index] || '')}">${cell}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
    `;
  }

  function bar(value, color = getProgressColor(value)) {
    return `<div class="pd-card-meter"><i style="width:${clampPercent(value)}%;--pd-rag-fill:${color}"></i></div>`;
  }

  function getHealthToneColor(tone) {
    const normalized = String(tone || '').toLowerCase();
    if (normalized.includes('red') || normalized.includes('critical') || normalized.includes('blocked')) return 'var(--rag-red)';
    if (normalized.includes('amber') || normalized.includes('warning') || normalized.includes('watch')) return 'var(--rag-amber)';
    if (normalized.includes('blue') || normalized.includes('neutral')) return 'var(--info)';
    if (normalized.includes('gray') || normalized.includes('grey')) return '#64748b';
    return 'var(--rag-green)';
  }

  function normalizeStatusTone(status) {
    const value = String(status || '').toUpperCase().replace(/[\s-]+/g, '_');
    if (['BLOCKED', 'DELAYED', 'HIGH_RISK', 'FAILED', 'REJECTED', 'ESCALATED', 'REWORK'].includes(value)) return 'red';
    if (['IN_PROGRESS', 'EXECUTING', 'AT_RISK', 'PENDING_REVIEW', 'PARTIALLY_COMPLETE', 'GATE_REVIEW', 'AGENT_ASSIGNED'].includes(value)) return 'amber';
    if (['COMPLETED', 'DONE', 'APPROVED', 'ON_TRACK', 'ACTIVE', 'RESOLVED', 'PASS', 'PASSED'].includes(value)) return 'green';
    if (['PENDING', 'NOT_STARTED', 'SPECIFIED', 'CREATED', 'IDLE'].includes(value)) return 'gray';
    return 'gray';
  }

  function getFeatureHealthTone(feature) {
    const completion = clampPercent(feature?.completion);
    const blockers = Number(feature?.blockers) || 0;
    const priority = priorityLabel(feature?.priority);
    const statusTone = normalizeStatusTone(feature?.status);
    const delayTone = getDelayRiskTone(feature?.delayRisk || feature?.scheduleStatus);

    if (statusTone === 'red' || delayTone === 'red') return 'red';
    if (blockers >= 2 || (blockers > 0 && priority === 'Must Have')) return 'red';
    if (blockers > 0 || statusTone === 'amber' || delayTone === 'amber') return 'amber';
    if (statusTone === 'green' || completion >= 71) return 'green';
    if (completion <= 30) return 'amber';
    if (completion <= 70) return 'amber';
    return 'green';
  }

  function getProgressHealthTone(completion, status, blockers = 0, delayRisk = '', priority = '') {
    const statusTone = normalizeStatusTone(status);
    const riskTone = getDelayRiskTone(delayRisk);
    const count = Number(blockers) || 0;
    const pct = clampPercent(completion);
    const isMustHave = priorityLabel(priority) === 'Must Have';
    if (statusTone === 'red' || riskTone === 'red' || count >= 2) return 'red';
    if (count > 0 && isMustHave) return 'red';
    if (count > 0 || riskTone === 'amber') return 'amber';
    if (statusTone === 'gray') return pct <= 30 ? 'gray' : 'amber';
    if (pct >= 71 || statusTone === 'green') return 'green';
    if (pct >= 31) return 'amber';
    if (statusTone === 'amber') return 'amber';
    return 'amber';
  }

  function getProgressColor(completion, status, blockers = 0, delayRisk = '') {
    return getHealthToneColor(getProgressHealthTone(completion, status, blockers, delayRisk));
  }

  function getSprintProgressColor(sprint) {
    return getProgressColor(sprint?.completion, sprint?.status, sprint?.blocked || 0, sprint?.delayRisk || '');
  }

  function getRoadmapPhaseProgressColor(phase) {
    return getProgressColor(phase?.completion, phase?.status, 0, phase?.delayRisk);
  }

  function getFeatureRoadmapColor(feature) {
    const healthTone = getDelayRiskTone(feature?.health);
    if (healthTone) return getHealthToneColor(healthTone);
    return getProgressColor(feature?.progress, feature?.status, feature?.blockers || 0, feature?.delayRisk);
  }

  function getDelayRiskTone(risk) {
    const normalized = String(risk || '').toLowerCase();
    if (!normalized) return '';
    if (normalized.includes('high') || normalized.includes('red') || normalized.includes('delayed') || normalized.includes('blocked')) return 'red';
    if (normalized.includes('medium') || normalized.includes('amber') || normalized.includes('watch') || normalized.includes('risk')) return 'amber';
    if (normalized.includes('low') || normalized.includes('green') || normalized.includes('on track')) return 'green';
    return '';
  }

  function getScheduleBehindColor(behind, total) {
    const count = Number(behind) || 0;
    const all = Math.max(Number(total) || 0, 1);
    if (count <= 0) return getHealthToneColor('green');
    return count / all > 0.3 ? getHealthToneColor('red') : getHealthToneColor('amber');
  }

  function getFunnelStepColor(label, fill, value, total) {
    const normalized = String(label || '').toLowerCase();
    const count = Number(value) || 0;
    const all = Math.max(Number(total) || 0, 1);
    if (normalized.includes('clarification')) return count / all > 0.25 ? getHealthToneColor('red') : getHealthToneColor('amber');
    if (normalized.includes('review')) return fill >= 70 ? getHealthToneColor('green') : getHealthToneColor('amber');
    if (normalized.includes('approval') || normalized.includes('sprint ready') || normalized.includes('backlog')) return fill >= 50 ? getHealthToneColor('green') : getHealthToneColor('amber');
    return getHealthToneColor('green');
  }

  function priorityBadge(value) {
    const label = priorityLabel(value);
    return `<span class="pd-badge pd-priority-badge" style="background:${getPriorityColor(label)}">${escapeHtml(label)}</span>`;
  }

  function scoreVisual(label, value, caption) {
    const score = clampPercent(value);
    const level = score >= 76 ? 'High' : score >= 51 ? 'Medium' : score >= 26 ? 'Low' : 'Minimal';
    const tone = label === 'Risk' && score >= 65 ? 'danger' : score >= 76 ? 'success' : score >= 51 ? 'warning' : 'info';
    return `
      <article class="pd-priority-visual">
        <div>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(level)}</strong>
        </div>
        <i class="pd-priority-meter pd-meter-${tone}"><b style="width:${score}%"></b></i>
        <small>${escapeHtml(caption)}</small>
      </article>
    `;
  }

  function priorityTierVisual(rank) {
    const tier = String(rank || 'P3').toUpperCase();
    const tiers = ['P1', 'P2', 'P3', 'P4', 'P5'];
    return `
      <article class="pd-priority-visual pd-priority-tier">
        <div>
          <span>Priority Tier</span>
          <strong>${escapeHtml(tier)}</strong>
        </div>
        <div class="pd-tier-ladder">
          ${tiers.map(item => `<i class="${item === tier ? 'active' : ''}">${item}</i>`).join('')}
        </div>
        <small>Tier ladder</small>
      </article>
    `;
  }

  function dependencySummaryStrip(summary) {
    const items = [
      ['Internal', summary.internal, 'info'],
      ['External', summary.external, 'warning'],
      ['Technical', summary.technical, 'success'],
      ['Business', summary.business, 'orange'],
      ['Client', summary.client, 'danger']
    ];
    return `
      <div class="pd-dependency-strip">
        ${items.map(([label, value, tone]) => `
          <article>
            <i class="pd-dot pd-tone-${tone}"></i>
            <span>${escapeHtml(label)}</span>
            <strong>${value}</strong>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderCrossRoleTable(projects, model) {
    if (!projects.length) {
      return `
        <div class="pd-empty-state">
          <h3>No Cross-Role Projects</h3>
          <p>You are not assigned to any projects outside your Product &amp; Delivery role.</p>
        </div>
      `;
    }

    return `
      <div class="pd-cross-summary-list" role="list">
        ${projects.map(project => crossRoleRow(project, model)).join('')}
      </div>
    `;
  }

  function crossRoleRow(project, model) {
    const assignment = NexusRoleUtils.findUserAssignment(project, model.currentUser);
    const role = NexusRoleUtils.normalizeProjectRole(assignment?.projectRole);
    const detail = generateCrossRoleDetails(project, role, model);
    const expanded = state.expandedCrossProjectId === project.id;
    const progress = Math.round(detail.workItems.reduce((sum, item) => sum + Number(item.progress || 0), 0) / Math.max(detail.workItems.length, 1));
    const riskCount = detail.risks.filter(item => item.status !== 'RESOLVED').length + Number(detail.overview.activeBlockers || 0);
    const sprintTag = detail.timeline[0]?.milestone || detail.overview.nextMilestone;
    return `
      <article class="pd-project-summary-row pd-cross-summary-row ${expanded ? 'is-expanded' : ''}" role="listitem">
        <div class="pd-project-summary-main">
          <span class="pd-health-dot ${healthDotClass(detail.overview.deliveryHealth)}" title="${escapeHtml(detail.overview.deliveryHealth)}"></span>
          <div class="pd-project-name-block">
            <strong title="${escapeHtml(project.name)}">${escapeHtml(project.name)}</strong>
            <span title="${escapeHtml(detail.overview.supportArea)}">${escapeHtml(detail.overview.supportArea)}</span>
          </div>
        </div>
        <div class="pd-project-summary-meta">
          <span><b>Role</b><i title="${escapeHtml(detail.overview.assignedRole)}">${escapeHtml(detail.overview.assignedRole)}</i></span>
          <span><b>Priority</b>${priorityBadge(detail.overview.priority)}</span>
          <span><b>Status</b>${statusBadge(project.status || detail.overview.currentStatus || 'ACTIVE')}</span>
          <span><b>Milestone</b><i title="${escapeHtml(sprintTag)}">${escapeHtml(sprintTag)}</i></span>
          <span><b>Risk</b>${blockersBadge(riskCount ? `${riskCount} open` : 'None')}</span>
        </div>
        <div class="pd-project-summary-progress">
          <div>
            <strong style="color:${getProgressColor(progress, detail.overview.currentStatus, riskCount)}">${progress}%</strong>
            <span>progress</span>
          </div>
        </div>
        <button class="pd-view-details-btn" type="button" onclick="ProductDeliveryDashboard.toggleCrossDetails('${project.id}')">${expanded ? 'Hide Details' : 'View Details'}</button>
      </article>
      ${expanded ? `<div class="pd-details-row">${renderCrossRoleDetails(project, model)}</div>` : ''}
    `;
  }

  function renderCrossRoleDetails(project, model) {
    const assignment = NexusRoleUtils.findUserAssignment(project, model.currentUser);
    const role = NexusRoleUtils.normalizeProjectRole(assignment?.projectRole);
    const detail = generateCrossRoleDetails(project, role, model);
    return `
      <div class="pd-cross-details pd-cross-support-details">
        <div class="pd-details-titlebar">
          <div>
            <h3>${escapeHtml(project.name || 'Project')} Cross-Role Support</h3>
            <p>${escapeHtml(detail.summary)}</p>
          </div>
          ${deliveryHealthBadge(detail.overview.deliveryHealth)}
        </div>
        ${renderDetailBlock('Cross-Role Overview', renderMetricCards([
          ['Assigned Role', detail.overview.assignedRole],
          ['Support Area', detail.overview.supportArea],
          ['Current Status', detail.overview.currentStatus],
          ['Priority', detail.overview.priority],
          ['Delivery Health', detail.overview.deliveryHealth],
          ['Active Blockers', detail.overview.activeBlockers],
          ['Pending Actions', detail.overview.pendingActions],
          ['Due Date / Next Milestone', detail.overview.nextMilestone]
        ]), 'pd-detail-full', { accordion: false })}
        ${renderDetailBlock('Responsibilities', `
          <div class="pd-cross-responsibility-grid">
            ${crossResponsibilityCard('Primary Responsibilities', detail.responsibilities.primary)}
            ${crossResponsibilityCard('Secondary Responsibilities', detail.responsibilities.secondary)}
            ${crossResponsibilityCard('Current Deliverables', detail.responsibilities.deliverables)}
            ${crossResponsibilityCard('Expected Outputs', detail.responsibilities.outputs)}
            ${crossResponsibilityCard('Handoffs / Dependencies', detail.responsibilities.handoffs)}
          </div>
        `, 'pd-detail-full', { accordion: false })}
      </div>
    `;
  }

  function crossResponsibilityCard(title, items) {
    return `
      <article class="pd-cross-responsibility-card">
        <h4>${escapeHtml(title)}</h4>
        <ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </article>
    `;
  }

  function generateCrossRoleDetails(project, role, model) {
    const seed = hashProject({ ...project, id: `${project.id || ''}-${role || ''}` });
    const meta = getCrossRoleMeta(role);
    const roleLabel = NexusRoleUtils.projectRoleLabel(role) || 'Workspace Support';
    const roleContent = getCrossRoleContent(role);
    const blocker = getCrossRoleBlocker(project, role);
    const activeBlockers = blocker && blocker !== 'None' ? seededInt(seed, 1, 3, 1) : 0;
    const pendingActions = seededInt(seed, 2, 8, 2);
    const health = project.status === 'BLOCKED' || activeBlockers > 2 ? 'Red / At Risk' : activeBlockers ? 'Amber / Watch' : 'Green / Healthy';
    const start = project.createdAt || project.created_at || Date.now();
    const collaborators = buildCrossCollaborators(project, model, roleLabel);

    return {
      summary: `${roleLabel} contribution for ${project.name || 'this project'}: ${meta.details?.focusArea || 'role-specific project support'}.`,
      overview: {
        assignedRole: roleLabel,
        supportArea: roleContent.supportArea,
        currentStatus: titleCase(project.status || 'Active'),
        priority: pick(seed, ['High', 'Medium', 'Critical', 'Watch'], 3),
        deliveryHealth: health,
        activeBlockers,
        pendingActions,
        nextMilestone: `${roleContent.milestones[0]} (${formatDate(addDays(start, seededInt(seed, 12, 36, 4)))})`
      },
      responsibilities: {
        primary: roleContent.primary,
        secondary: roleContent.secondary,
        deliverables: roleContent.deliverables,
        outputs: roleContent.outputs,
        handoffs: roleContent.handoffs
      },
      workItems: roleContent.tasks.map((task, index) => ({
        name: task,
        status: pick(seed, ['IN_PROGRESS', 'PENDING', 'BLOCKED', 'APPROVED', 'COMPLETED'], 10 + index),
        owner: collaborators[index % collaborators.length],
        dueDate: addDays(start, 8 + index * seededInt(seed, 5, 10, 20 + index)),
        progress: seededInt(seed, 18, 96, 30 + index),
        notes: pick(seed, roleContent.notes, 40 + index)
      })),
      risks: roleContent.risks.map((risk, index) => ({
        name: risk,
        severity: pick(seed, ['Green / Healthy', 'Amber / Watch', 'Red / At Risk'], 50 + index),
        impact: pick(seed, ['Schedule', 'Quality', 'Scope', 'Readiness', 'Decision latency'], 60 + index),
        owner: collaborators[(index + 1) % collaborators.length],
        mitigation: pick(seed, roleContent.mitigations, 70 + index),
        eta: addDays(Date.now(), seededInt(seed, 2, 18, 80 + index)),
        status: pick(seed, ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'BLOCKED'], 90 + index)
      })),
      dependencies: roleContent.dependencies.map((dependency, index) => ({
        party: collaborators[(index + 2) % collaborators.length],
        type: dependency,
        requiredBy: addDays(start, 14 + index * 9),
        status: pick(seed, ['PENDING', 'IN_PROGRESS', 'APPROVED', 'BLOCKED'], 100 + index),
        escalationNeed: pick(seed, ['Green / Healthy', 'Amber / Watch', 'Red / At Risk'], 110 + index)
      })),
      timeline: roleContent.milestones.map((milestone, index) => ({
        milestone,
        contribution: roleContent.contributions[index % roleContent.contributions.length],
        plannedDate: addDays(start, 18 + index * 14),
        readiness: seededInt(seed, 24, 100, 120 + index),
        risks: pick(seed, roleContent.timelineRisks, 130 + index)
      })),
      communication: {
        lastUpdate: addDays(Date.now(), -seededInt(seed, 1, 9, 140)),
        nextCheckIn: addDays(Date.now(), seededInt(seed, 1, 10, 141)),
        pendingDecisions: seededInt(seed, 0, 4, 142),
        escalationRequired: health.includes('Red') ? 'Yes' : pick(seed, ['No', 'Watch'], 143),
        escalationOwner: pick(seed, collaborators.concat(['Delivery Manager', 'Product Owner']), 144)
      }
    };
  }

  function buildCrossCollaborators(project, model, roleLabel) {
    const assignments = NexusRoleUtils.getProjectAssignments(project);
    const users = model.tenantUsers || [];
    const names = assignments
      .map(assignment => users.find(user => user.id === assignment.userId || user.email === assignment.email)?.name)
      .filter(Boolean);
    return [...new Set(names.concat([roleLabel, 'Product Owner', 'Delivery Manager', 'Tech Lead', 'QA Lead']))];
  }

  function getCrossRoleContent(role) {
    const roleKey = NexusRoleUtils.normalizeProjectRole(role);
    const common = {
      supportArea: 'Project execution support',
      primary: ['Track assigned role commitments', 'Surface blockers early', 'Coordinate handoffs with Product & Delivery'],
      secondary: ['Join checkpoint reviews', 'Update delivery evidence', 'Confirm readiness signals'],
      deliverables: ['Support status update', 'Role-specific work evidence', 'Dependency notes'],
      outputs: ['Reviewed artifacts', 'Action log', 'Readiness signal'],
      handoffs: ['Product & Delivery planning', 'Execution team coordination', 'Milestone sign-off support'],
      tasks: ['Review assigned support queue', 'Update readiness evidence', 'Close role-specific actions', 'Confirm milestone contribution'],
      risks: ['Support action delay', 'Dependency response lag', 'Incomplete handoff evidence'],
      dependencies: ['Product clarification', 'Execution input', 'Approval checkpoint'],
      milestones: ['Support Readiness Review', 'Milestone Contribution Due', 'Cross-Team Handoff'],
      contributions: ['Provide role status and evidence', 'Resolve support blockers', 'Confirm milestone readiness'],
      notes: ['Evidence is being consolidated', 'Waiting for one dependency response', 'On track for next checkpoint'],
      mitigations: ['Escalate at next check-in', 'Split work into smaller support actions', 'Confirm owner and ETA'],
      timelineRisks: ['No material risk', 'Decision turnaround needs monitoring', 'Dependency may affect readiness']
    };
    const byRole = {
      QA_TESTING: {
        supportArea: 'QA validation and release quality',
        primary: ['Review generated test cases', 'Track test execution progress', 'Validate defects and retest readiness'],
        secondary: ['Confirm QA entry criteria', 'Support UAT preparation', 'Report quality gate risks'],
        deliverables: ['Test case review notes', 'Execution summary', 'Defect triage update'],
        outputs: ['Validation status', 'Defect summary', 'QA sign-off recommendation'],
        handoffs: ['Development fixes', 'UAT evidence', 'Release quality gate'],
        tasks: ['Review test case coverage', 'Execute priority regression suite', 'Triage open defects', 'Validate QA environment readiness'],
        risks: ['QA environment not ready', 'Critical defect retest pending', 'UAT evidence incomplete'],
        dependencies: ['Development fix availability', 'Test data readiness', 'Client UAT schedule'],
        milestones: ['QA Entry', 'Regression Complete', 'UAT Sign-off'],
        contributions: ['Confirm validation scope', 'Report quality readiness', 'Approve QA gate evidence'],
        notes: ['Defect aging is under review', 'Regression scope is prioritized', 'Environment access is being confirmed'],
        mitigations: ['Reprioritize high-risk tests', 'Pair with development owner', 'Escalate environment readiness'],
        timelineRisks: ['Defect retest may compress UAT', 'Environment readiness needs monitoring', 'Coverage gap under review']
      },
      TECHNICAL_EXECUTION: {
        supportArea: 'Development delivery and integration',
        primary: ['Execute development tasks', 'Track build readiness', 'Resolve integration dependencies'],
        secondary: ['Support code review', 'Clarify implementation details', 'Update technical risk notes'],
        deliverables: ['Implementation status', 'Build readiness note', 'Integration dependency update'],
        outputs: ['Code review package', 'Implementation evidence', 'Technical handoff notes'],
        handoffs: ['QA test readiness', 'Release branch readiness', 'Architecture review closure'],
        tasks: ['Complete assigned development task', 'Prepare integration build', 'Close code review comments', 'Validate API contract changes'],
        risks: ['API dependency delay', 'Code review backlog', 'Integration conflict'],
        dependencies: ['Architecture decision', 'API contract confirmation', 'QA test data'],
        milestones: ['Build Ready', 'Integration Complete', 'Code Freeze'],
        contributions: ['Deliver implementation evidence', 'Resolve technical blockers', 'Confirm integration readiness'],
        notes: ['Implementation is progressing', 'Review queue has active comments', 'Integration plan is being validated'],
        mitigations: ['Run focused technical review', 'Pair on blocked API contract', 'Sequence integration work by dependency'],
        timelineRisks: ['Integration window may tighten', 'Contract review needs closure', 'Build stability under watch']
      },
      RELEASE_DEVOPS: {
        supportArea: 'Release readiness and environments',
        primary: ['Validate environment readiness', 'Track CI/CD tasks', 'Coordinate deployment blockers'],
        secondary: ['Prepare rollback evidence', 'Confirm release approvals', 'Monitor deployment risks'],
        deliverables: ['Release readiness checklist', 'Deployment plan update', 'Environment validation report'],
        outputs: ['CI/CD status', 'Release approval evidence', 'Rollback readiness note'],
        handoffs: ['QA sign-off', 'Production release approval', 'Post-release monitoring'],
        tasks: ['Validate staging environment', 'Review deployment pipeline', 'Confirm rollback path', 'Close release approval action'],
        risks: ['Deployment window conflict', 'Environment readiness gap', 'Pipeline failure risk'],
        dependencies: ['QA sign-off', 'Infrastructure approval', 'Release calendar confirmation'],
        milestones: ['Environment Ready', 'Release Approval', 'Go Live'],
        contributions: ['Confirm deployment readiness', 'Resolve environment blockers', 'Publish release evidence'],
        notes: ['Pipeline evidence is current', 'Release window is being confirmed', 'Rollback plan needs final review'],
        mitigations: ['Run pre-release dry run', 'Secure release approval owner', 'Prepare contingency window'],
        timelineRisks: ['Release window dependency', 'Approval timing under watch', 'Environment drift risk']
      },
      GOVERNANCE_ADMIN: {
        supportArea: 'Governance reviews and approvals',
        primary: ['Track approvals pending', 'Review compliance checkpoints', 'Coordinate governance decisions'],
        secondary: ['Maintain audit evidence', 'Route critical decisions', 'Confirm policy alignment'],
        deliverables: ['Approval queue update', 'Compliance checkpoint report', 'Governance decision log'],
        outputs: ['Approval status', 'Audit evidence', 'Policy exception notes'],
        handoffs: ['Product approval gate', 'Compliance sign-off', 'Executive decision path'],
        tasks: ['Review approval queue', 'Validate compliance checkpoint', 'Confirm governance evidence', 'Route pending decision'],
        risks: ['Approval delay', 'Compliance evidence gap', 'Policy exception unresolved'],
        dependencies: ['Product owner approval', 'Compliance reviewer response', 'Executive decision input'],
        milestones: ['Governance Review', 'Compliance Checkpoint', 'Approval Gate'],
        contributions: ['Confirm governance readiness', 'Close approval actions', 'Document compliance evidence'],
        notes: ['Approval evidence is being assembled', 'Compliance checkpoint is active', 'Decision owner is assigned'],
        mitigations: ['Escalate overdue approval', 'Request missing evidence', 'Schedule governance review'],
        timelineRisks: ['Approval timing may affect gate', 'Evidence completeness under review', 'Policy exception needs decision']
      },
      EXECUTIVE_STRATEGIC: {
        supportArea: 'Strategic decisions and steering alignment',
        primary: ['Review strategic decisions', 'Track steering dependencies', 'Resolve leadership escalations'],
        secondary: ['Validate business alignment', 'Monitor ROI and risk signals', 'Support sponsor communication'],
        deliverables: ['Steering decision brief', 'Leadership risk update', 'Strategic alignment note'],
        outputs: ['Decision recommendation', 'Executive escalation summary', 'Business impact note'],
        handoffs: ['Governance decision', 'Product priority confirmation', 'Client sponsor alignment'],
        tasks: ['Review steering dependency', 'Confirm strategic priority', 'Resolve leadership escalation', 'Approve decision path'],
        risks: ['Strategic decision delay', 'Sponsor alignment gap', 'Business priority conflict'],
        dependencies: ['Client sponsor input', 'PMO recommendation', 'Product value assessment'],
        milestones: ['Steering Review', 'Strategic Decision Due', 'Executive Approval'],
        contributions: ['Confirm decision direction', 'Resolve leadership dependency', 'Approve strategic path'],
        notes: ['Decision brief is ready for review', 'Sponsor input is being gathered', 'Strategic priority remains visible'],
        mitigations: ['Schedule sponsor decision forum', 'Escalate priority tradeoff', 'Publish decision recommendation'],
        timelineRisks: ['Decision latency may affect planning', 'Sponsor alignment under watch', 'Priority tradeoff pending']
      }
    };
    return { ...common, ...(byRole[roleKey] || {}) };
  }

  function detailSection(title, items) {
    return `
      <div class="pd-detail-section">
        <h3>${escapeHtml(title)}</h3>
        <div class="pd-kpi-grid">
          ${items.map(([label, value]) => `
            <div class="pd-kpi-chip">
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(String(value))}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function detailListSection(title, items) {
    return `
      <div class="pd-detail-section">
        <h3>${escapeHtml(title)}</h3>
        <ul class="pd-detail-list">
          ${(items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  function getCrossRoleMeta(role) {
    return ProductDeliveryDashboardData.crossRoleMeta[role] || ProductDeliveryDashboardData.crossRoleMeta.WORKSPACE_UNIVERSAL;
  }

  function getPrimaryPersona(role, assignment) {
    const meta = getCrossRoleMeta(role);
    return assignment?.persona || meta.defaultPersona || NexusRoleUtils.projectRoleLabel(role);
  }

  function getShortResponsibilities(role, max = 3) {
    return (getCrossRoleMeta(role).tasksInvolved || []).slice(0, max);
  }

  function miniProgress(value) {
    return `<div class="pd-mini-progress"><span style="width:${clampPercent(value)}%;--pd-rag-fill:${getProgressColor(value)}"></span></div>`;
  }

  function deliveryHealthBadge(value) {
    const label = titleCase(value || 'Watch');
    return `<span class="pd-badge pd-rag-badge" style="background:${getHealthColor(label)}">${escapeHtml(label)}</span>`;
  }

  function statusBadge(status) {
    const label = String(status || 'NOT_STARTED').trim().toUpperCase();
    const color = getStatusColor(label);
    return `<span class="status-badge pd-status-badge" style="background:${getStatusBadgeBackground(label)};color:${getStatusBadgeTextColor(label)};border-color:${color}">${escapeHtml(label)}</span>`;
  }

  function blockersBadge(value) {
    const hasBlocker = value && value !== 'None';
    return `<span class="pd-badge ${hasBlocker ? 'pd-badge-danger' : 'pd-badge-muted'}">${escapeHtml(value || 'None')}</span>`;
  }

  function featureBlockersCell(value) {
    const count = Number(value) || 0;
    if (count <= 0) return '<span class="pd-feature-blockers is-clear">—</span>';
    return `<span class="pd-feature-blockers">${count}</span>`;
  }

  function sprintChips(values) {
    const sprints = Array.isArray(values) && values.length ? values : ['Sprint 1'];
    return `<div class="pd-sprint-chip-list">${sprints.map(sprint => `<span>${escapeHtml(sprint)}</span>`).join('')}</div>`;
  }

  function ragStatusDot(value, blockers = 0) {
    const normalized = String(value || 'green').toLowerCase();
    const tone = normalized.includes('red') || normalized.includes('critical') ? 'red' : normalized.includes('amber') || normalized.includes('yellow') || normalized.includes('warning') ? 'amber' : normalized.includes('gray') || normalized.includes('grey') ? 'gray' : 'green';
    const labels = { green: 'Green / Healthy', amber: 'Amber / Watch', red: 'Red / At Risk', gray: 'Neutral / Not Started' };
    const count = Number(blockers) || 0;
    const title = count > 0 ? `${count} blockers` : 'On track';
    return `<span class="pd-rag-status pd-rag-${tone}" title="${escapeHtml(title)}" aria-label="${labels[tone]}"><i></i></span>`;
  }

  function getDelayRiskColor(risk) {
    const tone = getDelayRiskTone(risk);
    if (tone === 'red') return 'var(--rag-red)';
    if (tone === 'amber') return 'var(--rag-amber)';
    return 'var(--rag-green)';
  }

  function getHealthColor(value) {
    const normalized = String(value || '').toLowerCase();
    if (normalized.includes('red') || normalized.includes('risk') || normalized.includes('critical') || normalized.includes('blocked') || normalized.includes('low')) return 'var(--rag-red)';
    if (normalized.includes('amber') || normalized.includes('watch') || normalized.includes('medium') || normalized.includes('monitor')) return 'var(--rag-amber)';
    return 'var(--rag-green)';
  }

  function getConfidenceColor(value) {
    const normalized = String(value || '').toLowerCase();
    if (normalized.includes('high')) return 'var(--rag-green)';
    if (normalized.includes('medium')) return 'var(--rag-amber)';
    return 'var(--rag-red)';
  }

  function getDaysRemainingColor(value) {
    const days = Number(value);
    if (!Number.isFinite(days)) return 'var(--text-primary)';
    if (days > 60) return 'var(--rag-green)';
    if (days >= 30) return 'var(--rag-amber)';
    return 'var(--rag-red)';
  }

  function getStatusColor(status) {
    const tone = normalizeStatusTone(status);
    if (tone === 'green') return 'var(--rag-green)';
    if (tone === 'amber') return 'var(--rag-amber)';
    if (tone === 'red') return 'var(--rag-red)';
    return '#94a3b8';
  }

  function getStatusBadgeBackground(status) {
    const tone = normalizeStatusTone(status);
    if (tone === 'green') return '#dcfce7';
    if (tone === 'amber') return '#fef3c7';
    if (tone === 'red') return '#fee2e2';
    return '#f1f5f9';
  }

  function getStatusBadgeTextColor(status) {
    const tone = normalizeStatusTone(status);
    if (tone === 'green') return '#166534';
    if (tone === 'amber') return '#92400e';
    if (tone === 'red') return '#991b1b';
    return '#334155';
  }

  function priorityLabel(priority) {
    const normalized = String(priority || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
    const labels = {
      MUST_HAVE: 'Must Have',
      SHOULD_HAVE: 'Should Have',
      COULD_HAVE: 'Could Have',
      WONT_HAVE: "Won't Have",
      DEFERRED: "Won't Have"
    };
    return labels[normalized] || titleCase(priority || 'Could Have');
  }

  function getPriorityColor(priority) {
    switch (priorityLabel(priority)) {
      case 'Must Have':
        return 'var(--rag-red)';
      case 'Should Have':
        return 'var(--rag-amber)';
      case 'Could Have':
        return '#64748b';
      case "Won't Have":
        return '#9ca3af';
      default:
        return '#6b7280';
    }
  }

  function clampPercent(value) {
    const num = Number(value) || 0;
    return Math.max(0, Math.min(100, Math.round(num)));
  }

  function buildProductDeliveryDetail(project) {
    return generateProductDeliveryDetails(project || {});
  }

  function generateProductDeliveryDetails(project) {
    const requirements = NexusStore.getRequirements(project.id);
    const backlog = NexusStore.getBacklog(project.id);
    const pipeline = NexusStore.getPipeline(project.id);
    const tasks = NexusStore.getTasks(project.id);
    const stages = pipeline?.stages || [];
    const completedStages = stages.filter(stage => stage.status === 'COMPLETED').length;
    const currentStage = stages.find(stage => stage.status === 'IN_PROGRESS') || stages[completedStages - 1] || stages[0];
    const nextStage = stages.find(stage => stage.status === 'PENDING' || stage.stage === (currentStage?.stage || 0) + 1);
    const blockedStages = stages.filter(stage => ['BLOCKED', 'ESCALATED'].includes(stage.status)).length;
    const seed = hashProject(project);
    const totalRequirements = requirements.length || seededInt(seed, 22, 54, 1);
    const totalBacklog = backlog.length || seededInt(seed, 30, 86, 2);
    const totalTasks = tasks.length || seededInt(seed, 28, 110, 3);
    const pendingReview = countBy(requirements, req => !req.reviewStatus || req.reviewStatus === 'PENDING') || seededInt(seed, 3, 12, 4);
    const needsClarification = countBy(requirements, req => Number(req.confidence) < 0.9) || seededInt(seed, 2, 9, 5);
    const reviewed = Math.max(0, totalRequirements - pendingReview);
    const readyForBacklog = Math.max(1, reviewed - needsClarification);
    const convertedToBacklog = Math.min(totalRequirements, Math.max(readyForBacklog - seededInt(seed, 0, 5, 6), Math.round(totalRequirements * 0.45)));
    const generatedByAI = totalBacklog;
    const pendingApproval = countBy(backlog, item => ['SPECIFIED', 'PENDING', 'IN_REVIEW'].includes(item.status)) || seededInt(seed, 5, 18, 7);
    const approved = countBy(backlog, item => ['DONE', 'APPROVED', 'IN_PROGRESS'].includes(item.status)) || seededInt(seed, 12, Math.max(14, totalBacklog - pendingApproval), 8);
    const returned = countBy(backlog, item => item.status === 'RETURNED') || seededInt(seed, 1, 6, 9);
    const rejected = countBy(backlog, item => item.status === 'REJECTED') || seededInt(seed, 0, 4, 10);
    const scheduleHealth = buildBacklogScheduleHealth(backlog, seed, totalBacklog);
    const completionPercentage = stages.length ? Math.round((completedStages / stages.length) * 100) : seededInt(seed, 24, 88, 11);
    const deliveryConfidence = ProductDeliveryDashboardData.deliveryConfidence(project, pipeline);
    const timelineStatus = project.status === 'BLOCKED' ? 'At Risk' : completionPercentage > 76 ? 'On Track' : completionPercentage > 46 ? 'Watch' : 'Monitoring';
    const deliveryHealth = project.status === 'BLOCKED' ? 'Red / At Risk' : deliveryConfidence === 'High' || completionPercentage > 72 ? 'Green / Healthy' : 'Amber / Watch';
    const currentMilestone = project.currentMilestone || currentStage?.name || pick(seed, ['Backlog Approval', 'Sprint Planning Completed', 'MVP Feature Complete', 'QA Entry'], 12);
    const targetDeliveryDate = getDeliveryDate(project);
    const daysRemaining = daysBetween(new Date(), new Date(targetDeliveryDate));
    const modules = buildFeatureModules(project, backlog, seed, completionPercentage);
    const priorityMix = {
      mustHave: countPriority(backlog, 'MUST_HAVE') || seededInt(seed, 8, 22, 13),
      shouldHave: countPriority(backlog, 'SHOULD_HAVE') || seededInt(seed, 6, 18, 14),
      couldHave: countPriority(backlog, 'COULD_HAVE') || seededInt(seed, 3, 12, 15),
      deferred: countPriority(backlog, 'WONT_HAVE') || seededInt(seed, 1, 8, 16)
    };
    const sprintList = buildSprints(project, seed, completionPercentage);
    const currentSprint = sprintList.find(sprint => sprint.status === 'IN_PROGRESS') || sprintList[Math.min(2, sprintList.length - 1)];
    const healthItems = buildHealthItems(project, seed, completionPercentage, deliveryHealth);

    return {
      overview: {
        totalRequirements,
        requirementsPendingReview: pendingReview,
        readyForBacklog,
        backlogItemsGenerated: generatedByAI,
        backlogItemsApproved: approved,
        currentSprint: currentSprint.name,
        currentMilestone,
        deliveryConfidence,
        overallCompletion: completionPercentage,
        targetDeliveryDate,
        daysRemaining,
        projectHealth: deliveryHealth
      },
      requirements: {
        total: totalRequirements,
        totalReceived: totalRequirements,
        pendingReview,
        reviewed,
        needsClarification,
        readyForBacklog,
        convertedToBacklog,
        funnel: [
          { label: 'Requirement Intake', value: totalRequirements },
          { label: 'Review', value: reviewed },
          { label: 'Clarification', value: needsClarification },
          { label: 'Backlog Generation', value: convertedToBacklog },
          { label: 'Approval', value: approved },
          { label: 'Sprint Ready', value: Math.max(1, approved - seededInt(seed, 1, 6, 17)) }
        ]
      },
      backlog: {
        generated: generatedByAI,
        generatedByAI,
        pendingApproval,
        approved,
        returned,
        rejected,
        returnedRejected: returned + rejected,
        onScheduleCount: scheduleHealth.onScheduleCount,
        offScheduleCount: scheduleHealth.offScheduleCount,
        runningBehindCount: scheduleHealth.offScheduleCount
      },
      features: modules,
      prioritization: {
        mix: priorityMix,
        businessValueScore: seededInt(seed, 68, 96, 18),
        effortScore: seededInt(seed, 32, 78, 19),
        riskScore: seededInt(seed, 18, 72, 20),
        priorityRank: `P${seededInt(seed, 1, 5, 21)}`
      },
      sprints: {
        current: {
          name: currentSprint.name,
          startDate: currentSprint.startDate,
          endDate: currentSprint.endDate,
          goal: currentSprint.goal,
          totalTasks,
          completed: countBy(tasks, task => ['DONE', 'COMPLETED'].includes(task.status)) || seededInt(seed, 8, Math.max(10, Math.round(totalTasks * 0.55)), 22),
          inProgress: countBy(tasks, task => ['IN_PROGRESS', 'EXECUTING', 'AGENT_ASSIGNED'].includes(task.status)) || seededInt(seed, 4, 18, 23),
          blocked: countBy(tasks, task => ['BLOCKED', 'ESCALATED'].includes(task.status)) || seededInt(seed, 1, 6, 24),
          velocity: `${seededInt(seed, 24, 54, 25)} pts`,
          confidence: confidenceFromScore(seededInt(seed, 52, 94, 26))
        },
        list: sprintList
      },
      roadmap: {
        currentMilestone,
        nextMilestone: project.nextMilestone || nextStage?.name || 'Stage progression approval',
        timelineStatus,
        deliveryConfidence,
        deliveryHealth,
        atRiskMilestones: deliveryHealth.includes('Red') ? 3 : deliveryHealth.includes('Amber') ? 1 : 0,
        phases: buildRoadmap(project, seed, completionPercentage),
        featureRoadmap: buildFeatureRoadmap(project, modules, seed)
      },
      milestones: buildMilestones(project, seed, currentMilestone),
      resources: buildResources(project, seed),
      stageGates: buildStageGates(project, seed, completionPercentage),
      dependencies: buildDependencies(project, seed),
      risks: buildRisks(project, seed, blockedStages),
      escalations: buildEscalations(project, seed, blockedStages),
      cost: buildCost(project, seed, deliveryHealth),
      stakeholders: buildStakeholders(project, seed, deliveryHealth),
      health: {
        items: healthItems,
        overallDeliveryConfidence: deliveryHealth
      },
      workflow: {
        currentStage: mapWorkflowStage(currentStage?.name),
        completionPercentage,
        blockedStages,
        nextStage: nextStage?.name || 'Stage progression approval'
      },
      tasks: {
        total: totalTasks,
        inProgress: countBy(tasks, task => ['IN_PROGRESS', 'EXECUTING'].includes(task.status)) || Math.max(3, Math.round(totalTasks * 0.28)),
        completed: countBy(tasks, task => ['DONE', 'COMPLETED'].includes(task.status)) || Math.max(6, Math.round(totalTasks * 0.42)),
        blocked: countBy(tasks, task => ['BLOCKED', 'ESCALATED'].includes(task.status)) || Math.max(1, Math.round(totalTasks * 0.1))
      },
      outputs: {
        pending: Math.max(1, Math.round(totalTasks * 0.18)),
        approved: Math.max(4, Math.round(totalTasks * 0.45)),
        revisions: Math.max(1, Math.round(totalTasks * 0.12)),
        rejected: seededInt(seed, 0, 2, 98)
      },
      approvals: {
        pending: Math.max(1, countBy(stages, stage => stage.status === 'IN_PROGRESS') || 1),
        approved: completedStages || Math.max(3, Math.round((stages.length || 10) * 0.45)),
        rejected: 0,
        clarification: Math.max(1, Math.round(totalTasks * 0.08))
      }
    };
  }

  function hashProject(project) {
    const source = `${project.id || ''}|${project.name || ''}|${project.domain || ''}`;
    return source.split('').reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) >>> 0, 2166136261);
  }

  function seededInt(seed, min, max, salt = 0) {
    const range = Math.max(1, max - min + 1);
    const mixed = (seed + salt * 2654435761) >>> 0;
    const value = (mixed ^ (mixed >>> 16)) * 2246822519;
    return min + (Math.abs(value) % range);
  }

  function pick(seed, items, salt = 0) {
    return items[seededInt(seed, 0, items.length - 1, salt)];
  }

  function addDays(value, days) {
    const date = new Date(value || Date.now());
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  function daysBetween(start, end) {
    if (Number.isNaN(end.getTime())) return 'Not set';
    return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  }

  function projectKind(project) {
    const value = `${project.name || ''} ${project.domain || ''}`.toLowerCase();
    if (value.includes('almora')) return 'almora';
    if (value.includes('health') || value.includes('patient') || value.includes('portal')) return 'healthcare';
    if (value.includes('delivery') || value.includes('workflow') || value.includes('automation')) return 'delivery';
    if (value.includes('commerce') || value.includes('payment') || value.includes('retail')) return 'commerce';
    return 'product';
  }

  function moduleNamePool(project) {
    const kind = projectKind(project);
    if (kind === 'almora') return ['ALMora Intake Hub', 'Merchant Onboarding', 'Policy Rule Engine', 'Collections Workflow', 'Partner Reporting', 'Compliance Console'];
    if (kind === 'healthcare') return ['Patient Identity', 'Appointment Scheduling', 'Telemedicine Room', 'Clinical Notes', 'Billing Review', 'Compliance Reporting'];
    if (kind === 'delivery') return ['Requirement Setup', 'Workflow Automation', 'QA Readiness', 'Deployment Preparation', 'Client Review', 'Go-Live Planning'];
    if (kind === 'commerce') return ['Authentication Module', 'Catalog Management', 'Payment Checkout', 'Order Tracking', 'Inventory Sync', 'Notification System'];
    return ['Authentication Module', 'Dashboard Analytics', 'User Management', 'Notification System', 'Reporting Module', 'Integration Layer'];
  }

  function buildFeatureModules(project, backlog, seed, completion) {
    // Project-specific detail data is deterministic from project identity plus available store data.
    const fromProject = Array.isArray(project.modules) ? project.modules.map(titleCase) : [];
    const fromBacklog = [...new Set((backlog || []).map(item => item.module).filter(Boolean).map(titleCase))];
    const names = [...new Set([...fromProject, ...fromBacklog, ...moduleNamePool(project)])].slice(0, 6);
    const owners = ['Product Owner', 'Delivery Manager', 'Tech Lead', 'QA Lead', 'Business Analyst', 'UX Lead'];
    const storyPointFallback = [13, 21, 8, 5, 3, 5];
    const statuses = ['IN_PROGRESS', 'NOT_STARTED', 'BLOCKED', 'COMPLETED'];
    return names.map((name, index) => {
      const moduleCompletion = clampPercent(completion + seededInt(seed, -22, 24, 30 + index));
      const blockers = seededInt(seed, 0, index === 0 ? 2 : 4, 60 + index);
      const priority = modulePriority(name, index);
      const status = getModuleStatus(moduleCompletion, blockers, priority, statuses[seededInt(seed, 0, statuses.length - 2, 50 + index)]);
      const delayRisk = getModuleDelayRisk(moduleCompletion, blockers, status);
      return {
        name,
        owner: owners[index % owners.length],
        priority,
        status,
        completion: moduleCompletion,
        storyPoints: moduleStoryPoints(name, index, storyPointFallback),
        linkedSprints: buildLinkedSprints(seed, index),
        blockers,
        delayRisk,
        ragStatus: moduleRagStatus(moduleCompletion, blockers, priority, status, delayRisk)
      };
    });
  }

  function getModuleStatus(completion, blockers, priority, fallback) {
    const pct = clampPercent(completion);
    if (blockers >= 2 && priorityLabel(priority) === 'Must Have') return 'BLOCKED';
    if (blockers >= 3) return 'BLOCKED';
    if (pct >= 92) return 'COMPLETED';
    if (pct <= 12 && blockers === 0) return 'NOT_STARTED';
    return fallback === 'BLOCKED' && blockers === 0 ? 'IN_PROGRESS' : fallback;
  }

  function getModuleDelayRisk(completion, blockers, status) {
    if (normalizeStatusTone(status) === 'red' || blockers >= 2) return 'High';
    if (blockers > 0 || completion < 71) return 'Medium';
    return 'Low';
  }

  function modulePriority(name, index) {
    const normalized = String(name || '').toLowerCase();
    if (/authentication module/.test(normalized)) return 'SHOULD_HAVE';
    if (/(^auth$|payment|dashboard$|checkout|identity)/.test(normalized) && !/analytics/.test(normalized)) return 'MUST_HAVE';
    if (/analytics|reporting|notification|inventory|client review/.test(normalized)) return 'COULD_HAVE';
    if (index >= 5 || /deferred|low-value|integration layer|go-live planning/.test(normalized)) return 'DEFERRED';
    return index < 3 ? 'MUST_HAVE' : index === 3 ? 'SHOULD_HAVE' : 'COULD_HAVE';
  }

  function moduleStoryPoints(name, index, fallback) {
    const normalized = String(name || '').toLowerCase();
    if (/auth|identity/.test(normalized)) return 13;
    if (/payment|checkout/.test(normalized)) return 21;
    if (/dashboard/.test(normalized)) return /analytics/.test(normalized) ? 5 : 8;
    return fallback[index] || 3;
  }

  function buildBacklogScheduleHealth(backlog, seed, totalBacklog) {
    if (Array.isArray(backlog) && backlog.length) {
      const offScheduleCount = backlog.filter((item, index) => {
        const status = String(item.scheduleStatus || item.timelineStatus || item.status || '').toLowerCase();
        return status.includes('behind') || status.includes('late') || status.includes('blocked') || status.includes('risk') || (index + seed) % 7 === 0;
      }).length;
      return {
        onScheduleCount: Math.max(0, backlog.length - offScheduleCount),
        offScheduleCount
      };
    }
    const offScheduleCount = seededInt(seed, Math.max(1, Math.round(totalBacklog * 0.08)), Math.max(2, Math.round(totalBacklog * 0.28)), 205);
    return {
      onScheduleCount: Math.max(0, totalBacklog - offScheduleCount),
      offScheduleCount
    };
  }

  function buildLinkedSprints(seed, index) {
    const first = Math.min(4, index + 1);
    const count = seededInt(seed, 2, index % 3 === 0 ? 3 : 2, 170 + index);
    return [...new Set(Array.from({ length: count }, (_, offset) => `Sprint ${Math.min(5, first + offset)}`))];
  }

  function moduleRagStatus(completion, blockers, priority, status, delayRisk) {
    return getProgressHealthTone(completion, status, blockers, delayRisk || getModuleDelayRisk(completion, blockers, status), priority);
  }

  function buildSprints(project, seed, completion) {
    const start = project.createdAt || project.created_at || Date.now();
    const names = [
      'Sprint 1: Requirement Stabilization',
      'Sprint 2: Backlog & Design',
      'Sprint 3: Build & Integration',
      'Sprint 4: QA & UAT',
      'Sprint 5: Release Readiness'
    ];
    return names.map((name, index) => {
      const sprintCompletion = clampPercent(completion + 36 - index * 18 + seededInt(seed, -8, 10, 80 + index));
      return {
        name,
        startDate: addDays(start, index * 14),
        endDate: addDays(start, index * 14 + 13),
        status: sprintCompletion > 96 ? 'COMPLETED' : sprintCompletion > 20 && sprintCompletion < 96 ? 'IN_PROGRESS' : 'PENDING',
        completion: sprintCompletion,
        delayRisk: sprintCompletion < 25 ? 'Medium' : sprintCompletion < 70 ? 'Medium' : 'Low',
        blocked: 0,
        goal: sprintGoal(project, index)
      };
    });
  }

  function sprintGoal(project, index) {
    const goals = projectKind(project) === 'delivery'
      ? ['Stabilize intake scope', 'Confirm automated backlog rules', 'Build delivery workflow', 'Validate QA entry path', 'Prepare client go-live']
      : ['Stabilize requirements', 'Approve backlog and designs', 'Build core modules', 'Complete QA and UAT readiness', 'Confirm release plan'];
    return goals[index] || goals[0];
  }

  function buildRoadmap(project, seed, completion) {
    const start = project.createdAt || project.created_at || Date.now();
    const phases = ['Discovery', 'Requirement Review', 'Backlog Generation', 'Sprint Planning', 'Development', 'QA / UAT', 'Release Readiness', 'Go Live'];
    const developmentIndex = phases.indexOf('Development');
    return phases.map((name, index) => {
      const phaseCompletion = clampPercent(completion + 42 - index * 13 + seededInt(seed, -5, 7, 90 + index));
      const isThroughDevelopment = index <= developmentIndex;
      return {
        name,
        plannedDate: addDays(start, index * 12),
        forecastDate: addDays(start, index * 12 + seededInt(seed, -2, 6, 100 + index)),
        status: isThroughDevelopment ? 'IN_PROGRESS' : 'NOT_STARTED',
        delayRisk: phaseCompletion < 35 ? 'High' : phaseCompletion < 70 ? 'Medium' : 'Low',
        completion: isThroughDevelopment ? Math.max(18, phaseCompletion) : Math.min(10, phaseCompletion)
      };
    });
  }

  function buildFeatureRoadmap(project, modules, seed) {
    if (!Array.isArray(modules) || !modules.length) return [];
    const start = project.createdAt || project.created_at || Date.now();
    return modules.slice(0, 6).map((module, index) => {
      const startOffset = index * 24 + seededInt(seed, -4, 8, 215 + index);
      const duration = seededInt(seed, 44, 82, 230 + index);
      const progress = clampPercent(module.completion);
      return {
        name: module.name,
        startDate: addDays(start, startOffset),
        endDate: addDays(start, startOffset + duration),
        status: featureRoadmapStatus(module.status, module.ragStatus, progress),
        progress,
        health: module.ragStatus,
        delayRisk: module.delayRisk,
        blockers: module.blockers,
        owner: module.owner,
        dependency: module.linkedSprints?.[0] || ''
      };
    });
  }

  function featureRoadmapStatus(status, ragStatus, progress) {
    const normalized = String(status || '').toLowerCase();
    if (normalized.includes('completed') || progress >= 96) return 'Completed';
    if (String(ragStatus || '').toLowerCase().includes('red') || normalized.includes('blocked')) return 'At Risk';
    if (progress > 18 || normalized.includes('progress') || normalized.includes('approved')) return 'In Progress';
    return 'Not Started';
  }

  function buildMilestones(project, seed) {
    const start = project.createdAt || project.created_at || Date.now();
    const names = ['Requirements Sign-off', 'Backlog Approval', 'Sprint Planning Completed', 'MVP Feature Complete', 'QA Entry', 'UAT Sign-off', 'Production Release'];
    const owners = ['Product Owner', 'Delivery Manager', 'Scrum Master', 'Tech Lead', 'QA Lead', 'Client Sponsor', 'Release Manager'];
    return names.map((name, index) => ({
      name,
      owner: owners[index % owners.length],
      dueDate: addDays(start, 10 + index * 12),
      status: pick(seed, ['APPROVED', 'IN_PROGRESS', 'PENDING', 'BLOCKED'], 110 + index),
      health: pick(seed, ['Green / Healthy', 'Amber / Watch', 'Red / At Risk'], 120 + index),
      dependency: pick(seed, ['Stakeholder decision', 'API readiness', 'QA environment', 'Resource capacity', 'No active dependency'], 130 + index),
      approvalRequired: index < 2 || index > 4 ? 'Yes' : 'No'
    }));
  }

  function buildResources(project, seed) {
    const agentTemplates = [
      ['Requirement Intake Agent', 'Intake Automation', 'Requirement capture and normalization', 'Requirement Intake'],
      ['Backlog Generation Agent', 'Backlog Automation', 'Story generation and acceptance criteria', 'Backlog Generation'],
      ['Prioritization Agent', 'Planning Intelligence', 'MoSCoW and value sequencing', 'Prioritization'],
      ['Sprint Planning Agent', 'Sprint Automation', 'Sprint scope and capacity planning', 'Sprint Planning'],
      ['Roadmap Agent', 'Roadmap Intelligence', 'Timeline and milestone forecasting', 'Roadmap'],
      ['QA Validation Agent', 'Quality Automation', 'Readiness and validation signal review', 'QA / UAT'],
      ['Dependency Analysis Agent', 'Dependency Intelligence', 'Cross-team dependency mapping', 'Dependency Mapping'],
      ['Escalation Monitoring Agent', 'Governance Automation', 'Escalation SLA and risk monitoring', 'Escalation Roadmap'],
      ['Cost Tracking Agent', 'Budget Intelligence', 'Budget utilization and forecast tracking', 'Cost & Budget'],
      ['Stakeholder Update Agent', 'Communication Automation', 'Stakeholder updates and decision tracking', 'Stakeholder Communication']
    ];
    const agents = agentTemplates.map(([name, type, responsibilityArea, workflowStage], index) => {
      const utilization = seededInt(seed, 28, 98, 150 + index);
      return {
        name,
        type,
        responsibilityArea,
        utilization,
        currentLoad: utilization > 85 ? 'High automation load' : utilization > 58 ? 'Balanced automation load' : 'Available capacity',
        status: utilization > 92 ? 'BLOCKED' : utilization > 42 ? 'ACTIVE' : 'IDLE',
        health: utilization > 92 ? 'Red / At Risk' : utilization > 78 ? 'Amber / Watch' : 'Green / Healthy',
        workflowStage
      };
    });
    const activeAgents = agents.filter(agent => agent.status !== 'IDLE').length;
    const highUtilizationAgents = agents.filter(agent => agent.utilization > 78).length;
    const blockedAgents = agents.filter(agent => agent.status === 'BLOCKED').length;
    const avgEfficiency = Math.round(agents.reduce((sum, agent) => sum + (100 - Math.abs(70 - agent.utilization)), 0) / agents.length);
    return {
      summary: {
        totalActiveAgents: activeAgents,
        availableAgents: agents.filter(agent => agent.status === 'IDLE').length,
        highUtilizationAgents,
        blockedAgents,
        automationCoverage: seededInt(seed, 74, 98, 190),
        agentEfficiency: clampPercent(avgEfficiency),
        workflowStagesCovered: new Set(agents.map(agent => agent.workflowStage)).size,
        monitoringAgents: agents.filter(agent => /Monitoring|Tracking|Analysis/.test(agent.name)).length
      },
      agents
    };
  }

  function buildStageGates(project, seed, completion) {
    const start = project.createdAt || project.created_at || Date.now();
    const gates = ['Requirement Review Gate', 'Backlog Approval Gate', 'Design Readiness Gate', 'Sprint Commitment Gate', 'QA Entry Gate', 'UAT Sign-off Gate', 'Release Approval Gate'];
    const approvers = ['Product Owner', 'Delivery Manager', 'Design Lead', 'Scrum Master', 'QA Lead', 'Client Sponsor', 'Executive Sponsor'];
    return gates.map((name, index) => ({
      name,
      status: completion > (index + 1) * 13 ? 'APPROVED' : pick(seed, ['PENDING', 'BLOCKED', 'REWORK'], 200 + index),
      approver: approvers[index],
      decisionDate: completion > (index + 1) * 13 ? addDays(project.createdAt || project.created_at || Date.now(), 6 + index * 10) : null,
      comments: pick(seed, ['Evidence complete', 'Needs stakeholder confirmation', 'Pending dependency closure', 'Rework comments shared'], 210 + index),
      nextAction: pick(seed, ['Proceed to next gate', 'Collect sign-off', 'Close blocker', 'Refresh delivery evidence'], 220 + index)
    }));
  }

  function buildDependencies(project, seed) {
    const names = projectKind(project) === 'healthcare'
      ? ['FHIR API contract', 'Clinic UAT roster', 'Identity provider approval', 'Billing vendor test window', 'HIPAA review evidence']
      : ['API dependency delay', 'Client content approval', 'QA environment readiness', 'Release window confirmation', 'Data migration sample'];
    const items = names.map((name, index) => ({
      name,
      type: pick(seed, ['Internal', 'External', 'Technical', 'Business', 'Client'], 230 + index),
      owner: pick(seed, ['Tech Lead', 'Client Sponsor', 'Delivery Manager', 'QA Lead', 'Business Analyst'], 240 + index),
      impact: pick(seed, ['Schedule', 'Scope', 'Quality', 'Budget'], 250 + index),
      dueDate: addDays(project.createdAt || project.created_at || Date.now(), 18 + index * 9),
      status: pick(seed, ['PENDING', 'IN_PROGRESS', 'APPROVED', 'BLOCKED'], 260 + index),
      linkedMilestone: pick(seed, ['Backlog Approval', 'MVP Feature Complete', 'QA Entry', 'UAT Sign-off', 'Production Release'], 270 + index),
      riskLevel: pick(seed, ['Green / Healthy', 'Amber / Watch', 'Red / At Risk'], 280 + index)
    }));
    return {
      summary: {
        internal: items.filter(item => item.type === 'Internal').length,
        external: items.filter(item => item.type === 'External').length,
        technical: items.filter(item => item.type === 'Technical').length,
        business: items.filter(item => item.type === 'Business').length,
        client: items.filter(item => item.type === 'Client').length
      },
      items
    };
  }

  function buildRisks(project, seed, blockedStages) {
    const names = ['Requirement ambiguity', 'Delayed stakeholder approval', 'API dependency delay', 'QA environment not ready', 'Scope creep', 'Resource overload'];
    const items = names.map((name, index) => ({
      name,
      category: pick(seed, ['Scope', 'Schedule', 'Technical', 'Quality', 'Resource'], 290 + index),
      severity: pick(seed, ['Green / Healthy', 'Amber / Watch', 'Red / At Risk'], 300 + index),
      probability: pick(seed, ['Low', 'Medium', 'High'], 310 + index),
      impact: pick(seed, ['Low', 'Medium', 'High', 'Critical'], 320 + index),
      owner: pick(seed, ['Product Owner', 'Delivery Manager', 'Tech Lead', 'QA Lead'], 330 + index),
      mitigation: pick(seed, ['Clarify acceptance criteria', 'Escalate decision forum', 'Create contingency plan', 'Rebalance sprint scope'], 340 + index),
      status: pick(seed, ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'BLOCKED'], 350 + index)
    }));
    return {
      summary: {
        high: items.filter(item => item.severity.includes('Red')).length + blockedStages,
        medium: items.filter(item => item.severity.includes('Amber')).length,
        low: items.filter(item => item.severity.includes('Green')).length,
        openIssues: items.filter(item => item.status !== 'RESOLVED').length,
        resolvedIssues: items.filter(item => item.status === 'RESOLVED').length,
        blockers: items.filter(item => item.status === 'BLOCKED').length + blockedStages
      },
      items
    };
  }

  function buildEscalations(project, seed, blockedStages) {
    const items = ['Scope decision overdue', 'API contract variance', 'QA entry readiness', 'Budget variance watch'].map((topic, index) => ({
      topic,
      trigger: pick(seed, ['SLA exceeded', 'Gate blocked', 'Risk score increased', 'Client decision pending'], 360 + index),
      currentLevel: `Level ${seededInt(seed, 1, 5, 370 + index)}`,
      owner: pick(seed, ['Product Owner', 'Delivery Manager', 'PMO', 'Executive Sponsor'], 380 + index),
      sla: `${seededInt(seed, 8, 48, 390 + index)} hrs`,
      status: pick(seed, ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'], 400 + index),
      nextEscalationDate: addDays(Date.now(), seededInt(seed, 0, 14, 410 + index)),
      resolutionPlan: pick(seed, ['Confirm decision owner', 'Run technical review', 'Publish recovery plan', 'Close governance action'], 420 + index)
    }));
    return {
      summary: {
        active: items.filter(item => item.status !== 'RESOLVED').length + blockedStages,
        dueToday: items.filter(item => daysBetween(new Date(), new Date(item.nextEscalationDate)) === 0).length,
        slaBreaches: seededInt(seed, 0, 2, 430),
        resolved: items.filter(item => item.status === 'RESOLVED').length,
        executiveAttention: items.filter(item => item.currentLevel === 'Level 4' || item.currentLevel === 'Level 5').length
      },
      items
    };
  }

  function buildCost(project, seed, health) {
    const approvedBudget = seededInt(seed, 180, 780, 440) * 1000;
    const actualCost = Math.round(approvedBudget * seededInt(seed, 28, 78, 441) / 100);
    const forecastCost = Math.round(approvedBudget * seededInt(seed, health.includes('Red') ? 104 : 86, health.includes('Red') ? 122 : 104, 442) / 100);
    const breakdownLabels = ['Product Management Cost', 'Engineering Cost', 'QA Cost', 'DevOps Cost', 'Design Cost', 'Vendor / External Cost', 'Contingency'];
    const breakdown = breakdownLabels.map((label, index) => ({
      label,
      value: Math.round(forecastCost * seededInt(seed, 6, index === 1 ? 34 : 18, 450 + index) / 100)
    }));
    return {
      approvedBudget,
      actualCost,
      forecastCost,
      budgetUtilization: clampPercent((actualCost / approvedBudget) * 100),
      costVariance: forecastCost - approvedBudget,
      burnRate: seededInt(seed, 16, 74, 460) * 1000,
      estimatedCompletionCost: forecastCost,
      costRisk: health.includes('Red') ? 'Red / At Risk' : forecastCost > approvedBudget ? 'Amber / Watch' : 'Green / Healthy',
      breakdown
    };
  }

  function buildStakeholders(project, seed, health) {
    const items = [
      ['Avery Johnson', 'Executive Sponsor'],
      ['Leah Morris', 'Client Product Lead'],
      ['Victor Rao', 'Compliance Reviewer'],
      ['Iris Kim', 'Operations Lead'],
      ['Noah Wilson', 'Finance Partner']
    ].map(([name, role], index) => ({
      name,
      role,
      frequency: pick(seed, ['Weekly', 'Bi-weekly', 'Monthly', 'On Demand'], 470 + index),
      lastContacted: addDays(Date.now(), -seededInt(seed, 1, 16, 480 + index)),
      pendingDecision: pick(seed, ['None', 'Scope confirmation', 'Budget approval', 'UAT roster', 'Release date'], 490 + index),
      sentiment: pick(seed, ['Green / Healthy', 'Amber / Watch', 'Red / At Risk'], 500 + index)
    }));
    return {
      summary: {
        lastClientUpdate: addDays(Date.now(), -seededInt(seed, 1, 8, 510)),
        nextSteeringMeeting: addDays(Date.now(), seededInt(seed, 3, 18, 511)),
        pendingDecisions: items.filter(item => item.pendingDecision !== 'None').length,
        openQuestions: seededInt(seed, 1, 7, 512),
        communicationHealth: health.includes('Red') ? 'Amber / Watch' : 'Green / Healthy'
      },
      items
    };
  }

  function buildHealthItems(project, seed, completion, deliveryHealth) {
    const labels = ['Scope Health', 'Schedule Health', 'Budget Health', 'Resource Health', 'Quality Health', 'Dependency Health', 'Stakeholder Health'];
    return labels.map((label, index) => {
      const score = clampPercent(completion + seededInt(seed, -18, 18, 520 + index));
      return {
        label,
        score,
        status: score < 46 ? 'Red / At Risk' : score < 72 ? 'Amber / Watch' : 'Green / Healthy'
      };
    }).concat([{ label: 'Overall Delivery Confidence', score: completion, status: deliveryHealth }]);
  }

  function confidenceFromScore(score) {
    if (score < 48) return 'Low';
    if (score < 74) return 'Medium';
    return 'High';
  }

  function currency(value) {
    const amount = Number(value) || 0;
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  }

  function mapWorkflowStage(name) {
    const value = String(name || '').toLowerCase();
    if (value.includes('backlog') && value.includes('approval')) return 'Backlog Approval';
    if (value.includes('backlog')) return 'Backlog Generation';
    if (value.includes('moscow') || value.includes('priorit')) return 'Feature Prioritization';
    if (value.includes('task')) return 'Task Planning';
    if (value.includes('final') || value.includes('stage')) return 'Stage Approval';
    if (value.includes('tracking') || value.includes('delivery')) return 'Delivery Tracking';
    return 'Requirement Review';
  }

  function countBy(items, predicate) {
    return (items || []).filter(predicate).length;
  }

  function countPriority(items, priority) {
    return countBy(items, item => item.priority === priority);
  }

  function fallbackNumber(project, base, spread) {
    const source = String(project.id || project.name || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return base + (source % spread);
  }

  function teamSummary(project, tenantUsers) {
    const assignments = NexusRoleUtils.getProjectAssignments(project);
    const names = assignments
      .map(assignment => tenantUsers.find(user => user.id === assignment.userId || user.email === assignment.email)?.name)
      .filter(Boolean)
      .slice(0, 2);
    return `<span>${assignments.length} member${assignments.length === 1 ? '' : 's'}</span>${names.length ? `<div class="pd-muted">${escapeHtml(names.join(', '))}</div>` : ''}`;
  }

  function getDeliveryDate(project) {
    if (project.deliveryDate || project.delivery_date || project.endDate) return project.deliveryDate || project.delivery_date || project.endDate;
    const start = new Date(project.createdAt || project.created_at || Date.now());
    start.setDate(start.getDate() + 90);
    return start.toISOString();
  }

  function getCrossRoleBlocker(project, role) {
    if (project.status === 'BLOCKED') return 'Requirement clarification';
    const options = ProductDeliveryDashboardData.blockerOptions;
    const idx = fallbackNumber(project, String(role || '').length, options.length) % options.length;
    return options[idx];
  }

  function enrichCrossDetail(project, value, index) {
    const status = titleCase(project.status || 'Active');
    if (index === 0) return `${value}. Current status: ${status}.`;
    if (index === 1) return `${value}. Blocker: ${getCrossRoleBlocker(project, '')}.`;
    return value;
  }

  function formatDate(value) {
    if (!value) return 'Not set';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function titleCase(value) {
    return String(value || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function filterDashboard(value) {
    const query = String(value || '').trim().toLowerCase();
    document.querySelectorAll('.pd-project-tile, .pd-risk-list article, .pd-agent-card').forEach(card => {
      const matches = !query || card.textContent.toLowerCase().includes(query);
      card.style.display = matches ? '' : 'none';
    });
  }

  function toggleProductDetails(projectId) {
    state.expandedProductProjectId = state.expandedProductProjectId === projectId ? null : projectId;
    state.roadmapPage = 0;
    render();
    if (state.expandedProductProjectId) {
      requestAnimationFrame(() => document.querySelector('.pd-command-center-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }

  function toggleDetailSection(sectionKey, currentlyOpen) {
    state.openDetailSections[sectionKey] = !currentlyOpen;
    render();
  }

  function toggleEscalationRow(rowKey) {
    state.expandedEscalationRows[rowKey] = !state.expandedEscalationRows[rowKey];
    render();
  }

  function setRoadmapFilter(filter) {
    state.roadmapFilter = filter;
    state.roadmapPage = 0;
    render();
  }

  function moveRoadmapCarousel(delta) {
    const detail = state.expandedProductProjectId
      ? buildProductDeliveryDetail(NexusStore.getProjects().find(project => project.id === state.expandedProductProjectId))
      : null;
    const filtered = detail ? filteredRoadmapPhases(detail.roadmap.phases) : [];
    const maxIndex = Math.max(0, filtered.length - roadmapVisibleCount());
    state.roadmapPage = Math.max(0, Math.min(maxIndex, state.roadmapPage + Number(delta || 0)));
    render();
  }

  function toggleCrossDetails(projectId) {
    state.expandedCrossProjectId = state.expandedCrossProjectId === projectId ? null : projectId;
    render();
    if (state.expandedCrossProjectId) requestAnimationFrame(() => document.getElementById('cross-role-projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  return {
    init,
    scrollToSection,
    filterDashboard,
    toggleProductDetails,
    toggleCrossDetails,
    toggleDetailSection,
    toggleEscalationRow,
    setRoadmapFilter,
    moveRoadmapCarousel
  };
})();
if (typeof window !== 'undefined') window.ProductDeliveryDashboard = ProductDeliveryDashboard;

document.addEventListener('DOMContentLoaded', ProductDeliveryDashboard.init);
