const ProductDeliveryDashboard = (() => {
  /* ===== STATE ===== */
  const state = {
    selectedProjectId: null,
    selectedProject: null,
    isProjectDetailView: false,
    expandedProductProjectId: null,
    expandedCrossProjectId: null
  };

  /* ===== HELPERS ===== */
  function safeValue(value, fallback = 0) { return value ?? fallback; }
  function safeText(value, fallback = 'No data available') { return value ?? fallback; }
  function clampPercent(value) { const n = Number(value) || 0; return Math.max(0, Math.min(100, Math.round(n))); }
  function titleCase(value) { return String(value || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
  function formatDate(value) {
    if (!value) return 'Not set';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /* ===== INIT ===== */
  function init() {
    seedNexusData();
    createNavigation('product-delivery-dashboard');
    window.addEventListener('nexus:selected-project-changed', () => {
      if (!state.isProjectDetailView) {
        syncSelectedProject();
      }
      render();
    });
    syncSelectedProject();
    render();
  }

  function syncSelectedProject() {
    const pdProjects = ProductDeliveryDashboardData.productDeliveryProjects;
    if (!state.selectedProjectId && pdProjects.length) {
      state.selectedProjectId = pdProjects[0].id;
      state.selectedProject = pdProjects[0];
    }
    if (state.selectedProjectId) {
      state.selectedProject = ProductDeliveryDashboardData.getProjectById(state.selectedProjectId) || pdProjects[0] || null;
      if (state.selectedProject) state.selectedProjectId = state.selectedProject.id;
    }
  }

  /* ===== RENDER ROOT ===== */
  function render() {
    const model = getDashboardModel();
    const root = document.getElementById('productDeliveryDashboardRoot');
    if (!root) return;

    if (model.selectedProjectRole !== 'PRODUCT_DELIVERY') {
      root.innerHTML = roleMismatchState(model);
      createProjectSelector('pdProjectSelector');
      return;
    }

    if (state.isProjectDetailView && state.selectedProject) {
      root.innerHTML = renderProjectDetailView(state.selectedProject, model);
    } else {
      root.innerHTML = renderMainDashboard(model);
    }
    createProjectSelector('pdProjectSelector');
    updateSidebarRole();
  }

  /* ===== MAIN DASHBOARD ===== */
  function renderMainDashboard(model) {
    const proj = state.selectedProject;
    const stats = proj?.stats || {};
    const overview = proj?.overview || {};

    return `
      <div class="page-header pd-page-header">
        <div>
          <h1 class="page-title">Product &amp; Delivery Dashboard</h1>
          <p class="page-subtitle">Structured project execution and aligned delivery.</p>
        </div>
        <div class="page-actions" style="display:flex;gap:10px;align-items:center">
          <div id="pdProjectSelector"></div>
          ${renderPdProjectDropdown()}
        </div>
      </div>

      ${!model.assignedProjects.length && !ProductDeliveryDashboardData.productDeliveryProjects.length ? noAssignedProjects() : `
        ${renderSummaryCards(proj, model)}

        <section class="pd-section" id="project-involvement">
          <div class="pd-section-header">
            <div>
              <h2>Project Involvement</h2>
              <p>Complete project involvement for the logged-in user${proj ? ` — ${escapeHtml(proj.name)}` : ''}.</p>
            </div>
          </div>
          <div class="pd-flow-card">
            <span>Review Requirements</span>
            <span>Generate / Approve Backlog</span>
            <span>Prioritize Features</span>
            <span>Monitor Workflow Stages</span>
            <span>Review Agent Outputs</span>
            <span>Approve Stage Progression</span>
          </div>
        </section>

        <section class="pd-section" id="delivery-flow-insights">
          <div class="pd-section-header">
            <div>
              <h2>Delivery Flow Insights${proj ? ` — ${escapeHtml(proj.name)}` : ''}</h2>
              <p>${proj?.deliveryFlowInsights?.summary || 'Requirement intake, backlog health, workflow progress, agent reviews, and roadmap visibility.'}</p>
            </div>
          </div>
          ${proj ? renderProjectInsightHighlights(proj) : ''}
          ${renderDeliveryFlowInsights(proj)}
        </section>

        <section class="pd-section" id="product-delivery-projects">
          <div class="pd-section-header">
            <div>
              <h2>Product &amp; Delivery Projects</h2>
              <p>Projects where you are responsible for requirement intake, planning boards, task tracking, roadmap visibility, backlog approvals, and stage progression.</p>
            </div>
          </div>
          ${renderProductDeliveryTable(model)}
        </section>

        <section class="pd-section" id="cross-role-projects">
          <div class="pd-section-header">
            <div>
              <h2>Cross-Role Projects</h2>
              <p>Projects where you are involved in a role other than Product &amp; Delivery.</p>
            </div>
          </div>
          ${renderCrossRoleTable(model.crossRoleProjects, model)}
        </section>
      `}
    `;
  }

  /* ===== PD PROJECT DROPDOWN ===== */
  function renderPdProjectDropdown() {
    const projects = ProductDeliveryDashboardData.productDeliveryProjects;
    if (projects.length <= 1) return '';
    return `
      <select class="pd-project-select" onchange="ProductDeliveryDashboard.handleProjectChange(this.value)" aria-label="Select product delivery project">
        ${projects.map(p => `<option value="${p.id}" ${p.id === state.selectedProjectId ? 'selected' : ''}>${escapeHtml(p.name)} (${escapeHtml(p.status.toUpperCase())})</option>`).join('')}
      </select>
    `;
  }

  /* ===== SUMMARY CARDS (project-specific) ===== */
  function renderSummaryCards(proj, model) {
    const stats = proj?.stats || {};
    const overview = proj?.overview || {};
    const backlog = stats.backlogApproval || {};
    const tasks = stats.taskTracking || {};
    const escalations = stats.escalationsSummary || {};
    const wf = stats.workflowStage || {};

    const totalProjects = ProductDeliveryDashboardData.productDeliveryProjects.length;
    const crossRoleCount = model.crossRoleProjects?.length || 0;
    const wfCompletion = wf.stages ? clampPercent((wf.stages.filter(s => s.status === 'done').length / Math.max(wf.stages.length, 1)) * 100) : 0;

    return `
      <div class="pd-summary-grid" aria-label="Product and Delivery dashboard navigation">
        ${summaryCard('Total Projects', totalProjects, 'All product & delivery projects', `${totalProjects} delivery, ${crossRoleCount} cross-role`, wfCompletion, 'project-involvement')}
        ${summaryCard('Approvals Pending', safeValue(backlog.pendingApproval), 'Backlog items awaiting approval', `${safeValue(escalations.totalEscalations)} escalation${safeValue(escalations.totalEscalations) === 1 ? '' : 's'}`, clampPercent(safeValue(backlog.approved) / Math.max(safeValue(backlog.generated), 1) * 100), 'delivery-flow-insights')}
        ${summaryCard('Tasks Overview', safeValue(tasks.totalTasks), `${safeValue(tasks.inProgress)} in progress, ${safeValue(tasks.blocked)} blocked`, `${safeValue(tasks.completed)} completed`, clampPercent(safeValue(tasks.completed) / Math.max(safeValue(tasks.totalTasks), 1) * 100), 'delivery-flow-insights')}
      </div>
    `;
  }

  function summaryCard(title, value, description, stat, progress, targetId) {
    return `
      <button class="pd-summary-card" type="button" onclick="ProductDeliveryDashboard.scrollToSection('${targetId}')">
        <span class="pd-summary-label">${escapeHtml(title)}</span>
        <strong>${safeValue(value)}</strong>
        <span class="pd-summary-subtitle">${escapeHtml(description)}</span>
        <span class="pd-summary-stat">${escapeHtml(stat)}</span>
        <span class="pd-card-meter"><i style="width:${clampPercent(progress)}%"></i></span>
      </button>
    `;
  }

  /* ===== PROJECT INSIGHT HIGHLIGHTS ===== */
  function renderProjectInsightHighlights(proj) {
    const insights = proj.deliveryFlowInsights;
    if (!insights?.keyHighlights?.length) return '';
    const stats = proj.stats || {};
    const esc = stats.escalationsSummary || {};
    const tasks = stats.taskTracking || {};
    const road = stats.roadmapHealth || {};

    const badges = [];
    if (safeValue(esc.critical) > 0) badges.push({ label: `${esc.critical} Critical Escalation${esc.critical > 1 ? 's' : ''}`, tone: 'danger' });
    if (safeValue(tasks.blocked) > 0) badges.push({ label: `${tasks.blocked} Blocked Task${tasks.blocked > 1 ? 's' : ''}`, tone: 'danger' });
    if (safeValue(road.atRiskMilestones) > 0) badges.push({ label: `${road.atRiskMilestones} At-Risk Milestone${road.atRiskMilestones > 1 ? 's' : ''}`, tone: 'warning' });
    if (safeValue(stats.backlogApproval?.pendingApproval) > 0) badges.push({ label: `${stats.backlogApproval.pendingApproval} Pending Approvals`, tone: 'warning' });

    return `
      <div class="pd-insights-highlight-card">
        <div class="pd-insights-badges">
          ${badges.map(b => `<span class="pd-badge pd-badge-${b.tone}">${escapeHtml(b.label)}</span>`).join('')}
        </div>
        <ul class="pd-insights-list">
          ${insights.keyHighlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  /* ===== DELIVERY FLOW INSIGHTS (project-specific) ===== */
  function renderDeliveryFlowInsights(proj) {
    if (!proj) return '<div class="pd-empty-state"><p>Select a project to view delivery flow insights.</p></div>';
    const s = proj.stats;
    return `
      <div class="pd-insights-grid">
        ${renderRequirementFunnel(s.requirementIntake)}
        ${renderBacklogStatus(s.backlogApproval)}
        ${renderPriorityMix(s.featurePriority)}
        ${renderWorkflowStepper(s.workflowStage)}
        ${renderAgentOutputStatus(s.agentOutputReview)}
        ${renderRoadmapHealth(s.roadmapHealth)}
        ${renderTaskTracking(s.taskTracking)}
      </div>
    `;
  }

  function renderRequirementFunnel(req) {
    if (!req) return '';
    const total = Math.max(safeValue(req.totalRequirements), 1);
    const rows = [
      ['Total Requirements', safeValue(req.totalRequirements)],
      ['Pending Review', safeValue(req.pendingReview)],
      ['Needs Clarification', safeValue(req.needsClarification)],
      ['Ready for Backlog', safeValue(req.readyForBacklog)],
      ['Converted to Backlog', safeValue(req.convertedToBacklog)]
    ];
    return chartCard('Requirement Intake Funnel', 'Review Requirements', rows.map(([label, value]) => `
      <div class="pd-funnel-row">
        <span>${escapeHtml(label)}</span>
        <strong>${value}</strong>
        <i><b style="width:${clampPercent((value / total) * 100)}%"></b></i>
      </div>
    `).join(''));
  }

  function renderBacklogStatus(bl) {
    if (!bl) return '';
    const data = [
      ['Generated', safeValue(bl.generated), 'info'],
      ['Pending Approval', safeValue(bl.pendingApproval), 'warning'],
      ['Approved', safeValue(bl.approved), 'success'],
      ['Returned', safeValue(bl.returned), 'orange'],
      ['Rejected', safeValue(bl.rejected), 'danger']
    ];
    const total = Math.max(data.reduce((s, i) => s + i[1], 0), 1);
    return chartCard('Backlog Approval Status', 'Generate / Approve Backlog', `
      <div class="pd-segment-bar">${data.map(([, v, t]) => `<span class="pd-tone-${t}" style="width:${clampPercent((v / total) * 100)}%"></span>`).join('')}</div>
      <div class="pd-legend-grid">${data.map(([l, v, t]) => `<span><i class="pd-dot pd-tone-${t}"></i>${escapeHtml(l)} <strong>${v}</strong></span>`).join('')}</div>
    `);
  }

  function renderPriorityMix(fp) {
    if (!fp) return '';
    const data = [
      ['Must Have', safeValue(fp.mustHave)],
      ['Should Have', safeValue(fp.shouldHave)],
      ['Could Have', safeValue(fp.couldHave)],
      ['Deferred', safeValue(fp.deferred)]
    ];
    const max = Math.max(...data.map(i => i[1]), 1);
    return chartCard('Feature Priority Mix', 'Prioritize Features', `
      <div class="pd-bar-chart">${data.map(([l, v]) => `
        <div class="pd-bar-item">
          <span>${escapeHtml(l)}</span>
          <i><b style="height:${clampPercent((v / max) * 100)}%"></b></i>
          <strong>${v}</strong>
        </div>
      `).join('')}</div>
    `);
  }

  function renderWorkflowStepper(wf) {
    if (!wf) return '';
    const stages = wf.stages || [
      { name: 'Requirement Review', status: 'upcoming' },
      { name: 'Backlog Generation', status: 'upcoming' },
      { name: 'Backlog Approval', status: 'upcoming' },
      { name: 'Feature Prioritization', status: 'upcoming' },
      { name: 'Task Planning', status: 'upcoming' },
      { name: 'Delivery Tracking', status: 'upcoming' },
      { name: 'Stage Approval', status: 'upcoming' }
    ];
    return chartCard('Workflow Stage Progress', 'Monitor Workflow Stages', `
      <div class="pd-stepper">${stages.map(s => {
        const status = s.status === 'done' ? 'done' : s.status === 'active' ? 'active' : s.status === 'blocked' ? 'blocked' : 'next';
        return `<div class="pd-step ${status}"><i></i><span>${escapeHtml(s.name)}</span></div>`;
      }).join('')}</div>
      <div class="pd-chart-foot">Current: <strong>${escapeHtml(safeText(wf.currentStage, 'N/A'))}</strong> &nbsp;|&nbsp; Next: <strong>${escapeHtml(safeText(wf.nextStage, 'N/A'))}</strong></div>
    `, 'pd-chart-card-wide');
  }

  function renderAgentOutputStatus(ao) {
    if (!ao) return '';
    const data = [
      ['Pending Review', safeValue(ao.pendingReview)],
      ['Approved', safeValue(ao.approved)],
      ['Revision Requested', safeValue(ao.revisionRequested)],
      ['Rejected', safeValue(ao.rejected)]
    ];
    return chartCard('Agent Output Review Status', 'Review Agent Outputs', `<div class="pd-mini-stat-grid">${data.map(([l, v]) => `<div><strong>${v}</strong><span>${escapeHtml(l)}</span></div>`).join('')}</div>`);
  }

  function renderRoadmapHealth(rh) {
    if (!rh) return '';
    return chartCard('Roadmap Health', 'Roadmap Visibility', `
      <div class="pd-roadmap-card">
        <div><span>Current milestone</span><strong>${escapeHtml(safeText(rh.currentMilestone))}</strong></div>
        <div><span>Next milestone</span><strong>${escapeHtml(safeText(rh.nextMilestone))}</strong></div>
        <div class="pd-roadmap-row"><span>Timeline status</span>${deliveryHealthBadge(rh.timelineStatus)}</div>
        <div class="pd-roadmap-row"><span>Delivery confidence</span>${confidenceBadge(rh.deliveryConfidence)}</div>
        <div class="pd-roadmap-row"><span>At-risk milestones</span><strong>${safeValue(rh.atRiskMilestones)}</strong></div>
      </div>
    `);
  }

  function renderTaskTracking(tt) {
    if (!tt) return '';
    const data = [
      ['In Progress', safeValue(tt.inProgress), 'info'],
      ['Completed', safeValue(tt.completed), 'success'],
      ['Blocked', safeValue(tt.blocked), 'danger']
    ];
    const total = Math.max(safeValue(tt.totalTasks), 1);
    return chartCard('Task Tracking Snapshot', 'Task Tracking', `
      <div class="pd-task-total"><strong>${safeValue(tt.totalTasks)}</strong><span>Total Tasks</span></div>
      <div class="pd-segment-bar">${data.map(([, v, t]) => `<span class="pd-tone-${t}" style="width:${clampPercent((v / total) * 100)}%"></span>`).join('')}</div>
      <div class="pd-legend-grid">${data.map(([l, v, t]) => `<span><i class="pd-dot pd-tone-${t}"></i>${escapeHtml(l)} <strong>${v}</strong></span>`).join('')}</div>
    `);
  }

  function chartCard(title, subtitle, body, className = '') {
    return `
      <article class="pd-chart-card ${className}">
        <div class="pd-chart-head">
          <h3>${escapeHtml(title)}</h3>
          <span>${escapeHtml(subtitle)}</span>
        </div>
        ${body}
      </article>
    `;
  }

  /* ===== PRODUCT DELIVERY TABLE ===== */
  function renderProductDeliveryTable(model) {
    const projects = ProductDeliveryDashboardData.productDeliveryProjects;
    if (!projects.length) {
      return '<div class="pd-empty-state"><h3>No Product &amp; Delivery Projects</h3><p>No projects available.</p></div>';
    }
    return `
      <div class="table-container pd-table-card">
        <table class="pd-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Project Description</th>
              <th>Started Date</th>
              <th>Delivery Date</th>
              <th>Team Members</th>
              <th>Delivery Health</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${projects.map(p => productDeliveryRow(p)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function productDeliveryRow(project) {
    return `
      <tr>
        <td><strong>${escapeHtml(project.name)}</strong></td>
        <td class="pd-description-cell">${escapeHtml(safeText(project.description, 'No description provided'))}</td>
        <td>${escapeHtml(safeText(project.startedDate, 'Not set'))}</td>
        <td>${escapeHtml(safeText(project.deliveryDate, 'Not set'))}</td>
        <td>${pdTeamSummary(project.teamMembers)}</td>
        <td>${deliveryHealthBadge(project.deliveryHealth)}</td>
        <td>${statusBadge(project.status || 'Created')}</td>
        <td><button class="btn btn-outline btn-sm" type="button" onclick="ProductDeliveryDashboard.openProjectDetails('${project.id}')">View Details</button></td>
      </tr>
    `;
  }

  function pdTeamSummary(members) {
    if (!members || !members.length) return '<span>0 members</span>';
    const names = members.slice(0, 2).map(m => m.name).join(', ');
    return `<span>${members.length} member${members.length === 1 ? '' : 's'}</span><div class="pd-muted">${escapeHtml(names)}</div>`;
  }

  /* ===== CROSS-ROLE TABLE ===== */
  function renderCrossRoleTable(projects, model) {
    if (!projects || !projects.length) {
      return '<div class="pd-empty-state"><h3>No Cross-Role Projects</h3><p>You are not assigned to any projects outside your Product &amp; Delivery role.</p></div>';
    }
    return `
      <div class="table-container pd-table-card">
        <table class="pd-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Dashboard Cluster</th>
              <th>Persona</th>
              <th>Project Role</th>
              <th>Key Responsibilities</th>
              <th>Blockers</th>
              <th>Team Members</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${projects.map(p => crossRoleRow(p, model)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function crossRoleRow(project, model) {
    const assignment = NexusRoleUtils.findUserAssignment(project, model.currentUser);
    const role = NexusRoleUtils.normalizeProjectRole(assignment?.projectRole);
    const meta = getCrossRoleMeta(role);
    const persona = assignment?.persona || meta.defaultPersona || NexusRoleUtils.projectRoleLabel(role);
    const responsibilities = (meta.tasksInvolved || []).slice(0, 3);
    const expanded = state.expandedCrossProjectId === project.id;
    return `
      <tr>
        <td><strong>${escapeHtml(project.name)}</strong></td>
        <td><span class="pd-cluster-badge">${escapeHtml(meta.dashboardCluster)}</span></td>
        <td><strong class="pd-persona-name">${escapeHtml(persona)}</strong></td>
        <td><span class="pd-role-badge">${escapeHtml(NexusRoleUtils.projectRoleLabel(role))}</span></td>
        <td class="pd-responsibility-cell">${responsibilities.map(i => `<span>${escapeHtml(i)}</span>`).join('')}</td>
        <td>${blockersBadge(getCrossRoleBlocker(project, role))}</td>
        <td>${teamSummary(project, model.tenantUsers)}</td>
        <td>${statusBadge(project.status || 'ACTIVE')}</td>
        <td><button class="btn btn-outline btn-sm" type="button" onclick="ProductDeliveryDashboard.toggleCrossDetails('${project.id}')">${expanded ? 'Hide Details' : 'View Details'}</button></td>
      </tr>
      ${expanded ? `<tr class="pd-details-row"><td colspan="9">${renderCrossRoleDetails(project, model)}</td></tr>` : ''}
    `;
  }

  function renderCrossRoleDetails(project, model) {
    const assignment = NexusRoleUtils.findUserAssignment(project, model.currentUser);
    const role = NexusRoleUtils.normalizeProjectRole(assignment?.projectRole);
    const meta = getCrossRoleMeta(role);
    const persona = assignment?.persona || meta.defaultPersona || NexusRoleUtils.projectRoleLabel(role);
    const blocker = getCrossRoleBlocker(project, role);
    const tenantRole = NexusRoleUtils.getTenantRoleLabel(model.currentUser);
    const teamCount = NexusRoleUtils.getProjectAssignments(project).length;
    return `
      <div class="pd-cross-details">
        ${detailSection('Role Context', [
          ['Dashboard Cluster', meta.dashboardCluster],
          ['Primary Persona', persona],
          ['Project Role', NexusRoleUtils.projectRoleLabel(role)],
          ['Assigned tenant role', tenantRole]
        ])}
        ${detailListSection('Responsibilities', meta.tasksInvolved)}
        ${detailSection('Touchpoints', [['Focus area', meta.details.focusArea]])}
        ${detailSection('Expected Outcome', [['Outcome', meta.details.outcome]])}
        ${detailSection('Project Status', [
          ['Current status', titleCase(project.status || 'Active')],
          ['Blockers', blocker],
          ['Team members', `${teamCount} member${teamCount === 1 ? '' : 's'}`],
          ['Last updated', formatDate(project.updatedAt || project.updated_at || project.createdAt || project.created_at)]
        ])}
        ${detailSection('Role-Specific Summary', meta.summary.map(([l, v]) => [l, v]))}
      </div>
    `;
  }

  /* =================================================================
     PROJECT DETAIL VIEW
     ================================================================= */
  function renderProjectDetailView(proj, model) {
    const s = proj.stats;
    const d = proj.details;
    return `
      <div class="pd-detail-top-bar">
        <button class="btn btn-outline btn-sm" onclick="ProductDeliveryDashboard.backToProjectList()">&#8592; Back to Product &amp; Delivery Projects</button>
        <div class="pd-breadcrumb">Dashboard / Product &amp; Delivery / <strong>${escapeHtml(proj.name)}</strong></div>
      </div>

      ${renderProjectHero(proj)}

      <div class="page-actions" style="margin-bottom:14px">
        ${renderPdProjectDropdown()}
      </div>

      ${renderDetailSummaryCards(proj)}

      <section class="pd-section">
        <div class="pd-section-header">
          <div>
            <h2>Delivery Flow Insights — ${escapeHtml(proj.name)}</h2>
            <p>${escapeHtml(proj.deliveryFlowInsights?.summary || '')}</p>
          </div>
        </div>
        ${renderProjectInsightHighlights(proj)}
        ${renderDeliveryFlowInsights(proj)}
      </section>

      ${renderSprintPlanningCard(s.sprintPlanning)}
      ${renderMilestoneDashboardCard(s.milestoneDashboard)}
      ${renderResourcePlanningCard(s.resourcePlanning)}
      ${renderStageGatesCard(s.stageGates)}
      ${renderDependencyMappingCard(s.dependencyMapping)}
      ${renderPrioritizationToolsCard(s.prioritizationTools, s.featurePriority)}
      ${renderStakeholderCommCard(s.stakeholderCommunication)}
      ${renderEscalationsCard(s.escalationsSummary)}

      <section class="pd-section">
        <div class="pd-section-header">
          <div>
            <h2>Detailed Project Data — ${escapeHtml(proj.name)}</h2>
            <p>Comprehensive project tables for requirements, backlog, workflows, tasks, roadmaps, planning, sprints, resources, dependencies, stakeholders, agent outputs, and escalations.</p>
          </div>
        </div>
        <div class="pd-detail-table-grid">
          ${renderDetailTable('Requirements', ['Requirement ID', 'Title', 'Priority', 'Status', 'Owner', 'Last Updated'], d.requirements, r => [r.id, r.title, r.priority, r.status, r.owner, r.lastUpdated])}
          ${renderDetailTable('Backlog', ['Backlog ID', 'Feature', 'Priority', 'Approval Status', 'Owner'], d.backlogItems, r => [r.id, r.feature, r.priority, r.approvalStatus, r.owner])}
          ${renderDetailTable('Workflow', ['Stage', 'Status', 'Assigned Agent', 'Last Action', 'Next Action'], d.workflows, r => [r.stage, r.status, r.assignedAgent, r.lastAction, r.nextAction])}
          ${renderDetailTable('Tasks', ['Task ID', 'Task Name', 'Assignee', 'Status', 'Due Date'], d.tasks, r => [r.id, r.taskName, r.assignee, r.status, r.dueDate])}
          ${renderDetailTable('Roadmap / Milestones', ['Milestone', 'Owner', 'Due Date', 'Status'], d.roadmaps, r => [r.milestone, r.owner, r.dueDate, r.status])}
          ${renderDetailTable('Planning Boards', ['Board ID', 'Board Name', 'Type', 'Owner', 'Status'], d.planningBoards, r => [r.id, r.boardName, r.type, r.owner, r.status])}
          ${renderDetailTable('Sprint Planning', ['Sprint', 'Goal', 'Planned SP', 'Completed SP', 'Status'], d.sprintPlans, r => [r.sprint, r.goal, r.plannedStoryPoints, r.completedStoryPoints, r.status])}
          ${renderDetailTable('Resource Planning', ['Resource Name', 'Role', 'Allocation', 'Capacity Status'], d.resources, r => [r.name, r.role, r.allocation, r.capacityStatus])}
          ${renderDetailTable('Dependency Mapping', ['Dependency ID', 'Dependency', 'Owner', 'Status', 'Impact'], d.dependencies, r => [r.id, r.dependency, r.owner, r.status, r.impact])}
          ${renderDetailTable('Stakeholder Communication', ['Communication ID', 'Stakeholder', 'Communication Type', 'Status', 'Next Update'], d.stakeholderCommunications, r => [r.id, r.stakeholder, r.communicationType, r.status, r.nextUpdate])}
          ${renderDetailTable('Agent Outputs', ['Output ID', 'Agent', 'Output Type', 'Review Status', 'Reviewer'], d.agentOutputs, r => [r.id, r.agent, r.outputType, r.reviewStatus, r.reviewer])}
          ${renderDetailTable('Stage Gates', ['Gate ID', 'Gate', 'Approval Status', 'Pending Sign-Offs', 'Gate Owner', 'Comments'], d.stageGates, r => [r.id, r.gate, r.approvalStatus, r.pendingSignOffs, r.gateOwner, r.comments])}
          ${renderDetailTable('Escalations', ['Escalation ID', 'Title', 'Severity', 'Status', 'Raised By', 'Owner', 'Created On', 'Resolution ETA', 'Notes'], d.escalations, r => [r.id, r.title, r.severity, r.status, r.raisedBy, r.owner, r.createdOn, r.resolutionEta, r.notes])}
        </div>
      </section>
    `;
  }

  /* ===== PROJECT HERO ===== */
  function renderProjectHero(proj) {
    return `
      <div class="pd-project-hero">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:14px">
          <div>
            <h2 style="margin:0 0 6px;color:var(--text-primary);font-size:22px">${escapeHtml(proj.name)}</h2>
            <p style="margin:0;color:var(--text-secondary);font-size:13px;line-height:1.5">${escapeHtml(safeText(proj.description, ''))}</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${statusBadge(proj.status)}
            ${deliveryHealthBadge(proj.deliveryHealth)}
          </div>
        </div>
        <div class="pd-project-meta-grid">
          <div class="pd-project-meta-item"><span>Started Date</span><strong>${escapeHtml(safeText(proj.startedDate, 'Not set'))}</strong></div>
          <div class="pd-project-meta-item"><span>Delivery Date</span><strong>${escapeHtml(safeText(proj.deliveryDate, 'Not set'))}</strong></div>
          <div class="pd-project-meta-item"><span>Your Role</span><strong>${escapeHtml(safeText(proj.currentUserRole, 'N/A'))}</strong></div>
          <div class="pd-project-meta-item"><span>Delivery Health</span><strong>${escapeHtml(safeText(proj.deliveryHealth, 'N/A'))}</strong></div>
        </div>
        <div>
          <span style="font-size:12px;color:var(--text-muted);font-weight:700;text-transform:uppercase;display:block;margin-bottom:8px">Team Members</span>
          <div class="pd-project-team">
            ${(proj.teamMembers || []).map(m => `<div class="pd-team-chip"><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.role)}</small></div>`).join('')}
            ${(!proj.teamMembers || !proj.teamMembers.length) ? '<span class="pd-empty-inline">No team members assigned</span>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  /* ===== DETAIL SUMMARY CARDS ===== */
  function renderDetailSummaryCards(proj) {
    const s = proj.stats;
    const req = s.requirementIntake || {};
    const bl = s.backlogApproval || {};
    const tt = s.taskTracking || {};
    const sp = s.sprintPlanning || {};
    const esc = s.escalationsSummary || {};
    const dep = s.dependencyMapping || {};

    return `
      <div class="pd-summary-grid pd-summary-grid-detail">
        ${miniStatCard('Requirements', safeValue(req.totalRequirements), `${safeValue(req.pendingReview)} pending review`)}
        ${miniStatCard('Backlog Items', safeValue(bl.generated), `${safeValue(bl.pendingApproval)} pending approval`)}
        ${miniStatCard('Tasks', safeValue(tt.totalTasks), `${safeValue(tt.blocked)} blocked`)}
        ${miniStatCard('Sprint Progress', `${clampPercent(safeValue(sp.sprintCompleted) / Math.max(safeValue(sp.sprintCommitted), 1) * 100)}%`, safeText(sp.sprintName, 'No sprint'))}
        ${miniStatCard('Dependencies', safeValue(dep.totalDependencies), `${safeValue(dep.blockedDependencies)} blocked`)}
        ${miniStatCard('Escalations', safeValue(esc.totalEscalations), `${safeValue(esc.critical)} critical`)}
      </div>
    `;
  }

  function miniStatCard(label, value, sub) {
    return `
      <div class="pd-summary-card pd-summary-card-mini">
        <span class="pd-summary-label">${escapeHtml(label)}</span>
        <strong>${value}</strong>
        <span class="pd-summary-subtitle">${escapeHtml(sub)}</span>
      </div>
    `;
  }

  /* ===== NEW DASHBOARD MODULE CARDS ===== */
  function renderSprintPlanningCard(sp) {
    if (!sp) return '';
    const progress = clampPercent(safeValue(sp.sprintCompleted) / Math.max(safeValue(sp.sprintCommitted), 1) * 100);
    return `
      <section class="pd-section">
        <article class="pd-chart-card">
          <div class="pd-chart-head"><h3>Sprint Planning</h3><span>Sprint Execution</span></div>
          <div class="pd-sprint-grid">
            <div class="pd-kpi-chip"><span>Sprint Name</span><strong>${escapeHtml(safeText(sp.sprintName))}</strong></div>
            <div class="pd-kpi-chip"><span>Sprint Goal</span><strong>${escapeHtml(safeText(sp.sprintGoal))}</strong></div>
            <div class="pd-kpi-chip"><span>Start</span><strong>${escapeHtml(safeText(sp.sprintStart))}</strong></div>
            <div class="pd-kpi-chip"><span>End</span><strong>${escapeHtml(safeText(sp.sprintEnd))}</strong></div>
            <div class="pd-kpi-chip"><span>Capacity</span><strong>${safeValue(sp.sprintCapacity)}</strong></div>
            <div class="pd-kpi-chip"><span>Committed</span><strong>${safeValue(sp.sprintCommitted)}</strong></div>
            <div class="pd-kpi-chip"><span>Completed</span><strong>${safeValue(sp.sprintCompleted)}</strong></div>
            <div class="pd-kpi-chip"><span>Progress</span><strong>${progress}%</strong></div>
          </div>
          <div style="margin-top:12px">
            <div class="pd-segment-bar"><span class="pd-tone-success" style="width:${progress}%"></span></div>
          </div>
        </article>
      </section>
    `;
  }

  function renderMilestoneDashboardCard(ms) {
    if (!ms) return '';
    const total = Math.max(safeValue(ms.totalMilestones), 1);
    const data = [
      ['Completed', safeValue(ms.completed), 'success'],
      ['Active', safeValue(ms.active), 'info'],
      ['Delayed', safeValue(ms.delayed), 'danger']
    ];
    return `
      <section class="pd-section">
        <article class="pd-chart-card">
          <div class="pd-chart-head"><h3>Milestone Dashboard</h3><span>Milestone Tracking</span></div>
          <div class="pd-task-total"><strong>${safeValue(ms.totalMilestones)}</strong><span>Total Milestones</span></div>
          <div class="pd-segment-bar">${data.map(([, v, t]) => `<span class="pd-tone-${t}" style="width:${clampPercent((v / total) * 100)}%"></span>`).join('')}</div>
          <div class="pd-legend-grid">${data.map(([l, v, t]) => `<span><i class="pd-dot pd-tone-${t}"></i>${escapeHtml(l)} <strong>${v}</strong></span>`).join('')}</div>
        </article>
      </section>
    `;
  }

  function renderResourcePlanningCard(rp) {
    if (!rp) return '';
    const data = [
      ['Total Resources', safeValue(rp.totalResources)],
      ['Allocated', safeValue(rp.allocated)],
      ['Available', safeValue(rp.available)],
      ['Overloaded', safeValue(rp.overloaded)]
    ];
    return `
      <section class="pd-section">
        <article class="pd-chart-card">
          <div class="pd-chart-head"><h3>Resource Planning</h3><span>Resource Allocation</span></div>
          <div class="pd-mini-stat-grid">${data.map(([l, v]) => `<div><strong>${v}</strong><span>${escapeHtml(l)}</span></div>`).join('')}</div>
        </article>
      </section>
    `;
  }

  function renderStageGatesCard(sg) {
    if (!sg) return '';
    const data = [
      ['Total Gates', safeValue(sg.totalGates)],
      ['Approved', safeValue(sg.approved)],
      ['Pending Sign-Off', safeValue(sg.pendingSignOff)],
      ['Rejected', safeValue(sg.rejected)]
    ];
    return `
      <section class="pd-section">
        <article class="pd-chart-card">
          <div class="pd-chart-head"><h3>Stage Gates</h3><span>Stage Progression Approval</span></div>
          <div class="pd-mini-stat-grid">${data.map(([l, v]) => `<div><strong>${v}</strong><span>${escapeHtml(l)}</span></div>`).join('')}</div>
          <div style="margin-top:10px;font-size:12px;color:var(--text-secondary)">Comments: <strong>${safeValue(sg.comments)}</strong></div>
        </article>
      </section>
    `;
  }

  function renderDependencyMappingCard(dep) {
    if (!dep) return '';
    const total = Math.max(safeValue(dep.totalDependencies), 1);
    const data = [
      ['Open', safeValue(dep.openDependencies), 'warning'],
      ['Blocked', safeValue(dep.blockedDependencies), 'danger'],
      ['Resolved', safeValue(dep.resolvedDependencies), 'success']
    ];
    return `
      <section class="pd-section">
        <article class="pd-chart-card">
          <div class="pd-chart-head"><h3>Dependency Mapping</h3><span>Dependency Tracking</span></div>
          <div class="pd-task-total"><strong>${safeValue(dep.totalDependencies)}</strong><span>Total Dependencies</span></div>
          <div class="pd-segment-bar">${data.map(([, v, t]) => `<span class="pd-tone-${t}" style="width:${clampPercent((v / total) * 100)}%"></span>`).join('')}</div>
          <div class="pd-legend-grid">${data.map(([l, v, t]) => `<span><i class="pd-dot pd-tone-${t}"></i>${escapeHtml(l)} <strong>${v}</strong></span>`).join('')}</div>
        </article>
      </section>
    `;
  }

  function renderPrioritizationToolsCard(pt, fp) {
    if (!pt && !fp) return '';
    pt = pt || {};
    fp = fp || {};
    const data = [
      ['Priority Counts', safeValue(pt.priorityCounts)],
      ['Feature Sequencing', safeValue(pt.featureSequencing)],
      ['Linked Backlog Items', safeValue(pt.linkedBacklogItems)]
    ];
    const mix = [
      ['Must Have', safeValue(fp.mustHave), 'danger'],
      ['Should Have', safeValue(fp.shouldHave), 'warning'],
      ['Could Have', safeValue(fp.couldHave), 'info'],
      ['Deferred', safeValue(fp.deferred), 'muted']
    ];
    return `
      <section class="pd-section">
        <article class="pd-chart-card">
          <div class="pd-chart-head"><h3>Prioritization Tools</h3><span>Feature Prioritization</span></div>
          <div class="pd-mini-stat-grid">${data.map(([l, v]) => `<div><strong>${v}</strong><span>${escapeHtml(l)}</span></div>`).join('')}</div>
          <div style="margin-top:14px">
            <div class="pd-legend-grid">${mix.map(([l, v, t]) => `<span><i class="pd-dot pd-tone-${t}"></i>${escapeHtml(l)} <strong>${v}</strong></span>`).join('')}</div>
          </div>
        </article>
      </section>
    `;
  }

  function renderStakeholderCommCard(sc) {
    if (!sc) return '';
    const data = [
      ['Total Stakeholders', safeValue(sc.totalStakeholders)],
      ['Updates Sent', safeValue(sc.updatesSent)],
      ['Pending Updates', safeValue(sc.pendingUpdates)],
      ['Meetings Scheduled', safeValue(sc.meetingsScheduled)]
    ];
    return `
      <section class="pd-section">
        <article class="pd-chart-card">
          <div class="pd-chart-head"><h3>Stakeholder Communication</h3><span>Stakeholder Updates</span></div>
          <div class="pd-mini-stat-grid">${data.map(([l, v]) => `<div><strong>${v}</strong><span>${escapeHtml(l)}</span></div>`).join('')}</div>
        </article>
      </section>
    `;
  }

  function renderEscalationsCard(esc) {
    if (!esc) return '';
    const data = [
      ['Total', safeValue(esc.totalEscalations)],
      ['Open', safeValue(esc.open)],
      ['In Review', safeValue(esc.inReview)],
      ['Resolved', safeValue(esc.resolved)],
      ['Critical', safeValue(esc.critical)]
    ];
    return `
      <section class="pd-section">
        <article class="pd-chart-card">
          <div class="pd-chart-head"><h3>Escalations</h3><span>Project Escalations</span></div>
          <div class="pd-mini-stat-grid">${data.map(([l, v]) => {
            const tone = l === 'Critical' && v > 0 ? ' style="border-color:rgba(239,68,68,0.4);background:rgba(239,68,68,0.08)"' : '';
            return `<div${tone}><strong>${v}</strong><span>${escapeHtml(l)}</span></div>`;
          }).join('')}</div>
        </article>
      </section>
    `;
  }

  /* ===== GENERIC DETAIL TABLE ===== */
  function renderDetailTable(title, headers, rows, mapFn) {
    const items = rows || [];
    return `
      <div class="pd-detail-table-card">
        <h3>${escapeHtml(title)}</h3>
        ${items.length ? `
          <div class="table-container" style="overflow-x:auto">
            <table class="pd-table pd-compact-table">
              <thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
              <tbody>
                ${items.map(r => {
                  const cells = mapFn(r);
                  return `<tr>${cells.map(c => `<td>${renderCellValue(c)}</td>`).join('')}</tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : '<p class="pd-empty-inline">No data available</p>'}
      </div>
    `;
  }

  function renderCellValue(value) {
    if (value === null || value === undefined) return '<span class="pd-empty-inline">—</span>';
    const s = String(value);
    // Apply badge styling for known status values
    if (/^(Critical|High|Blocked|Rejected|Overloaded)$/i.test(s)) return `<span class="pd-badge pd-badge-danger">${escapeHtml(s)}</span>`;
    if (/^(Open|Pending|Pending Review|Pending Approval|Pending Sign-Off|Needs Clarification|In Progress|In Review|Active|At Risk|Delayed)$/i.test(s)) return `<span class="pd-badge pd-badge-warning">${escapeHtml(s)}</span>`;
    if (/^(Approved|Completed|Resolved|Sent|Healthy|On Track)$/i.test(s)) return `<span class="pd-badge pd-badge-success">${escapeHtml(s)}</span>`;
    if (/^(Created|Upcoming|Scheduled|Medium|Low|Allocated|Available)$/i.test(s)) return `<span class="pd-badge pd-badge-muted">${escapeHtml(s)}</span>`;
    return escapeHtml(s);
  }

  /* ===== VIEW DETAILS / BACK ===== */
  function openProjectDetails(projectId) {
    const project = ProductDeliveryDashboardData.getProjectById(projectId);
    if (!project) return;
    state.selectedProjectId = projectId;
    state.selectedProject = project;
    state.isProjectDetailView = true;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function backToProjectList() {
    state.isProjectDetailView = false;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleProjectChange(projectId) {
    const project = ProductDeliveryDashboardData.getProjectById(projectId);
    if (!project) return;
    state.selectedProjectId = projectId;
    state.selectedProject = project;
    render();
    if (!state.isProjectDetailView) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /* ===== SIDEBAR ROLE UPDATE ===== */
  function updateSidebarRole() {
    const proj = state.selectedProject;
    if (!proj) return;
    const roleEl = document.querySelector('.nav-user-role');
    if (roleEl) {
      const currentUser = NexusRoleUtils.getCurrentUser();
      const tenantRole = NexusRoleUtils.getTenantRoleLabel(currentUser);
      roleEl.textContent = `${tenantRole} (${proj.currentUserRole})`;
    }
  }

  /* ===== MODEL (for cross-role compat) ===== */
  function getDashboardModel() {
    const currentUser = NexusRoleUtils.getCurrentUser();
    const projects = NexusStore.getProjects();
    const assignedProjects = NexusRoleUtils.getAssignedProjects(projects, currentUser);
    const selectedProject = NexusRoleUtils.getSelectedProject(projects);
    const selectedProjectRole = getProjectRole(selectedProject, currentUser);
    const crossRoleProjects = assignedProjects.filter(p => getProjectRole(p, currentUser) !== 'PRODUCT_DELIVERY');
    const tenantId = TenantState.getCurrentTenant()?.tenant_id || TenantState.getCurrentTenant()?.id || '';
    const tenantUsers = tenantId ? TenantState.getTenantUsers(tenantId) : [];

    return {
      currentUser,
      tenantUsers,
      selectedProject,
      selectedProjectRole,
      selectedProjectRoleLabel: NexusRoleUtils.projectRoleLabel(selectedProjectRole),
      assignedProjects,
      productDeliveryProjects: ProductDeliveryDashboardData.productDeliveryProjects,
      crossRoleProjects,
      crossRoleBlockers: crossRoleProjects.filter(p => getCrossRoleBlocker(p, getProjectRole(p, currentUser)) !== 'None').length
    };
  }

  function getProjectRole(project, user) {
    return NexusRoleUtils.normalizeProjectRole(NexusRoleUtils.findUserAssignment(project, user)?.projectRole);
  }

  /* ===== COMMON UI HELPERS ===== */
  function roleMismatchState(model) {
    const roleLabel = model.selectedProjectRoleLabel || 'no assigned project role';
    return `
      <div class="page-header pd-page-header">
        <div>
          <h1 class="page-title">Product &amp; Delivery Dashboard</h1>
          <p class="page-subtitle">Structured project execution and aligned delivery.</p>
        </div>
        <div class="page-actions"><div id="pdProjectSelector"></div></div>
      </div>
      <div class="pd-empty-state pd-role-empty">
        <h3>This dashboard is for Product &amp; Delivery.</h3>
        <p>Your selected project role is ${escapeHtml(roleLabel)}.</p>
        <div class="pd-empty-actions">
          <a class="btn btn-primary" href="dashboard.html">Go to Projects Hub</a>
          <span>Use the project dropdown to switch to a project where your role is Product &amp; Delivery.</span>
        </div>
      </div>
    `;
  }

  function noAssignedProjects() {
    return '<div class="pd-empty-state"><h3>No Assigned Projects</h3><p>You are not currently assigned to any projects.</p></div>';
  }

  function detailSection(title, items) {
    return `
      <div class="pd-detail-section">
        <h3>${escapeHtml(title)}</h3>
        <div class="pd-kpi-grid">
          ${items.map(([l, v]) => `<div class="pd-kpi-chip"><span>${escapeHtml(l)}</span><strong>${escapeHtml(String(safeText(v, '—')))}</strong></div>`).join('')}
        </div>
      </div>
    `;
  }

  function detailListSection(title, items) {
    return `
      <div class="pd-detail-section">
        <h3>${escapeHtml(title)}</h3>
        <ul class="pd-detail-list">${(items || []).map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
      </div>
    `;
  }

  function deliveryHealthBadge(value) {
    const label = titleCase(value || 'Watch');
    const tone = /blocked|risk|at risk/i.test(label) ? 'danger' : /watch|monitor/i.test(label) ? 'warning' : 'success';
    return `<span class="pd-badge pd-badge-${tone}">${escapeHtml(label)}</span>`;
  }

  function confidenceBadge(value) {
    const label = titleCase(value || 'Medium');
    const tone = /low|risk/i.test(label) ? 'danger' : /medium|watch/i.test(label) ? 'warning' : 'success';
    return `<span class="pd-badge pd-badge-${tone}">${escapeHtml(label)}</span>`;
  }

  function blockersBadge(value) {
    const has = value && value !== 'None';
    return `<span class="pd-badge ${has ? 'pd-badge-danger' : 'pd-badge-muted'}">${escapeHtml(value || 'None')}</span>`;
  }

  function miniProgress(value) {
    return `<div class="pd-mini-progress"><span style="width:${clampPercent(value)}%"></span></div>`;
  }

  function getCrossRoleMeta(role) {
    return ProductDeliveryDashboardData.crossRoleMeta[role] || ProductDeliveryDashboardData.crossRoleMeta.WORKSPACE_UNIVERSAL;
  }

  function getCrossRoleBlocker(project, role) {
    if (project.status === 'BLOCKED') return 'Requirement clarification';
    const options = ProductDeliveryDashboardData.blockerOptions;
    const source = String(project.id || project.name || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const idx = (source + String(role || '').length) % options.length;
    return options[idx];
  }

  function teamSummary(project, tenantUsers) {
    const assignments = NexusRoleUtils.getProjectAssignments(project);
    const names = assignments
      .map(a => tenantUsers.find(u => u.id === a.userId || u.email === a.email)?.name)
      .filter(Boolean).slice(0, 2);
    return `<span>${assignments.length} member${assignments.length === 1 ? '' : 's'}</span>${names.length ? `<div class="pd-muted">${escapeHtml(names.join(', '))}</div>` : ''}`;
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggleCrossDetails(projectId) {
    state.expandedCrossProjectId = state.expandedCrossProjectId === projectId ? null : projectId;
    render();
    if (state.expandedCrossProjectId) requestAnimationFrame(() => document.getElementById('cross-role-projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  /* ===== PUBLIC API ===== */
  return {
    init,
    scrollToSection,
    openProjectDetails,
    backToProjectList,
    handleProjectChange,
    toggleCrossDetails
  };
})();
if (typeof window !== 'undefined') window.ProductDeliveryDashboard = ProductDeliveryDashboard;

document.addEventListener('DOMContentLoaded', ProductDeliveryDashboard.init);
