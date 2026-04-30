import re

with open('workspace/dashboard.html', 'r') as f:
    content = f.read()

# 1. Title
content = content.replace('<title>NEXUS — Projects</title>', '<title>NEXUS — Dashboard & Projects</title>')

# 2. Header
header_old = """    <div class="page-header">
      <div>
        <h1 class="page-title">Projects</h1>
        <p class="page-subtitle">Manage projects, requirements, backlog, tasks, and timelines</p>
      </div>
      <div class="page-actions">
        <div id="projectSelectorContainer" style="display:inline-block"></div>
        <button class="btn btn-primary" onclick="openModal('createProjectModal')">+ New Project</button>
      </div>
    </div>"""

header_new = """    <div class="page-header">
      <div>
        <h1 class="page-title">Projects Hub</h1>
        <p class="page-subtitle">Manage your software projects, track progress, and view analytics</p>
      </div>
      <div class="page-actions">
        <div id="projectSelectorContainer" style="display:inline-block"></div>
        <button class="btn btn-primary" onclick="openModal('createProjectModal')">+ New Project</button>
        <button class="btn btn-outline btn-sm" onclick="resetData()">Reset Demo Data</button>
      </div>
    </div>"""
content = content.replace(header_old, header_new)

# 3. Tabs
tabs_old = """    <!-- Tabs -->
    <div class="tabs" data-tab-group="projects">
      <a href="#projectListing-section" class="tab nav-link active">📂 Projects</a>
      <a href="#projectOverview-section" class="tab nav-link">📋 Overview</a>
      <a href="#requirements-section" class="tab nav-link">📄 Requirements</a>
      <a href="#backlog-section" class="tab nav-link">📝 Backlog</a>
      <a href="#tasks-section" class="tab nav-link">✅ Tasks</a>
      <a href="#timeline-section" class="tab nav-link">📅 Timeline</a>
      <a href="#pipeline-section" class="tab nav-link">⚙️ Pipeline</a>
    </div>"""

tabs_new = """    <!-- Tabs -->
    <div class="tabs" data-tab-group="projects">
      <a href="#overview-section" class="tab nav-link active">📊 Overview</a>
      <a href="#projectListing-section" class="tab nav-link">📂 Projects</a>
      <a href="#activity-section" class="tab nav-link">📜 Activity</a>
      <a href="#projectOverview-section" class="tab nav-link">📋 Project Details</a>
      <a href="#requirements-section" class="tab nav-link">📄 Requirements</a>
      <a href="#backlog-section" class="tab nav-link">📝 Backlog</a>
      <a href="#tasks-section" class="tab nav-link">✅ Tasks</a>
      <a href="#timeline-section" class="tab nav-link">📅 Timeline</a>
      <a href="#pipeline-section" class="tab nav-link">⚙️ Pipeline</a>
    </div>"""
content = content.replace(tabs_old, tabs_new)

# 4. Sections
section_old = """    <!-- Projects Listing -->
    <div class="tab-content active" id="projectListing-section">
      <div class="grid grid-4" id="projStatsGrid" style="margin-bottom:20px"></div>
      <div id="projectCards"></div>
    </div>"""

section_new = """    <!-- Overview (Global Stats) -->
    <div class="tab-content active" id="overview-section">
      <div class="grid grid-4" id="projStatsGrid" style="margin-bottom:20px"></div>
    </div>

    <!-- Projects Listing -->
    <div class="tab-content" id="projectListing-section">
      <div id="projectCards"></div>
    </div>

    <!-- Global Activity -->
    <div class="tab-content" id="activity-section">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Recent Activity</h3></div>
        <div id="globalActivityLog" class="timeline"></div>
      </div>
    </div>"""
content = content.replace(section_old, section_new)

# 5. JS updates
js_nav_old = "createNavigation('projects');"
js_nav_new = "createNavigation('dashboard');"
content = content.replace(js_nav_old, js_nav_new)

# 6. renderAll update
renderAll_old = """    function renderAll() {
      renderProjectListing();
      renderProjectOverview();
      renderRequirements();
      renderBacklog();
      renderTasks();
      renderTimeline();
      renderPipeline();
    }"""
renderAll_new = """    function renderAll() {
      renderProjectListing();
      renderProjectOverview();
      renderRequirements();
      renderBacklog();
      renderTasks();
      renderTimeline();
      renderPipeline();
      renderGlobalActivity();
    }"""
content = content.replace(renderAll_old, renderAll_new)

