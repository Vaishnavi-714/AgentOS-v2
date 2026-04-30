// NEXUS AI Org Structure Generator — Simulates AI-driven org generation
const AIOrg = {
  // Default predefined prompt
  defaultPrompt: `Analyze the provided project requirements, domain, tech stack, modules, and uploaded client documents. Identify key functional areas, responsibilities, and required roles. Generate a hierarchical organizational structure including leadership, architecture, development, and quality assurance layers. Ensure roles align with project complexity and modules such as authentication, payments, analytics, etc. Output should be a structured multi-level execution hierarchy.`,

  // Store state
  _state: {
    uploadedFiles: [],
    currentPrompt: null,
    promptMode: 'auto', // 'auto' | 'custom'
    customPrompt: '',
    isGenerating: false,
    generationCount: 0
  },

  getState() { return this._state; },

  setState(updates) {
    Object.assign(this._state, updates);
    NexusStore.set('ai_org_state', this._state);
  },

  loadState() {
    const saved = NexusStore.get('ai_org_state');
    if (saved) Object.assign(this._state, saved);
    if (!this._state.currentPrompt) this._state.currentPrompt = this.defaultPrompt;
  },

  // File upload simulation
  addFile(file) {
    const fileEntry = {
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: file.name,
      size: file.size,
      type: file.type || this._guessType(file.name),
      uploadedAt: new Date().toISOString(),
      progress: 0,
      status: 'uploading'
    };
    this._state.uploadedFiles.push(fileEntry);
    this.setState({ uploadedFiles: this._state.uploadedFiles });
    return fileEntry;
  },

  removeFile(fileId) {
    this._state.uploadedFiles = this._state.uploadedFiles.filter(f => f.id !== fileId);
    this.setState({ uploadedFiles: this._state.uploadedFiles });
  },

  clearFiles() {
    this.setState({ uploadedFiles: [] });
  },

  _guessType(name) {
    const ext = name.split('.').pop().toLowerCase();
    const types = { pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', doc: 'application/msword', txt: 'text/plain' };
    return types[ext] || 'application/octet-stream';
  },

  // Simulate file upload progress
  simulateUpload(fileId, onProgress, onComplete) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        const file = this._state.uploadedFiles.find(f => f.id === fileId);
        if (file) { file.progress = 100; file.status = 'completed'; }
        this.setState({ uploadedFiles: this._state.uploadedFiles });
        if (onComplete) onComplete();
      } else {
        const file = this._state.uploadedFiles.find(f => f.id === fileId);
        if (file) file.progress = Math.round(progress);
        if (onProgress) onProgress(Math.round(progress));
      }
    }, 200 + Math.random() * 300);
  },

  // AI loading steps
  getLoadingSteps() {
    return [
      { text: 'Analyzing requirements...', icon: '📋', duration: 1200 },
      { text: 'Parsing client documents...', icon: '📄', duration: 1500 },
      { text: 'Identifying roles & responsibilities...', icon: '👥', duration: 1800 },
      { text: 'Designing org hierarchy...', icon: '🏗️', duration: 1400 },
      { text: 'Generating agent structure...', icon: '🤖', duration: 1600 }
    ];
  },

  // Generate org structure based on project data
  generateOrgStructure(project, isRegenerate = false) {
    const domain = project.domain || 'General';
    const modules = project.modules || [];
    const techStack = project.techStack || [];
    const docs = this._state.uploadedFiles.map(f => f.name);
    const genCount = this._state.generationCount;

    // Role database keyed by domain/module
    const domainRoles = {
      'E-Commerce': {
        leadership: ['Product Manager', 'Delivery Manager'],
        architecture: ['Chief Architect', 'Solutions Architect'],
        development: ['Full-Stack Developer', 'Frontend Developer', 'Backend Developer'],
        qa: ['QA Lead', 'Test Automation Engineer'],
        extra: { 'payments': 'Payment Integration Specialist', 'inventory': 'Inventory Systems Engineer', 'orders': 'Order Fulfillment Analyst', 'auth': 'Identity & Access Specialist', 'notifications': 'Notification Service Developer', 'analytics': 'Data Analytics Engineer', 'search': 'Search & Discovery Engineer', 'shipping': 'Logistics Integration Specialist' }
      },
      'Healthcare': {
        leadership: ['Clinical Product Manager', 'Compliance Officer'],
        architecture: ['Health IT Architect', 'Integration Architect'],
        development: ['Backend Developer', 'Frontend Developer', 'FHIR Specialist'],
        qa: ['QA Lead', 'Security Compliance Tester'],
        extra: { 'patients': 'Patient Data Specialist', 'appointments': 'Scheduling System Developer', 'telemedicine': 'Telehealth Integration Engineer', 'billing': 'Medical Billing Developer', 'auth': 'HIPAA Compliance Specialist', 'records': 'EHR Integration Engineer' }
      },
      'Finance': {
        leadership: ['Product Manager', 'Risk & Compliance Lead'],
        architecture: ['Security Architect', 'Platform Architect'],
        development: ['Backend Developer', 'Frontend Developer', 'Smart Contract Developer'],
        qa: ['QA Lead', 'Security Pen Tester'],
        extra: { 'payments': 'Payment Processing Specialist', 'auth': 'KYC/AML Specialist', 'transactions': 'Transaction Engine Developer', 'reporting': 'Financial Reporting Analyst', 'audit': 'Audit Trail Engineer' }
      },
      'Education': {
        leadership: ['Product Manager', 'Learning Experience Designer'],
        architecture: ['Platform Architect', 'Content Delivery Architect'],
        development: ['Full-Stack Developer', 'Frontend Developer', 'Content System Developer'],
        qa: ['QA Lead', 'Accessibility Tester'],
        extra: { 'courses': 'Course Management Developer', 'assessments': 'Assessment Engine Specialist', 'auth': 'Student Auth Specialist', 'notifications': 'Student Engagement Developer', 'analytics': 'Learning Analytics Engineer' }
      },
      'SaaS': {
        leadership: ['Product Manager', 'Growth Lead'],
        architecture: ['Cloud Architect', 'API Platform Architect'],
        development: ['Backend Developer', 'Frontend Developer', 'DevOps Engineer'],
        qa: ['QA Lead', 'Performance Test Engineer'],
        extra: { 'auth': 'Multi-Tenant Auth Specialist', 'billing': 'Subscription & Billing Developer', 'analytics': 'Product Analytics Engineer', 'notifications': 'Webhook & Events Developer', 'api': 'API Gateway Specialist' }
      }
    };

    const roles = domainRoles[domain] || domainRoles['SaaS'];
    const icons = {
      'Product Manager': '📋', 'Delivery Manager': '📊', 'Clinical Product Manager': '🏥',
      'Compliance Officer': '🛡️', 'Risk & Compliance Lead': '⚖️', 'Growth Lead': '📈',
      'Learning Experience Designer': '🎓', 'Chief Architect': '🏛️', 'Solutions Architect': '🧩',
      'Health IT Architect': '🔬', 'Integration Architect': '🔗', 'Security Architect': '🔐',
      'Platform Architect': '☁️', 'Cloud Architect': '☁️', 'API Platform Architect': '🌐',
      'Content Delivery Architect': '📡', 'Full-Stack Developer': '💻', 'Frontend Developer': '🎨',
      'Backend Developer': '⚙️', 'FHIR Specialist': '🏥', 'Smart Contract Developer': '📜',
      'Content System Developer': '📚', 'DevOps Engineer': '🔧', 'QA Lead': '🔍',
      'Test Automation Engineer': '🧪', 'Security Compliance Tester': '🛡️', 'Security Pen Tester': '🔓',
      'Accessibility Tester': '♿', 'Performance Test Engineer': '⚡'
    };

    // Build levels
    const levels = [
      {
        id: 'lvl_ai_1',
        label: 'Human Orchestrator',
        agents: [{ agent_id: '_human_', name: '👤 Human Orchestrator', icon: '👤', role: 'Final Authority' }]
      },
      {
        id: 'lvl_ai_2',
        label: 'Leadership',
        agents: roles.leadership.map((r, i) => ({
          agent_id: 'ai_lead_' + i + '_' + Date.now(),
          name: r, icon: icons[r] || '📋', role: r,
          _aiGenerated: true
        }))
      },
      {
        id: 'lvl_ai_3',
        label: 'Architecture',
        agents: roles.architecture.map((r, i) => ({
          agent_id: 'ai_arch_' + i + '_' + Date.now(),
          name: r, icon: icons[r] || '🧩', role: r,
          _aiGenerated: true
        }))
      }
    ];

    // Development level — base + module-specific roles
    const devAgents = roles.development.map((r, i) => ({
      agent_id: 'ai_dev_' + i + '_' + Date.now(),
      name: r, icon: icons[r] || '💻', role: r,
      _aiGenerated: true
    }));

    // Add module-specific specialists
    modules.forEach((mod, i) => {
      const modKey = mod.toLowerCase().trim();
      if (roles.extra[modKey]) {
        devAgents.push({
          agent_id: 'ai_spec_' + i + '_' + Date.now(),
          name: roles.extra[modKey],
          icon: icons[roles.extra[modKey]] || '🔧',
          role: roles.extra[modKey],
          _aiGenerated: true,
          _module: modKey
        });
      }
    });

    levels.push({
      id: 'lvl_ai_4',
      label: 'Development & Specialists',
      agents: devAgents
    });

    // QA level
    levels.push({
      id: 'lvl_ai_5',
      label: 'Quality Assurance & Release',
      agents: roles.qa.map((r, i) => ({
        agent_id: 'ai_qa_' + i + '_' + Date.now(),
        name: r, icon: icons[r] || '🔍', role: r,
        _aiGenerated: true
      }))
    });

    // On regeneration, add slight variations
    if (isRegenerate && genCount > 0) {
      const variations = [
        { name: 'Technical Writer', icon: '📝', role: 'Technical Writer' },
        { name: 'Release Manager', icon: '🚀', role: 'Release Manager' },
        { name: 'Data Engineer', icon: '🗄️', role: 'Data Engineer' },
        { name: 'UX Researcher', icon: '🔬', role: 'UX Researcher' },
        { name: 'Security Analyst', icon: '🛡️', role: 'Security Analyst' },
        { name: 'Performance Engineer', icon: '⚡', role: 'Performance Engineer' }
      ];
      // Pick 1-2 random variations
      const picks = [];
      const shuffled = variations.sort(() => Math.random() - 0.5);
      picks.push(shuffled[0]);
      if (genCount > 1) picks.push(shuffled[1]);

      picks.forEach((v, i) => {
        const targetLevel = Math.random() > 0.5 ? 3 : 4; // dev or qa level
        levels[targetLevel].agents.push({
          agent_id: 'ai_var_' + i + '_' + Date.now(),
          name: v.name, icon: v.icon, role: v.role,
          _aiGenerated: true, _variation: true
        });
      });
    }

    this._state.generationCount++;
    this.setState({ generationCount: this._state.generationCount });

    return {
      levels,
      metadata: {
        domain, modules, techStack, docs,
        generatedAt: new Date().toISOString(),
        prompt: this._state.promptMode === 'custom' ? this._state.customPrompt : this._state.currentPrompt,
        isRegenerate,
        generationCount: this._state.generationCount
      }
    };
  },

  // System messages for AI simulation
  getSystemMessages() {
    return [
      { text: '📥 Requirements received', delay: 500 },
      { text: '📄 Documents analyzed successfully', delay: 2500 },
      { text: '🧠 Using generation prompt', delay: 4500 },
      { text: '✅ Org structure generated', delay: 7000 }
    ];
  }
};
