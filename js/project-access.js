const PROJECT_ROLE_LABELS = [
  'Executive & Strategic',
  'Governance & Admin',
  'Product & Delivery',
  'Technical Execution',
  'QA / Testing',
  'Release / DevOps',
  'Workspace / Universal'
];

function projectRoleValue(label) {
  return label.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/(^_|_$)/g, '');
}

const ProjectAccessUI = {
  roles: PROJECT_ROLE_LABELS.map(label => ({ value: projectRoleValue(label), label })),

  legacyRoleMap: {
    'Executive & Strategic': 'EXECUTIVE_STRATEGIC',
    'Governance & Admin': 'GOVERNANCE_ADMIN',
    'Product & Delivery': 'PRODUCT_DELIVERY',
    'Technical Execution': 'TECHNICAL_EXECUTION',
    'QA / Testing': 'QA_TESTING',
    'Release / DevOps': 'RELEASE_DEVOPS',
    'Workspace / Universal': 'WORKSPACE_UNIVERSAL'
  },

  esc(value) {
    const div = document.createElement('div');
    div.textContent = value || '';
    return div.innerHTML;
  },

  roleLabel(value) {
    const normalized = this.normalizeProjectRole(value);
    return this.roles.find(role => role.value === normalized)?.label || '';
  },

  normalizeProjectRole(value) {
    if (!value) return '';
    if (this.roles.some(role => role.value === value)) return value;
    if (this.legacyRoleMap[value]) return this.legacyRoleMap[value];
    return '';
  },

  isVisibleField(field) {
    if (!field) return false;
    if (field.type === 'hidden') return false;
    if (field.hidden) return false;
    if (field.closest('[hidden], [aria-hidden="true"]')) return false;
    return field.offsetParent !== null || field.getClientRects().length > 0;
  },

  getCurrentTenantId() {
    const tenant = TenantState.getCurrentTenant();
    return tenant?.tenant_id || tenant?.id || 'TNT-001';
  },

  getTenantUsers() {
    return TenantState.getTenantUsers(this.getCurrentTenantId())
      .filter(user => user.invitationStatus !== 'expired');
  },

  getVisibleProjects() {
    return NexusPermissions.getVisibleProjects(NexusStore.getProjects());
  },

  projectCreateDeniedMessage: 'Only Tenant Admins or Admins can create projects.',

  tenantRoleLabel(user) {
    if (!user) return 'Member';
    if (typeof NexusPermissions !== 'undefined' && NexusPermissions.isTenantAdmin(user)) {
      return NexusPermissions.getTenantRole(user) === 'tenant_admin' ? 'Tenant Admin' : 'Admin';
    }
    return 'Member';
  },

  applyProjectPageChrome() {
    const canCreate = NexusPermissions.canCreateProject();
    document.querySelectorAll('[data-create-project-action]').forEach(el => {
      el.disabled = !canCreate;
      el.classList.toggle('disabled', !canCreate);
      if (canCreate) el.removeAttribute('title');
      else el.setAttribute('title', this.projectCreateDeniedMessage);
    });
  },

  guardCreateProject() {
    if (NexusPermissions.canCreateProject()) return true;
    showToast(this.projectCreateDeniedMessage, 'error');
    return false;
  },

  syncCreateProjectEntryPoints(hasProjects) {
    const canCreate = NexusPermissions.canCreateProject();
    document.querySelectorAll('[data-create-project-action="header"]').forEach(button => {
      button.style.display = hasProjects ? '' : 'none';
      button.disabled = !canCreate;
      button.classList.toggle('disabled', !canCreate);
      if (canCreate) button.removeAttribute('title');
      else button.setAttribute('title', this.projectCreateDeniedMessage);
    });
  },

  syncProjectSelectorVisibility(hasProjects) {
    document.querySelectorAll('#projectSelectorContainer').forEach(container => {
      container.style.display = hasProjects ? 'inline-block' : 'none';
    });
  },

  renderCreateProjectMembers(containerId = 'projectMemberAssignments') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const users = this.getTenantUsers();
    const current = TenantState.getCurrentTenantUser();
    container.innerHTML = `
      <div class="form-group">
        <label class="form-label">Assign Existing Tenant Users</label>
        <div class="permission-note">Select tenant users and assign exactly one project role. Roles are scoped only to this project.</div>
        <div class="rt-validation err project-assignment-error" style="display:none">Select at least one tenant user.</div>
        <div class="table-container">
          <table>
            <thead><tr><th>Assign</th><th>User</th><th>Tenant Role</th><th>Project Role</th></tr></thead>
            <tbody>
              ${users.map(user => {
                const checked = current && user.id === current.id ? 'checked' : '';
                const defaultRole = checked ? 'WORKSPACE_UNIVERSAL' : '';
                return `<tr>
                  <td><input type="checkbox" class="project-create-user" data-user-id="${user.id}" ${checked} onchange="ProjectAccessUI.handleCreateAssignmentToggle(this)"></td>
                  <td><strong>${this.esc(user.name)}</strong><br><span style="font-size:11px;color:var(--text-muted)">${this.esc(user.email)}</span></td>
                  <td><span class="tag">${this.esc(this.tenantRoleLabel(user))}</span></td>
                  <td>
                    ${this.renderRoleSelect('create', user.id, defaultRole, !checked)}
                    <div class="rt-validation err project-role-error" data-user-id="${user.id}" style="display:none">Select project role.</div>
                  </td>
                </tr>`;
              }).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No tenant users available</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderRoleSelect(scope, userId, selected = '', disabled = false) {
    const value = this.normalizeProjectRole(selected);
    return `
      <select class="form-select ${scope}-project-role" data-user-id="${userId}" ${disabled ? 'disabled' : ''} onchange="ProjectAccessUI.clearRoleError('${userId}')">
        <option value="">Select project role</option>
        ${this.roles.map(role => `<option value="${role.value}" ${role.value === value ? 'selected' : ''}>${this.esc(role.label)}</option>`).join('')}
      </select>
    `;
  },

  handleCreateAssignmentToggle(input) {
    const container = input.closest('#projectMemberAssignments') || document;
    const select = container.querySelector(`.create-project-role[data-user-id="${input.dataset.userId}"]`);
    if (!select) return;
    select.disabled = !input.checked;
    const assignmentError = container.querySelector('.project-assignment-error');
    if (assignmentError && input.checked) assignmentError.style.display = 'none';
    if (!input.checked) {
      select.value = '';
      this.clearRoleError(input.dataset.userId);
    }
  },

  clearRoleError(userId) {
    document.querySelectorAll(`.project-role-error[data-user-id="${userId}"]`).forEach(error => {
      error.style.display = 'none';
    });
  },

  getCreateProjectAssignments(containerId = 'projectMemberAssignments') {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const users = this.getTenantUsers();
    return [...container.querySelectorAll('.project-create-user:checked')].map(input => {
      const user = users.find(u => u.id === input.dataset.userId);
      const projectRole = container.querySelector(`.create-project-role[data-user-id="${input.dataset.userId}"]`)?.value || '';
      return {
        userId: input.dataset.userId,
        projectId: '',
        name: user?.name || '',
        email: user?.email || '',
        tenantRole: this.tenantRoleLabel(user),
        projectRole
      };
    });
  },

  validateCreateProjectAssignments(containerId = 'projectMemberAssignments') {
    const container = document.getElementById(containerId);
    if (!container) return { valid: true, assignments: [] };
    container.querySelectorAll('.project-role-error').forEach(error => { error.style.display = 'none'; });
    const assignmentError = container.querySelector('.project-assignment-error');
    if (assignmentError) assignmentError.style.display = 'none';
    const checked = [...container.querySelectorAll('.project-create-user:checked')];
    if (!checked.length) {
      if (assignmentError) assignmentError.style.display = 'flex';
      return { valid: false, assignments: [] };
    }
    let valid = true;
    checked.forEach(input => {
      const select = container.querySelector(`.create-project-role[data-user-id="${input.dataset.userId}"]`);
      const role = this.normalizeProjectRole(select?.value || '');
      if (!role) {
        valid = false;
        const error = container.querySelector(`.project-role-error[data-user-id="${input.dataset.userId}"]`);
        if (error) {
          error.textContent = 'Select a project role for each assigned user.';
          error.style.display = 'flex';
        }
      } else {
        select.value = role;
      }
    });
    return { valid, assignments: valid ? this.getCreateProjectAssignments(containerId) : [] };
  },

  setCreateProjectFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    let error = document.getElementById(`${fieldId}Error`);
    if (!error) {
      error = document.createElement('div');
      error.id = `${fieldId}Error`;
      error.className = 'rt-validation err project-field-error';
      field.insertAdjacentElement('afterend', error);
    }
    error.textContent = message;
    error.style.display = message ? 'flex' : 'none';
  },

  clearCreateProjectFieldError(fieldId) {
    this.setCreateProjectFieldError(fieldId, '');
  },

  bindCreateProjectValidationClearing() {
    ['projName', 'projKey', 'projCode', 'projDesc', 'sowFile'].forEach(id => {
      const field = document.getElementById(id);
      if (!field || field.dataset.validationClearBound === 'true') return;
      field.dataset.validationClearBound = 'true';
      const eventName = field.type === 'file' ? 'change' : 'input';
      field.addEventListener(eventName, () => this.clearCreateProjectFieldError(id));
    });
    const container = document.getElementById('projectMemberAssignments');
    if (!container || container.dataset.validationClearBound === 'true') return;
    container.dataset.validationClearBound = 'true';
    container.addEventListener('change', event => {
      if (event.target.classList.contains('project-create-user')) {
        const assignmentError = container.querySelector('.project-assignment-error');
        if (assignmentError && container.querySelectorAll('.project-create-user:checked').length) {
          assignmentError.style.display = 'none';
        }
      }
      if (event.target.classList.contains('create-project-role')) {
        this.clearRoleError(event.target.dataset.userId);
      }
    });
  },

  validateCreateProjectForm() {
    this.bindCreateProjectValidationClearing();
    ['projName', 'projKey', 'projCode', 'projDesc', 'sowFile'].forEach(id => this.setCreateProjectFieldError(id, ''));
    const name = document.getElementById('projName')?.value.trim() || '';
    const description = document.getElementById('projDesc')?.value.trim() || '';
    const domainField = document.getElementById('projDomain');
    const domain = this.isVisibleField(domainField) ? domainField.value : 'General';
    const projectKeyField = document.getElementById('projKey') || document.getElementById('projCode');
    const projectKey = this.isVisibleField(projectKeyField) ? projectKeyField.value.trim() : '';
    const sowField = document.getElementById('sowFile');
    const sowRequired = Boolean(sowField?.dataset.required === 'true' || sowField?.closest('.form-group')?.querySelector('.form-label')?.textContent.includes('*'));
    let valid = true;
    if (!name) {
      this.setCreateProjectFieldError('projName', 'Project name is required.');
      valid = false;
    }
    if (projectKeyField && this.isVisibleField(projectKeyField) && !projectKey) {
      this.setCreateProjectFieldError(projectKeyField.id, 'Project key is required.');
      valid = false;
    }
    if (!description) {
      this.setCreateProjectFieldError('projDesc', 'Description is required.');
      valid = false;
    }
    if (domainField && this.isVisibleField(domainField) && !domain) {
      this.setCreateProjectFieldError('projDomain', 'Domain is required.');
      valid = false;
    }
    if (sowRequired && !sowField?.files?.length) {
      this.setCreateProjectFieldError('sowFile', 'SOW document is required.');
      valid = false;
    }
    const assignmentValidation = this.validateCreateProjectAssignments();
    valid = valid && assignmentValidation.valid;
    if (!valid) showToast('Please fix project creation validation errors.', 'error');
    return { valid, name, projectKey, description, domain, assignments: assignmentValidation.assignments };
  },

  renderProjectAccessPanels(projectId) {
    const project = NexusStore.getProject(projectId);
    if (!project) return;
    this.renderProjectSetup(project);
    this.renderProjectTeamRoles(project);
  },

  setupText(project, type) {
    if (type === 'org') {
      const saved = NexusStore.getProjectOrgStructure(project.id);
      if (project.orgStructure) return project.orgStructure;
      if (saved?.summary) return saved.summary;
      if (Array.isArray(saved?.levels)) return saved.levels.map(level => level.label).join(' > ');
      return '';
    }
    if (type === 'workflows') {
      const workflows = project.selectedWorkflows?.length
        ? project.selectedWorkflows
        : NexusStore.getProjectWorkflows(project.id).map(w => w.name);
      return workflows.join('\n');
    }
    const agents = project.selectedAgents?.length
      ? project.selectedAgents
      : NexusStore.getProjectAgents(project.id).map(a => a.agent_name);
    return agents.join('\n');
  },

  renderProjectSetup(project) {
    const container = document.getElementById('projectSetupSection');
    if (!container) return;
    const canEdit = NexusPermissions.canEditProjectSetup();
    const readonly = canEdit ? '' : 'readonly';
    const disabled = canEdit ? '' : 'disabled';
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Project Setup</h3>
          ${canEdit ? '<button class="btn btn-primary btn-sm" onclick="ProjectAccessUI.saveProjectSetup()">Save Setup</button>' : ''}
        </div>
        ${canEdit ? '' : '<div class="permission-note">Only admins can edit this section.</div>'}
        <div class="project-access-grid">
          <div class="project-access-panel">
            <h4>Org Structure</h4>
            <textarea id="projectOrgInput" class="form-textarea" ${readonly}>${this.esc(this.setupText(project, 'org'))}</textarea>
          </div>
          <div class="project-access-panel">
            <h4>Workflows</h4>
            <textarea id="projectWorkflowsInput" class="form-textarea" ${readonly}>${this.esc(this.setupText(project, 'workflows'))}</textarea>
          </div>
          <div class="project-access-panel">
            <h4>Agents</h4>
            <textarea id="projectAgentsInput" class="form-textarea" ${readonly}>${this.esc(this.setupText(project, 'agents'))}</textarea>
          </div>
        </div>
        ${canEdit ? '' : `<div style="margin-top:12px"><button class="btn btn-outline btn-sm" disabled ${disabled}>Read only</button></div>`}
      </div>
    `;
  },

  saveProjectSetup() {
    if (!NexusPermissions.canEditProjectSetup()) {
      showToast('Only admins can edit this section.', 'error');
      return;
    }
    const project = NexusStore.getProject(getSelectedProject());
    if (!project) return;
    const org = document.getElementById('projectOrgInput')?.value.trim() || '';
    const workflows = (document.getElementById('projectWorkflowsInput')?.value || '').split('\n').map(v => v.trim()).filter(Boolean);
    const agents = (document.getElementById('projectAgentsInput')?.value || '').split('\n').map(v => v.trim()).filter(Boolean);
    project.orgStructure = org;
    project.selectedWorkflows = workflows;
    project.selectedAgents = agents;
    project.updatedAt = new Date().toISOString();
    NexusStore.saveProject(project);
    const savedOrg = NexusStore.getProjectOrgStructure(project.id) || {};
    NexusStore.setProjectOrgStructure(project.id, { ...savedOrg, summary: org, updatedAt: project.updatedAt });
    NexusStore.setProjectWorkflows(project.id, workflows.map((name, index) => ({
      id: `WF-${project.id}-${index + 1}`,
      name,
      trigger: index === 0 ? 'Manual' : 'On Milestone',
      status: 'ACTIVE'
    })));
    NexusStore.setProjectAgents(project.id, agents.map((name, index) => ({
      agent_id: `agent_${project.id}_${index + 1}`,
      agent_name: name,
      role: name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''),
      status: 'ACTIVE',
      lifecycle: 'CONFIGURED',
      module_scope: 'global',
      _projectId: project.id
    })));
    showToast('Project setup saved', 'success');
  },

  renderProjectTeamRoles(project) {
    const container = document.getElementById('projectTeamRolesSection');
    if (!container) return;
    const canEdit = NexusPermissions.canAssignProjectRoles();
    const users = this.getTenantUsers();
    const assignments = Array.isArray(project.members) ? project.members : [];
    const assignmentByUser = Object.fromEntries(assignments.map(a => [a.userId, a]));
    const rows = (canEdit ? users : users.filter(u => assignmentByUser[u.id])).map(user => {
      const assignment = assignmentByUser[user.id];
      const projectRole = this.normalizeProjectRole(assignment?.projectRole || assignment?.projectRoles?.[0]);
      return `<tr>
        <td>${canEdit ? `<input type="checkbox" class="project-team-user" data-user-id="${user.id}" ${assignment ? 'checked' : ''} onchange="ProjectAccessUI.handleTeamAssignmentToggle(this)">` : ''}</td>
        <td><strong>${this.esc(user.name)}</strong><br><span style="font-size:11px;color:var(--text-muted)">${this.esc(user.email)}</span></td>
        <td><span class="tag">${this.esc(this.tenantRoleLabel(user))}</span></td>
        <td>${canEdit ? this.renderRoleSelect('team', user.id, projectRole, !assignment) : `<span class="tag">${this.esc(this.roleLabel(projectRole))}</span>`}</td>
      </tr>`;
    }).join('');

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Project Roles</h3>
          ${canEdit ? '<button class="btn btn-primary btn-sm" onclick="ProjectAccessUI.saveProjectTeamRoles()">Save Roles</button>' : ''}
        </div>
        ${canEdit ? '' : '<div class="permission-note">Only admins can edit project role assignments.</div>'}
        <div class="table-container">
          <table>
            <thead><tr><th>Assigned</th><th>User</th><th>Tenant Role</th><th>Project Role</th></tr></thead>
            <tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No assigned users</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  saveProjectTeamRoles() {
    if (!NexusPermissions.canAssignProjectRoles()) {
      showToast('Only admins can assign project roles.', 'error');
      return;
    }
    const project = NexusStore.getProject(getSelectedProject());
    if (!project) return;
    const users = this.getTenantUsers();
    const assignments = [...document.querySelectorAll('.project-team-user:checked')].map(input => {
      const user = users.find(u => u.id === input.dataset.userId);
      const projectRole = document.querySelector(`.team-project-role[data-user-id="${input.dataset.userId}"]`)?.value || 'WORKSPACE_UNIVERSAL';
      return {
        userId: input.dataset.userId,
        projectId: project.id,
        email: user?.email || '',
        name: user?.name || '',
        tenantRole: this.tenantRoleLabel(user),
        projectRole
      };
    });
    project.members = assignments;
    project.updatedAt = new Date().toISOString();
    NexusStore.saveProject(project);
    showToast('Project roles saved', 'success');
    this.renderProjectTeamRoles(project);
  },

  handleTeamAssignmentToggle(input) {
    const select = document.querySelector(`.team-project-role[data-user-id="${input.dataset.userId}"]`);
    if (!select) return;
    select.disabled = !input.checked;
    if (!input.checked) select.value = '';
  }
};