# 7. renderProjectListing update
renderListing_old = """    function renderProjectListing() {
      const projects = NexusStore.getProjects();
      const agents = NexusStore.getAgents();
      const escalations = NexusStore.getEscalations();

      document.getElementById('projStatsGrid').innerHTML = `
        <div class="stat-card"><span class="stat-label">Total Projects</span><span class="stat-value">${projects.length}</span></div>
        <div class="stat-card"><span class="stat-label">Active</span><span class="stat-value">${projects.filter(p=>p.status==='ACTIVE').length}</span></div>
        <div class="stat-card"><span class="stat-label">Agents Assigned</span><span class="stat-value">${agents.filter(a=>a.status==='ACTIVE').length}</span></div>
        <div class="stat-card"><span class="stat-label">Escalations</span><span class="stat-value">${escalations.filter(e=>e.status==='PENDING').length}</span></div>
      `;"""

renderListing_new = """    function renderProjectListing() {
      const projects = NexusStore.getProjects();
      const agents = NexusStore.getAgents();
      const escalations = NexusStore.getEscalations();
      const tenant = typeof TenantState !== 'undefined' ? TenantState.getCurrentTenant() : null;
      
      const tProjects = tenant ? tenant.projects : projects.length;
      const tAgents = tenant ? tenant.agents : agents.filter(a=>a.status==='ACTIVE').length;
      const tApiUsage = tenant ? tenant.api_usage : 0;
      const limits = tenant ? TenantState.getSubscriptionLimits(tenant.subscription) : null;
      const tEscalations = tenant ? (tenant.escalations || 0) : escalations.filter(e=>e.status==='PENDING').length;

      document.getElementById('projStatsGrid').innerHTML = `
        <div class="stat-card">
          <span class="stat-label">Total Projects</span>
          <span class="stat-value">${tProjects}</span>
          <span class="stat-change up">${projects.filter(p=>p.status==='ACTIVE').length} active</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Active Agents</span>
          <span class="stat-value">${tAgents}</span>
          <span class="stat-change">${limits ? limits.agents + ' limit' : agents.length + ' total'}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">API Usage</span>
          <span class="stat-value" style="color: ${tApiUsage > (limits ? limits.api * 0.8 : 99999) ? 'var(--warning)' : 'var(--text-primary)'}">${tApiUsage.toLocaleString()}</span>
          <span class="stat-change">${limits ? limits.api.toLocaleString() + ' limit' : 'N/A'}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Escalations</span>
          <span class="stat-value" style="color: ${tEscalations > 0 ? 'var(--warning)' : 'var(--text-primary)'}">${tEscalations}</span>
          <span class="stat-change">${tEscalations > 0 ? 'Needs attention' : 'All clear'}</span>
        </div>
      `;"""
content = content.replace(renderListing_old, renderListing_new)

# 8. Add Reset Demo Data & Global Activity functions at the end of the script before renderAll()
funcs_to_add = """
    function renderGlobalActivity() {
      const logs = NexusStore.getLogs().slice(0, 15);
      const typeColors = { SYSTEM: 'var(--info)', AUTH: 'var(--purple)', PROJECT: 'var(--success)', PIPELINE: 'var(--accent)', AGENT: 'var(--warning)', TASK: 'var(--info)', GATE: 'var(--success)', ESCALATION: 'var(--orange)', DECISION: 'var(--purple)', REQUIREMENTS: 'var(--info)' };
      document.getElementById('globalActivityLog').innerHTML = logs.map(log => `
        <div class="timeline-item completed">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:11px; font-weight:600; color:${typeColors[log.type]||'var(--text-muted)'}; text-transform:uppercase;">${log.type}</span>
            <span style="font-size:11px; color:var(--text-muted)">${formatTime(log.timestamp)}</span>
          </div>
          <p style="font-size:13px; color:var(--text-secondary)">${escapeHtml(log.message)}</p>
        </div>
      `).join('') || '<p style="color:var(--text-muted);font-size:13px">No recent activity.</p>';
    }

    function resetData() {
      if (confirm('Reset all data to initial demo state?')) {
        NexusStore.clearAll();
        const _role = localStorage.getItem("role");
        if (_role !== "tenant") { window.location.href = "../index.html"; return; }
        seedNexusData();
        showToast('Data reset to demo state', 'info');
        renderAll();
      }
    }
"""
content = content.replace("    renderAll();\n  </script>", funcs_to_add + "\n    renderAll();\n  </script>")

with open('workspace/dashboard.html', 'w') as f:
    f.write(content)

