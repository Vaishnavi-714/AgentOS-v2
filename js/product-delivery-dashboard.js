const ProductDeliveryDashboard = (() => {
  const state = {
    expandedProductProjectId: null,
    expandedCrossProjectId: null
  };

  function init() {
    seedNexusData();
    createNavigation('product-delivery-dashboard');
    window.addEventListener('nexus:selected-project-changed', render);
    render();
  }

  function render() {
    const model = getDashboardModel();
    const root = document.getElementById('productDeliveryDashboardRoot');
    if (!root) return;

    if (model.selectedProjectRole !== 'PRODUCT_DELIVERY') {
      root.innerHTML = roleMismatchState(model);
      createProjectSelector('pdProjectSelector');
      return;
    }

    root.innerHTML = `
      <div class="page-header pd-page-header">
        <div>
          <h1 class="page-title">Product &amp; Delivery Dashboard</h1>
          <p class="page-subtitle">Structured project execution and aligned delivery.</p>
        </div>
        <div class="page-actions">
          <div id="pdProjectSelector"></div>
        </div>
      </div>

      <div class="pd-summary-grid" aria-label="Product and Delivery dashboard navigation">
        ${summaryCard('Total Projects', model.assignedProjects.length, 'All projects assigned to you', `${model.productDeliveryProjects.length} delivery, ${model.crossRoleProjects.length} cross-role`, model.metrics.workflow.completionPercentage, 'project-involvement')}
        ${summaryCard('Product & Delivery Projects', model.productDeliveryProjects.length, 'Projects where you own delivery flow', `${model.metrics.backlog.pendingApproval} approvals pending`, model.metrics.backlog.approved, 'product-delivery-projects')}
        ${summaryCard('Cross-Role Projects', model.crossRoleProjects.length, 'Projects where you support another role', `${model.crossRoleBlockers} blocker${model.crossRoleBlockers === 1 ? '' : 's'}`, model.crossRoleProjects.length ? 55 : 0, 'cross-role-projects')}
      </div>

      ${!model.assignedProjects.length ? noAssignedProjects() : `
        <section class="pd-section" id="project-involvement">
          <div class="pd-section-header">
            <div>
              <h2>Project Involvement</h2>
              <p>Complete project involvement for the logged-in user.</p>
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
              <h2>Delivery Flow Insights</h2>
              <p>Requirement intake, backlog health, workflow progress, agent reviews, and roadmap visibility.</p>
            </div>
          </div>
          ${renderDeliveryFlowInsights(model)}
        </section>

        <section class="pd-section" id="product-delivery-projects">
          <div class="pd-section-header">
            <div>
              <h2>Product &amp; Delivery Projects</h2>
              <p>Projects where you are responsible for requirement intake, planning boards, task tracking, roadmap visibility, backlog approvals, and stage progression.</p>
            </div>
          </div>
          ${renderProductDeliveryTable(model.productDeliveryProjects, model)}
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
    createProjectSelector('pdProjectSelector');
  }

  function getDashboardModel() {
    const currentUser = NexusRoleUtils.getCurrentUser();
    const projects = NexusStore.getProjects();
    const assignedProjects = NexusRoleUtils.getAssignedProjects(projects, currentUser);
    const selectedProject = NexusRoleUtils.getSelectedProject(projects);
    const selectedProjectRole = getProjectRole(selectedProject, currentUser);
    const productDeliveryProjects = assignedProjects.filter(project => getProjectRole(project, currentUser) === 'PRODUCT_DELIVERY');
    const crossRoleProjects = assignedProjects.filter(project => getProjectRole(project, currentUser) !== 'PRODUCT_DELIVERY');
    const tenantId = TenantState.getCurrentTenant()?.tenant_id || TenantState.getCurrentTenant()?.id || '';
    const tenantUsers = tenantId ? TenantState.getTenantUsers(tenantId) : [];
    const metrics = buildProductDeliveryDetail(selectedProject || productDeliveryProjects[0] || {});

    return {
      currentUser,
      tenantUsers,
      selectedProject,
      selectedProjectRole,
      selectedProjectRoleLabel: NexusRoleUtils.projectRoleLabel(selectedProjectRole),
      assignedProjects,
      productDeliveryProjects,
      crossRoleProjects,
      crossRoleBlockers: crossRoleProjects.filter(project => getCrossRoleBlocker(project, getProjectRole(project, currentUser)) !== 'None').length,
      metrics
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

  function roleMismatchState(model) {
    const roleLabel = model.selectedProjectRoleLabel || 'no assigned project role';
    return `
      <div class="page-header pd-page-header">
        <div>
          <h1 class="page-title">Product &amp; Delivery Dashboard</h1>
          <p class="page-subtitle">Structured project execution and aligned delivery.</p>
        </div>
        <div class="page-actions">
          <div id="pdProjectSelector"></div>
        </div>
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
            ${projects.map(project => productDeliveryRow(project, model)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function productDeliveryRow(project, model) {
    const expanded = state.expandedProductProjectId === project.id;
    const detail = buildProductDeliveryDetail(project);
    return `
      <tr>
        <td><strong>${escapeHtml(project.name)}</strong></td>
        <td class="pd-description-cell">${escapeHtml(project.description || 'No description provided')}</td>
        <td>${formatDate(project.createdAt || project.created_at)}</td>
        <td>${formatDate(getDeliveryDate(project))}</td>
        <td>${teamSummary(project, model.tenantUsers)}</td>
        <td>
          ${deliveryHealthBadge(detail.roadmap.deliveryHealth)}
          ${miniProgress(detail.workflow.completionPercentage)}
        </td>
        <td>${statusBadge(project.status || 'ACTIVE')}</td>
        <td><button class="btn btn-outline btn-sm" type="button" onclick="ProductDeliveryDashboard.toggleProductDetails('${project.id}')">${expanded ? 'Hide Details' : 'View Details'}</button></td>
      </tr>
      ${expanded ? `<tr class="pd-details-row"><td colspan="8">${renderProductDeliveryDetails(project)}</td></tr>` : ''}
    `;
  }

  function renderProductDeliveryDetails(project) {
    const detail = buildProductDeliveryDetail(project);
    return `
      <div class="pd-details-card">
        ${detailSection('Requirement to Backlog', [
          ['Total requirements', detail.requirements.total],
          ['Requirements pending review', detail.requirements.pendingReview],
          ['Ready for backlog', detail.requirements.readyForBacklog],
          ['Backlog items generated', detail.backlog.generated],
          ['Backlog items pending approval', detail.backlog.pendingApproval],
          ['Approved backlog items', detail.backlog.approved]
        ])}
        ${detailSection('Planning and Prioritization', [
          ['Must-have features', detail.features.mustHave],
          ['Should-have features', detail.features.shouldHave],
          ['Task total', detail.tasks.total],
          ['Tasks in progress', detail.tasks.inProgress],
          ['Tasks completed', detail.tasks.completed]
        ])}
        ${detailSection('Execution Monitoring', [
          ['Current workflow stage', detail.workflow.currentStage],
          ['Stage completion', `${detail.workflow.completionPercentage}%`],
          ['Next stage', detail.workflow.nextStage],
          ['Current milestone', detail.roadmap.currentMilestone],
          ['Next milestone', detail.roadmap.nextMilestone],
          ['Timeline status', detail.roadmap.timelineStatus]
        ])}
        ${detailSection('Review and Approval', [
          ['Agent outputs pending review', detail.outputs.pending],
          ['Approved agent outputs', detail.outputs.approved],
          ['Revisions requested', detail.outputs.revisions],
          ['Pending stage approvals', detail.approvals.pending],
          ['Delivery blockers', detail.escalations.deliveryBlockers],
          ['At-risk milestones', detail.roadmap.atRiskMilestones]
        ])}
      </div>
    `;
  }

  function renderDeliveryFlowInsights(model) {
    const detail = model.metrics;
    return `
      <div class="pd-insights-grid">
        ${renderRequirementFunnel(detail)}
        ${renderBacklogStatus(detail)}
        ${renderPriorityMix(detail)}
        ${renderWorkflowStepper(detail)}
        ${renderAgentOutputStatus(detail)}
        ${renderRoadmapHealth(detail)}
        ${renderTaskTracking(detail)}
      </div>
    `;
  }

  function renderRequirementFunnel(detail) {
    const total = Math.max(detail.requirements.total, 1);
    const rows = [
      ['Total Requirements', detail.requirements.total],
      ['Pending Review', detail.requirements.pendingReview],
      ['Needs Clarification', detail.requirements.needsClarification],
      ['Ready for Backlog', detail.requirements.readyForBacklog],
      ['Converted to Backlog', detail.requirements.convertedToBacklog]
    ];
    return chartCard('Requirement Intake Funnel', 'Review Requirements', rows.map(([label, value]) => `
      <div class="pd-funnel-row">
        <span>${escapeHtml(label)}</span>
        <strong>${value}</strong>
        <i><b style="width:${clampPercent((value / total) * 100)}%"></b></i>
      </div>
    `).join(''));
  }

  function renderBacklogStatus(detail) {
    const data = [
      ['Generated', detail.backlog.generated, 'info'],
      ['Pending Approval', detail.backlog.pendingApproval, 'warning'],
      ['Approved', detail.backlog.approved, 'success'],
      ['Returned', detail.backlog.returned, 'orange'],
      ['Rejected', detail.backlog.rejected, 'danger']
    ];
    const total = Math.max(data.reduce((sum, item) => sum + item[1], 0), 1);
    return chartCard('Backlog Approval Status', 'Generate / Approve Backlog', `
      <div class="pd-segment-bar">${data.map(([, value, tone]) => `<span class="pd-tone-${tone}" style="width:${clampPercent((value / total) * 100)}%"></span>`).join('')}</div>
      <div class="pd-legend-grid">${data.map(([label, value, tone]) => `<span><i class="pd-dot pd-tone-${tone}"></i>${escapeHtml(label)} <strong>${value}</strong></span>`).join('')}</div>
    `);
  }

  function renderPriorityMix(detail) {
    const data = [
      ['Must Have', detail.features.mustHave],
      ['Should Have', detail.features.shouldHave],
      ['Could Have', detail.features.couldHave],
      ['Deferred', detail.features.deferred]
    ];
    const max = Math.max(...data.map(item => item[1]), 1);
    return chartCard('Feature Priority Mix', 'Prioritize Features', `
      <div class="pd-bar-chart">${data.map(([label, value]) => `
        <div class="pd-bar-item">
          <span>${escapeHtml(label)}</span>
          <i><b style="height:${clampPercent((value / max) * 100)}%"></b></i>
          <strong>${value}</strong>
        </div>
      `).join('')}</div>
    `);
  }

  function renderWorkflowStepper(detail) {
    const stages = ['Requirement Review', 'Backlog Generation', 'Backlog Approval', 'Feature Prioritization', 'Task Planning', 'Delivery Tracking', 'Stage Approval'];
    const currentIndex = stages.findIndex(stage => stage === detail.workflow.currentStage);
    const fallbackIndex = Math.min(stages.length - 1, Math.floor((detail.workflow.completionPercentage / 100) * stages.length));
    const activeIndex = currentIndex >= 0 ? currentIndex : fallbackIndex;
    return chartCard('Workflow Stage Progress', 'Monitor Workflow Stages', `
      <div class="pd-stepper">${stages.map((stage, index) => {
        const status = detail.workflow.blockedStages && index === activeIndex ? 'blocked' : index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'next';
        return `<div class="pd-step ${status}"><i></i><span>${escapeHtml(stage)}</span></div>`;
      }).join('')}</div>
      <div class="pd-chart-foot">Next stage: <strong>${escapeHtml(detail.workflow.nextStage)}</strong></div>
    `, 'pd-chart-card-wide');
  }

  function renderAgentOutputStatus(detail) {
    const data = [
      ['Pending Review', detail.outputs.pending],
      ['Approved', detail.outputs.approved],
      ['Revision Requested', detail.outputs.revisions],
      ['Rejected', detail.outputs.rejected]
    ];
    return chartCard('Agent Output Review Status', 'Review Agent Outputs', `<div class="pd-mini-stat-grid">${data.map(([label, value]) => `<div><strong>${value}</strong><span>${escapeHtml(label)}</span></div>`).join('')}</div>`);
  }

  function renderRoadmapHealth(detail) {
    return chartCard('Roadmap Health', 'Roadmap Visibility', `
      <div class="pd-roadmap-card">
        <div><span>Current milestone</span><strong>${escapeHtml(detail.roadmap.currentMilestone)}</strong></div>
        <div><span>Next milestone</span><strong>${escapeHtml(detail.roadmap.nextMilestone)}</strong></div>
        <div class="pd-roadmap-row"><span>Timeline status</span>${deliveryHealthBadge(detail.roadmap.timelineStatus)}</div>
        <div class="pd-roadmap-row"><span>Delivery confidence</span>${confidenceBadge(detail.roadmap.deliveryConfidence)}</div>
        <div class="pd-roadmap-row"><span>At-risk milestones</span><strong>${detail.roadmap.atRiskMilestones}</strong></div>
      </div>
    `);
  }

  function renderTaskTracking(detail) {
    const data = [
      ['In Progress', detail.tasks.inProgress, 'info'],
      ['Completed', detail.tasks.completed, 'success'],
      ['Blocked', detail.tasks.blocked, 'danger']
    ];
    const total = Math.max(detail.tasks.total, 1);
    return chartCard('Task Tracking Snapshot', 'Task Tracking', `
      <div class="pd-task-total"><strong>${detail.tasks.total}</strong><span>Total Tasks</span></div>
      <div class="pd-segment-bar">${data.map(([, value, tone]) => `<span class="pd-tone-${tone}" style="width:${clampPercent((value / total) * 100)}%"></span>`).join('')}</div>
      <div class="pd-legend-grid">${data.map(([label, value, tone]) => `<span><i class="pd-dot pd-tone-${tone}"></i>${escapeHtml(label)} <strong>${value}</strong></span>`).join('')}</div>
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
            ${projects.map(project => crossRoleRow(project, model)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function crossRoleRow(project, model) {
    const assignment = NexusRoleUtils.findUserAssignment(project, model.currentUser);
    const role = NexusRoleUtils.normalizeProjectRole(assignment?.projectRole);
    const meta = getCrossRoleMeta(role);
    const persona = getPrimaryPersona(role, assignment);
    const responsibilities = getShortResponsibilities(role);
    const expanded = state.expandedCrossProjectId === project.id;
    return `
      <tr>
        <td><strong>${escapeHtml(project.name)}</strong></td>
        <td><span class="pd-cluster-badge">${escapeHtml(meta.dashboardCluster)}</span></td>
        <td><strong class="pd-persona-name">${escapeHtml(persona)}</strong></td>
        <td><span class="pd-role-badge">${escapeHtml(NexusRoleUtils.projectRoleLabel(role))}</span></td>
        <td class="pd-responsibility-cell">${responsibilities.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</td>
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
    const persona = getPrimaryPersona(role, assignment);
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
        ${detailSection('Touchpoints', [
          ['Focus area', meta.details.focusArea]
        ])}
        ${detailSection('Expected Outcome', [
          ['Outcome', meta.details.outcome]
        ])}
        ${detailSection('Project Status', [
          ['Current status', titleCase(project.status || 'Active')],
          ['Blockers', blocker],
          ['Team members', `${teamCount} member${teamCount === 1 ? '' : 's'}`],
          ['Last updated', formatDate(project.updatedAt || project.updated_at || project.createdAt || project.created_at)]
        ])}
        ${detailSection('Role-Specific Summary', meta.summary.map(([label, value], index) => [label, enrichCrossDetail(project, value, index)]))}
      </div>
    `;
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
    return `<div class="pd-mini-progress"><span style="width:${clampPercent(value)}%"></span></div>`;
  }

  function deliveryHealthBadge(value) {
    const label = titleCase(value || 'Watch');
    const tone = /blocked|risk/i.test(label) ? 'danger' : /watch|monitor/i.test(label) ? 'warning' : 'success';
    return `<span class="pd-badge pd-badge-${tone}">${escapeHtml(label)}</span>`;
  }

  function confidenceBadge(value) {
    const label = titleCase(value || 'Medium');
    const tone = /low|risk/i.test(label) ? 'danger' : /medium|watch/i.test(label) ? 'warning' : 'success';
    return `<span class="pd-badge pd-badge-${tone}">${escapeHtml(label)}</span>`;
  }

  function blockersBadge(value) {
    const hasBlocker = value && value !== 'None';
    return `<span class="pd-badge ${hasBlocker ? 'pd-badge-danger' : 'pd-badge-muted'}">${escapeHtml(value || 'None')}</span>`;
  }

  function clampPercent(value) {
    const num = Number(value) || 0;
    return Math.max(0, Math.min(100, Math.round(num)));
  }

  function buildProductDeliveryDetail(project) {
    if (project?.productDeliveryMetrics) return normalizeMetrics(project.productDeliveryMetrics, project);
    const requirements = NexusStore.getRequirements(project.id);
    const backlog = NexusStore.getBacklog(project.id);
    const pipeline = NexusStore.getPipeline(project.id);
    const tasks = NexusStore.getTasks(project.id);
    const stages = pipeline?.stages || [];
    const completedStages = stages.filter(stage => stage.status === 'COMPLETED').length;
    const currentStage = stages.find(stage => stage.status === 'IN_PROGRESS') || stages[completedStages - 1] || stages[0];
    const nextStage = stages.find(stage => stage.status === 'PENDING' || stage.stage === (currentStage?.stage || 0) + 1);
    const blockedStages = stages.filter(stage => ['BLOCKED', 'ESCALATED'].includes(stage.status)).length;
    const totalRequirements = requirements.length || fallbackNumber(project, 18, 9);
    const totalBacklog = backlog.length || fallbackNumber(project, 32, 11);
    const totalTasks = tasks.length || fallbackNumber(project, 24, 8);

    const completionPercentage = stages.length ? Math.round((completedStages / stages.length) * 100) : project.status === 'COMPLETED' ? 100 : 42;
    const timelineStatus = project.status === 'BLOCKED' ? 'At Risk' : project.status === 'COMPLETED' ? 'On Track' : 'Monitoring';
    const deliveryConfidence = ProductDeliveryDashboardData.deliveryConfidence(project, pipeline);
    const rejectedBacklog = countBy(backlog, item => item.status === 'REJECTED') || Math.max(0, Math.round(totalBacklog * 0.05));
    const returnedBacklog = countBy(backlog, item => item.status === 'RETURNED') || Math.max(1, Math.round(totalBacklog * 0.08));

    return normalizeMetrics({
      requirements: {
        total: totalRequirements,
        pendingReview: countBy(requirements, req => !req.reviewStatus || req.reviewStatus === 'PENDING') || Math.max(2, Math.round(totalRequirements * 0.25)),
        needsClarification: countBy(requirements, req => Number(req.confidence) < 0.9) || Math.max(1, Math.round(totalRequirements * 0.15)),
        readyForBacklog: countBy(requirements, req => Number(req.confidence) >= 0.9) || Math.max(4, Math.round(totalRequirements * 0.6)),
        convertedToBacklog: Math.min(totalRequirements, totalBacklog || Math.max(3, Math.round(totalRequirements * 0.45)))
      },
      backlog: {
        generated: totalBacklog,
        pendingApproval: countBy(backlog, item => ['SPECIFIED', 'PENDING', 'IN_REVIEW'].includes(item.status)) || Math.max(3, Math.round(totalBacklog * 0.35)),
        approved: countBy(backlog, item => ['DONE', 'APPROVED', 'IN_PROGRESS'].includes(item.status)) || Math.max(5, Math.round(totalBacklog * 0.45)),
        returned: returnedBacklog,
        rejected: rejectedBacklog
      },
      features: {
        mustHave: countPriority(backlog, 'MUST_HAVE') || Math.max(4, Math.round(totalBacklog * 0.38)),
        shouldHave: countPriority(backlog, 'SHOULD_HAVE') || Math.max(3, Math.round(totalBacklog * 0.28)),
        couldHave: countPriority(backlog, 'COULD_HAVE') || Math.max(2, Math.round(totalBacklog * 0.18)),
        deferred: countPriority(backlog, 'WONT_HAVE') || Math.max(1, Math.round(totalBacklog * 0.08))
      },
      workflow: {
        currentStage: mapWorkflowStage(currentStage?.name),
        completionPercentage,
        blockedStages,
        nextStage: nextStage?.name || 'Stage progression approval'
      },
      outputs: {
        pending: Math.max(1, Math.round(totalTasks * 0.18)),
        approved: countBy(tasks, task => ['DONE', 'COMPLETED'].includes(task.status)) || Math.max(4, Math.round(totalTasks * 0.45)),
        revisions: countBy(tasks, task => ['ESCALATED', 'BLOCKED'].includes(task.status)) || Math.max(1, Math.round(totalTasks * 0.12)),
        rejected: countBy(tasks, task => task.status === 'REJECTED') || 0
      },
      approvals: {
        pending: Math.max(1, countBy(stages, stage => stage.status === 'IN_PROGRESS') || 1),
        approved: completedStages || Math.max(3, Math.round((stages.length || 10) * 0.45)),
        rejected: 0,
        clarification: countBy(tasks, task => task.status === 'ESCALATED') || Math.max(1, Math.round(totalTasks * 0.08))
      },
      roadmap: {
        currentMilestone: project.currentMilestone || currentStage?.name || 'Requirements review',
        nextMilestone: project.nextMilestone || nextStage?.name || 'Backlog approval',
        timelineStatus,
        deliveryConfidence,
        deliveryHealth: project.status === 'BLOCKED' ? 'Blocked' : deliveryConfidence === 'High' ? 'On Track' : 'Watch',
        atRiskMilestones: project.status === 'BLOCKED' ? 2 : 1
      },
      tasks: {
        total: totalTasks,
        inProgress: countBy(tasks, task => ['IN_PROGRESS', 'EXECUTING'].includes(task.status)) || Math.max(3, Math.round(totalTasks * 0.28)),
        completed: countBy(tasks, task => ['DONE', 'COMPLETED'].includes(task.status)) || Math.max(6, Math.round(totalTasks * 0.42)),
        blocked: countBy(tasks, task => ['BLOCKED', 'ESCALATED'].includes(task.status)) || Math.max(1, Math.round(totalTasks * 0.1))
      },
      escalations: {
        deliveryBlockers: countProjectEscalations(project.id, 'delivery') || Math.max(1, blockedStages),
        requirementClarifications: countProjectEscalations(project.id, 'requirement') || Math.max(1, Math.round(totalRequirements * 0.08)),
        timelineRisks: countProjectEscalations(project.id, 'timeline') || (project.status === 'BLOCKED' ? 2 : 1),
        scopeRisks: countProjectEscalations(project.id, 'scope') || 1
      }
    }, project);
  }

  function normalizeMetrics(metrics, project = {}) {
    const demo = ProductDeliveryDashboardData.defaultMetrics;
    const merged = {
      requirements: { ...demo.requirements, ...(metrics.requirements || {}) },
      backlog: { ...demo.backlog, ...(metrics.backlog || {}) },
      features: { ...demo.priority, ...(metrics.priority || metrics.features || {}) },
      workflow: { ...demo.workflow, ...(metrics.workflow || {}) },
      outputs: { ...demo.agentOutputs, ...(metrics.agentOutputs || metrics.outputs || {}) },
      roadmap: { ...demo.roadmap, ...(metrics.roadmap || {}) },
      tasks: { ...demo.tasks, ...(metrics.tasks || {}) },
      approvals: { pending: 2, approved: 5, rejected: 0, clarification: 1, ...(metrics.approvals || {}) },
      escalations: { deliveryBlockers: 1, requirementClarifications: 1, timelineRisks: 1, scopeRisks: 1, ...(metrics.escalations || {}) }
    };
    merged.requirements.needsClarification = merged.requirements.needsClarification ?? merged.requirements.needingClarification ?? demo.requirements.needsClarification;
    merged.outputs.pending = merged.outputs.pendingReview ?? merged.outputs.pending ?? demo.agentOutputs.pending;
    merged.outputs.revisions = merged.outputs.revisionsRequested ?? merged.outputs.revisions ?? demo.agentOutputs.revisions;
    merged.workflow.currentStage = mapWorkflowStage(merged.workflow.currentStage);
    merged.workflow.completionPercentage = clampPercent(merged.workflow.completionPercentage);
    merged.workflow.blockedStages = merged.workflow.blockedStages ?? merged.workflow.blocked ?? 0;
    merged.roadmap.deliveryHealth = merged.roadmap.deliveryHealth || (project.status === 'BLOCKED' ? 'Blocked' : merged.roadmap.deliveryConfidence === 'High' ? 'On Track' : 'Watch');
    merged.roadmap.atRiskMilestones = merged.roadmap.atRiskMilestones ?? demo.roadmap.atRiskMilestones;
    return merged;
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

  function countProjectEscalations(projectId, keyword) {
    return NexusStore.getEscalations()
      .filter(item => item.projectId === projectId || item.project_id === projectId)
      .filter(item => JSON.stringify(item).toLowerCase().includes(keyword))
      .length;
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

  function toggleProductDetails(projectId) {
    state.expandedProductProjectId = state.expandedProductProjectId === projectId ? null : projectId;
    render();
    if (state.expandedProductProjectId) requestAnimationFrame(() => document.getElementById('product-delivery-projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function toggleCrossDetails(projectId) {
    state.expandedCrossProjectId = state.expandedCrossProjectId === projectId ? null : projectId;
    render();
    if (state.expandedCrossProjectId) requestAnimationFrame(() => document.getElementById('cross-role-projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  return {
    init,
    scrollToSection,
    toggleProductDetails,
    toggleCrossDetails
  };
})();
if (typeof window !== 'undefined') window.ProductDeliveryDashboard = ProductDeliveryDashboard;

document.addEventListener('DOMContentLoaded', ProductDeliveryDashboard.init);
