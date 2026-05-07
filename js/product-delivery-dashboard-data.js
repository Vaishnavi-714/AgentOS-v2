const ProductDeliveryDashboardData = {
  defaultMetrics: {
    requirements: {
      total: 22,
      pendingReview: 6,
      needsClarification: 3,
      readyForBacklog: 13,
      convertedToBacklog: 9
    },
    backlog: {
      generated: 38,
      pendingApproval: 13,
      approved: 17,
      returned: 3,
      rejected: 5
    },
    priority: {
      mustHave: 14,
      shouldHave: 11,
      couldHave: 7,
      deferred: 3
    },
    workflow: {
      currentStage: 'Requirement Review',
      completionPercentage: 42,
      blockedStages: 0,
      nextStage: 'Backlog Approval'
    },
    agentOutputs: {
      pending: 5,
      pendingReview: 5,
      approved: 12,
      revisions: 3,
      revisionsRequested: 3,
      rejected: 0
    },
    roadmap: {
      currentMilestone: 'Requirements Review',
      nextMilestone: 'Backlog Approval',
      timelineStatus: 'Monitoring',
      deliveryConfidence: 'Medium',
      deliveryHealth: 'Watch',
      atRiskMilestones: 1
    },
    tasks: {
      total: 26,
      inProgress: 7,
      completed: 11,
      blocked: 3
    }
  },

  crossRoleMeta: {
    EXECUTIVE_STRATEGIC: {
      dashboardCluster: 'Executive & Strategic Dashboard',
      personas: ['CTO', 'CIO', 'VP Engineering', 'Client Sponsor', 'Department Head'],
      defaultPersona: 'CTO',
      tasksInvolved: ['Review KPIs', 'Analyze risks', 'Review delivery metrics', 'Approve strategic decisions', 'Monitor ROI'],
      details: {
        focusArea: 'Strategic reports, performance dashboards, governance summaries, enterprise metrics',
        outcome: 'Business alignment, strategic governance, investment oversight'
      },
      summary: [
        ['KPI review status', 'Current KPI review is ready for leadership review'],
        ['Risk status', 'Strategic risks are visible with ownership'],
        ['Delivery metric visibility', 'Delivery health and milestone signals are available'],
        ['ROI status', 'Investment outcome tracking remains visible']
      ]
    },
    GOVERNANCE_ADMIN: {
      dashboardCluster: 'Governance & Admin Dashboard',
      personas: ['Human Orchestrator', 'Governance Admin', 'Compliance Officer', 'Audit Manager', 'Security Lead'],
      defaultPersona: 'Governance Admin',
      tasksInvolved: ['Manage users and roles', 'Monitor logs', 'Review escalations', 'Approve critical decisions', 'Audit compliance'],
      details: {
        focusArea: 'Permissions, escalation queues, audit logs, governance rules, compliance reports',
        outcome: 'Controlled operations, security, compliance enforcement'
      },
      summary: [
        ['Logs monitored', 'Audit and activity logs are under review'],
        ['Escalations reviewed', 'Escalation queue is visible for governance decisions'],
        ['Compliance status', 'Compliance checkpoints remain tracked'],
        ['Critical approvals pending', 'Critical approval items are routed for action']
      ]
    },
    TECHNICAL_EXECUTION: {
      dashboardCluster: 'Technical Execution Dashboard',
      personas: ['Developer', 'Architect', 'Tech Lead', 'Engineering Manager'],
      defaultPersona: 'Tech Lead',
      tasksInvolved: ['Review assigned tasks', 'Access specs and architecture', 'Execute development', 'Collaborate with agents', 'Submit outputs', 'Escalate complex decisions'],
      details: {
        focusArea: 'Task boards, module breakdown, architecture docs, implementation tools',
        outcome: 'Efficient software development, technical consistency'
      },
      summary: [
        ['Assigned tasks', 'Technical work items are assigned and visible'],
        ['Architecture/spec status', 'Specs and architecture context are available'],
        ['Development progress', 'Implementation progress is tracked by task state'],
        ['Complex decisions escalated', 'Complex technical decisions are escalated when needed']
      ]
    },
    QA_TESTING: {
      dashboardCluster: 'QA / Testing Dashboard',
      personas: ['QA Lead', 'QA Engineer', 'Test Manager', 'Client QA Team'],
      defaultPersona: 'QA Lead',
      tasksInvolved: ['Review generated test cases', 'Execute and monitor testing', 'Validate results', 'Flag defects', 'Approve quality gates', 'Review release readiness'],
      details: {
        focusArea: 'Test suites, pass/fail reports, defect logs, quality metrics',
        outcome: 'Product quality assurance, defect prevention'
      },
      summary: [
        ['Test cases reviewed', 'Generated tests are queued for QA validation'],
        ['Defects flagged', 'Defects are tracked with severity and owner'],
        ['Quality gate status', 'Quality gates remain visible before progression'],
        ['Release readiness', 'Readiness review is summarized for delivery decisions']
      ]
    },
    RELEASE_DEVOPS: {
      dashboardCluster: 'Release / DevOps Dashboard',
      personas: ['Release Manager', 'DevOps Lead', 'Security Ops', 'Infrastructure Team'],
      defaultPersona: 'Release Manager',
      tasksInvolved: ['Review build status', 'Validate infrastructure', 'Manage deployment pipelines', 'Approve releases', 'Monitor rollouts', 'Handle rollbacks'],
      details: {
        focusArea: 'CI/CD controls, deployment health, release sequencing, rollback tools',
        outcome: 'Safe, governed releases'
      },
      summary: [
        ['Build status', 'Build state is visible for release planning'],
        ['Infrastructure validation', 'Infrastructure validation is tracked before release'],
        ['Release approval status', 'Release approvals are tracked before rollout'],
        ['Rollout status', 'Rollout progress is monitored by environment']
      ]
    },
    WORKSPACE_UNIVERSAL: {
      dashboardCluster: 'Workspace / Universal Dashboard',
      personas: ['Operational User', 'Internal Team Member', 'Client Team Member'],
      defaultPersona: 'Operational User',
      tasksInvolved: ['View overall project status', 'Track progress', 'Monitor notifications', 'Access agent collaboration', 'Review activities', 'Navigate to role-specific modules'],
      details: {
        focusArea: 'Unified workspace, alerts, project timeline, agent activity feed',
        outcome: 'Cross-team visibility, collaboration, operational awareness'
      },
      summary: [
        ['Notifications monitored', 'Important project notifications are summarized'],
        ['Activity review status', 'Recent activities are visible for project context'],
        ['Agent collaboration summary', 'Agent collaboration context is available'],
        ['Overall progress', 'Overall project progress remains visible']
      ]
    }
  },

  blockerOptions: [
    'None',
    'Waiting for QA',
    'Requirement clarification',
    'Pending architecture review',
    'Release approval pending',
    'Infrastructure validation pending'
  ],

  deliveryConfidence(project, pipeline) {
    if (project.status === 'BLOCKED') return 'At Risk';
    if (pipeline?.status === 'COMPLETED' || project.pipelineStatus === 'COMPLETED') return 'High';
    if (pipeline?.status === 'IN_PROGRESS' || project.status === 'IN_PROGRESS') return 'Medium';
    return 'Medium';
  }
};
if (typeof window !== 'undefined') window.ProductDeliveryDashboardData = ProductDeliveryDashboardData;
