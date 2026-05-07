const ProductDeliveryDashboardData = {

  /* ===== PROJECT-SPECIFIC DATA MODEL ===== */
  productDeliveryProjects: [
    {
      id: "almora",
      name: "ALMora",
      description: "Project delivery workspace for requirement intake, prioritization, and execution governance.",
      startedDate: "May 7, 2026",
      deliveryDate: "Aug 5, 2026",
      status: "Created",
      deliveryHealth: "Watch",
      currentUserRole: "Product & Delivery",
      teamMembers: [
        { name: "Vaishnavi Ranaware", role: "Product & Delivery" },
        { name: "Hitesh", role: "Technical Execution" }
      ],
      overview: {
        totalProjectsAssignedToUser: 1,
        productDeliveryProjectsCount: 1,
        crossRoleProjectsCount: 0,
        approvalsPending: 15,
        blockers: 0
      },
      deliveryFlowInsights: {
        summary: "Project-specific delivery insights for requirement intake, backlog health, workflow progress, agent review, roadmap visibility, planning, risks, and escalations.",
        keyHighlights: [
          "Backlog approval pending for 15 items",
          "Current stage: Requirement Review",
          "1 at-risk milestone",
          "3 blocked tasks",
          "Escalation queue contains 2 items"
        ]
      },
      stats: {
        requirementIntake: { totalRequirements: 25, pendingReview: 6, needsClarification: 4, readyForBacklog: 15, convertedToBacklog: 25 },
        backlogApproval: { generated: 42, pendingApproval: 15, approved: 19, returned: 3, rejected: 2 },
        featurePriority: { mustHave: 16, shouldHave: 12, couldHave: 8, deferred: 3 },
        workflowStage: {
          currentStage: "Requirement Review",
          nextStage: "Stage progression approval",
          stages: [
            { name: "Requirement Review", status: "active" },
            { name: "Backlog Generation", status: "upcoming" },
            { name: "Backlog Approval", status: "upcoming" },
            { name: "Feature Prioritization", status: "upcoming" },
            { name: "Task Planning", status: "upcoming" },
            { name: "Delivery Tracking", status: "upcoming" },
            { name: "Stage Approval", status: "upcoming" }
          ]
        },
        agentOutputReview: { pendingReview: 5, approved: 14, revisionRequested: 3, rejected: 0 },
        roadmapHealth: { currentMilestone: "Requirements review", nextMilestone: "Backlog approval", timelineStatus: "Monitoring", deliveryConfidence: "Medium", atRiskMilestones: 1 },
        taskTracking: { totalTasks: 31, inProgress: 9, completed: 13, blocked: 3 },
        sprintPlanning: { sprintName: "Sprint 12", sprintGoal: "Finalize intake and backlog readiness", sprintStart: "May 10, 2026", sprintEnd: "May 24, 2026", sprintCapacity: 40, sprintCommitted: 32, sprintCompleted: 18 },
        milestoneDashboard: { totalMilestones: 5, completed: 2, active: 2, delayed: 1 },
        resourcePlanning: { totalResources: 8, allocated: 6, available: 2, overloaded: 1 },
        dependencyMapping: { totalDependencies: 12, openDependencies: 4, blockedDependencies: 2, resolvedDependencies: 6 },
        stakeholderCommunication: { totalStakeholders: 7, updatesSent: 4, pendingUpdates: 2, meetingsScheduled: 3 },
        escalationsSummary: { totalEscalations: 2, open: 1, inReview: 1, resolved: 0, critical: 1 },
        stageGates: { totalGates: 4, approved: 1, pendingSignOff: 2, rejected: 0, comments: 3 },
        prioritizationTools: { priorityCounts: 39, featureSequencing: 8, linkedBacklogItems: 22 }
      },
      details: {
        requirements: [
          { id: "REQ-001", title: "Capture business requirements", priority: "High", status: "Pending Review", owner: "Vaishnavi", lastUpdated: "May 8, 2026" },
          { id: "REQ-002", title: "Define user personas and journeys", priority: "High", status: "Approved", owner: "Hitesh", lastUpdated: "May 7, 2026" },
          { id: "REQ-003", title: "Identify non-functional requirements", priority: "Medium", status: "Needs Clarification", owner: "Vaishnavi", lastUpdated: "May 9, 2026" }
        ],
        backlogItems: [
          { id: "BL-101", feature: "Auto backlog creation", priority: "High", approvalStatus: "Pending Approval", owner: "Product Team" },
          { id: "BL-102", feature: "Requirement traceability matrix", priority: "High", approvalStatus: "Approved", owner: "Vaishnavi" },
          { id: "BL-103", feature: "Backlog prioritization engine", priority: "Medium", approvalStatus: "Pending Approval", owner: "Product Team" }
        ],
        tasks: [
          { id: "TSK-201", taskName: "Review requirement set", assignee: "Vaishnavi", status: "In Progress", dueDate: "May 12, 2026" },
          { id: "TSK-202", taskName: "Draft backlog items from requirements", assignee: "Hitesh", status: "Completed", dueDate: "May 10, 2026" },
          { id: "TSK-203", taskName: "Validate acceptance criteria", assignee: "Vaishnavi", status: "Blocked", dueDate: "May 14, 2026" }
        ],
        workflows: [
          { stage: "Requirement Review", status: "Active", assignedAgent: "Requirement Analyzer", lastAction: "Requirements parsed", nextAction: "Approve progression" },
          { stage: "Backlog Generation", status: "Pending", assignedAgent: "Backlog Generator", lastAction: "Awaiting input", nextAction: "Generate backlog from approved requirements" }
        ],
        roadmaps: [
          { milestone: "Requirements review", dueDate: "May 15, 2026", status: "Active", owner: "Program Manager" },
          { milestone: "Backlog approval", dueDate: "May 25, 2026", status: "Upcoming", owner: "Product Team" },
          { milestone: "Sprint planning", dueDate: "Jun 1, 2026", status: "Upcoming", owner: "Scrum Master" }
        ],
        agentOutputs: [
          { id: "AO-301", agent: "Backlog Generator", outputType: "Generated backlog items", reviewStatus: "Pending Review", reviewer: "Vaishnavi" },
          { id: "AO-302", agent: "Requirement Analyzer", outputType: "Parsed requirements", reviewStatus: "Approved", reviewer: "Hitesh" }
        ],
        planningBoards: [
          { id: "PB-401", boardName: "Release Planning Board", type: "Planning", owner: "Program Manager", status: "Active" },
          { id: "PB-402", boardName: "Sprint Board", type: "Sprint", owner: "Scrum Master", status: "Active" }
        ],
        sprintPlans: [
          { sprint: "Sprint 12", goal: "Backlog readiness", plannedStoryPoints: 32, completedStoryPoints: 18, status: "In Progress" }
        ],
        milestones: [
          { id: "MS-501", name: "Backlog approval", owner: "Product Team", dueDate: "May 20, 2026", status: "Upcoming" },
          { id: "MS-502", name: "Requirements sign-off", owner: "Program Manager", dueDate: "May 15, 2026", status: "Active" }
        ],
        resources: [
          { name: "Vaishnavi", role: "Product & Delivery", allocation: "80%", capacityStatus: "Allocated" },
          { name: "Hitesh", role: "Technical Execution", allocation: "60%", capacityStatus: "Allocated" }
        ],
        dependencies: [
          { id: "DEP-601", dependency: "Architecture approval from Tech team", owner: "Tech Lead", status: "Open", impact: "Medium" },
          { id: "DEP-602", dependency: "Security review sign-off", owner: "Security Lead", status: "Open", impact: "High" }
        ],
        stakeholderCommunications: [
          { id: "COM-701", stakeholder: "Client Product Owner", communicationType: "Weekly Update", status: "Sent", nextUpdate: "May 14, 2026" },
          { id: "COM-702", stakeholder: "Engineering Lead", communicationType: "Standup", status: "Scheduled", nextUpdate: "May 12, 2026" }
        ],
        escalations: [
          { id: "ESC-801", title: "Backlog approval delay", severity: "Critical", status: "Open", raisedBy: "Vaishnavi", owner: "Governance Admin", createdOn: "May 9, 2026", resolutionEta: "May 12, 2026", notes: "Backlog approvals are blocked due to incomplete clarifications." },
          { id: "ESC-802", title: "Dependency on technical architecture sign-off", severity: "Medium", status: "In Review", raisedBy: "Program Manager", owner: "Technical Lead", createdOn: "May 10, 2026", resolutionEta: "May 15, 2026", notes: "Task planning is impacted by pending architecture sign-off." }
        ],
        stageGates: [
          { id: "SG-901", gate: "Requirements Gate", approvalStatus: "Approved", pendingSignOffs: 0, gateOwner: "Program Manager", comments: "All requirements validated." },
          { id: "SG-902", gate: "Backlog Gate", approvalStatus: "Pending Sign-Off", pendingSignOffs: 2, gateOwner: "Product Owner", comments: "Awaiting backlog review completion." },
          { id: "SG-903", gate: "Sprint Gate", approvalStatus: "Pending Sign-Off", pendingSignOffs: 1, gateOwner: "Scrum Master", comments: "Sprint scope needs final confirmation." }
        ]
      }
    },
    {
      id: "nexuscore",
      name: "NexusCore",
      description: "Core platform services for multi-tenant orchestration, agent runtime, and workflow engine.",
      startedDate: "Apr 15, 2026",
      deliveryDate: "Sep 30, 2026",
      status: "In Progress",
      deliveryHealth: "Healthy",
      currentUserRole: "Product & Delivery",
      teamMembers: [
        { name: "Ananya Sharma", role: "Product & Delivery" },
        { name: "Ravi Patel", role: "Technical Execution" },
        { name: "Meera Joshi", role: "QA / Testing" }
      ],
      overview: {
        totalProjectsAssignedToUser: 2,
        productDeliveryProjectsCount: 2,
        crossRoleProjectsCount: 0,
        approvalsPending: 8,
        blockers: 1
      },
      deliveryFlowInsights: {
        summary: "NexusCore is progressing through backlog generation with strong requirement coverage. One blocker on API gateway dependency.",
        keyHighlights: [
          "38 requirements captured, 30 ready for backlog",
          "8 backlog approvals pending",
          "Current stage: Backlog Generation",
          "1 blocked dependency on API gateway",
          "Sprint 8 at 72% completion"
        ]
      },
      stats: {
        requirementIntake: { totalRequirements: 38, pendingReview: 3, needsClarification: 2, readyForBacklog: 30, convertedToBacklog: 33 },
        backlogApproval: { generated: 55, pendingApproval: 8, approved: 38, returned: 5, rejected: 1 },
        featurePriority: { mustHave: 22, shouldHave: 15, couldHave: 10, deferred: 5 },
        workflowStage: {
          currentStage: "Backlog Generation",
          nextStage: "Backlog Approval",
          stages: [
            { name: "Requirement Review", status: "done" },
            { name: "Backlog Generation", status: "active" },
            { name: "Backlog Approval", status: "upcoming" },
            { name: "Feature Prioritization", status: "upcoming" },
            { name: "Task Planning", status: "upcoming" },
            { name: "Delivery Tracking", status: "upcoming" },
            { name: "Stage Approval", status: "upcoming" }
          ]
        },
        agentOutputReview: { pendingReview: 3, approved: 22, revisionRequested: 1, rejected: 0 },
        roadmapHealth: { currentMilestone: "Backlog generation", nextMilestone: "Feature prioritization", timelineStatus: "On Track", deliveryConfidence: "High", atRiskMilestones: 0 },
        taskTracking: { totalTasks: 48, inProgress: 14, completed: 28, blocked: 2 },
        sprintPlanning: { sprintName: "Sprint 8", sprintGoal: "Complete core API modules", sprintStart: "May 5, 2026", sprintEnd: "May 19, 2026", sprintCapacity: 60, sprintCommitted: 52, sprintCompleted: 37 },
        milestoneDashboard: { totalMilestones: 8, completed: 4, active: 3, delayed: 0 },
        resourcePlanning: { totalResources: 12, allocated: 10, available: 2, overloaded: 0 },
        dependencyMapping: { totalDependencies: 18, openDependencies: 5, blockedDependencies: 1, resolvedDependencies: 12 },
        stakeholderCommunication: { totalStakeholders: 10, updatesSent: 7, pendingUpdates: 1, meetingsScheduled: 4 },
        escalationsSummary: { totalEscalations: 1, open: 1, inReview: 0, resolved: 0, critical: 0 },
        stageGates: { totalGates: 5, approved: 3, pendingSignOff: 1, rejected: 0, comments: 5 },
        prioritizationTools: { priorityCounts: 52, featureSequencing: 12, linkedBacklogItems: 38 }
      },
      details: {
        requirements: [
          { id: "REQ-101", title: "Multi-tenant data isolation", priority: "Critical", status: "Approved", owner: "Ananya", lastUpdated: "Apr 20, 2026" },
          { id: "REQ-102", title: "Agent runtime engine spec", priority: "High", status: "Approved", owner: "Ravi", lastUpdated: "Apr 22, 2026" },
          { id: "REQ-103", title: "Workflow orchestration API", priority: "High", status: "Pending Review", owner: "Ananya", lastUpdated: "May 2, 2026" },
          { id: "REQ-104", title: "Audit logging framework", priority: "Medium", status: "Approved", owner: "Meera", lastUpdated: "Apr 25, 2026" }
        ],
        backlogItems: [
          { id: "BL-201", feature: "Tenant provisioning service", priority: "Critical", approvalStatus: "Approved", owner: "Ravi" },
          { id: "BL-202", feature: "Agent lifecycle manager", priority: "High", approvalStatus: "Approved", owner: "Ananya" },
          { id: "BL-203", feature: "Workflow state machine", priority: "High", approvalStatus: "Pending Approval", owner: "Ravi" },
          { id: "BL-204", feature: "Event-driven notification bus", priority: "Medium", approvalStatus: "Pending Approval", owner: "Ananya" }
        ],
        tasks: [
          { id: "TSK-301", taskName: "Implement tenant isolation layer", assignee: "Ravi", status: "Completed", dueDate: "May 5, 2026" },
          { id: "TSK-302", taskName: "Build agent runtime scaffold", assignee: "Ravi", status: "In Progress", dueDate: "May 15, 2026" },
          { id: "TSK-303", taskName: "Design workflow orchestration", assignee: "Ananya", status: "In Progress", dueDate: "May 18, 2026" },
          { id: "TSK-304", taskName: "Write integration tests for tenant API", assignee: "Meera", status: "Blocked", dueDate: "May 20, 2026" }
        ],
        workflows: [
          { stage: "Requirement Review", status: "Completed", assignedAgent: "Requirement Analyzer", lastAction: "All requirements approved", nextAction: "N/A" },
          { stage: "Backlog Generation", status: "Active", assignedAgent: "Backlog Generator", lastAction: "Generating items from approved reqs", nextAction: "Submit for approval" }
        ],
        roadmaps: [
          { milestone: "Requirement sign-off", dueDate: "Apr 30, 2026", status: "Completed", owner: "Ananya" },
          { milestone: "Backlog generation", dueDate: "May 15, 2026", status: "Active", owner: "Product Team" },
          { milestone: "Feature prioritization", dueDate: "May 25, 2026", status: "Upcoming", owner: "Ananya" },
          { milestone: "Core API delivery", dueDate: "Jun 15, 2026", status: "Upcoming", owner: "Ravi" }
        ],
        agentOutputs: [
          { id: "AO-401", agent: "Backlog Generator", outputType: "Generated backlog items", reviewStatus: "Approved", reviewer: "Ananya" },
          { id: "AO-402", agent: "Test Case Generator", outputType: "Generated test suites", reviewStatus: "Pending Review", reviewer: "Meera" }
        ],
        planningBoards: [
          { id: "PB-501", boardName: "Platform Release Board", type: "Release", owner: "Ananya", status: "Active" },
          { id: "PB-502", boardName: "Sprint Board", type: "Sprint", owner: "Ravi", status: "Active" }
        ],
        sprintPlans: [
          { sprint: "Sprint 8", goal: "Complete core API modules", plannedStoryPoints: 52, completedStoryPoints: 37, status: "In Progress" },
          { sprint: "Sprint 7", goal: "Tenant isolation layer", plannedStoryPoints: 45, completedStoryPoints: 45, status: "Completed" }
        ],
        milestones: [
          { id: "MS-601", name: "Requirement sign-off", owner: "Ananya", dueDate: "Apr 30, 2026", status: "Completed" },
          { id: "MS-602", name: "Core API delivery", owner: "Ravi", dueDate: "Jun 15, 2026", status: "Upcoming" }
        ],
        resources: [
          { name: "Ananya", role: "Product & Delivery", allocation: "90%", capacityStatus: "Allocated" },
          { name: "Ravi", role: "Technical Execution", allocation: "100%", capacityStatus: "Overloaded" },
          { name: "Meera", role: "QA / Testing", allocation: "70%", capacityStatus: "Allocated" }
        ],
        dependencies: [
          { id: "DEP-701", dependency: "API gateway deployment", owner: "DevOps Lead", status: "Blocked", impact: "High" },
          { id: "DEP-702", dependency: "Auth service integration", owner: "Ravi", status: "Open", impact: "Medium" },
          { id: "DEP-703", dependency: "Database migration scripts", owner: "DBA", status: "Resolved", impact: "Low" }
        ],
        stakeholderCommunications: [
          { id: "COM-801", stakeholder: "CTO", communicationType: "Executive Update", status: "Sent", nextUpdate: "May 20, 2026" },
          { id: "COM-802", stakeholder: "Engineering Lead", communicationType: "Weekly Sync", status: "Scheduled", nextUpdate: "May 12, 2026" }
        ],
        escalations: [
          { id: "ESC-901", title: "API gateway deployment blocked by infra", severity: "High", status: "Open", raisedBy: "Ravi", owner: "DevOps Lead", createdOn: "May 6, 2026", resolutionEta: "May 14, 2026", notes: "Infrastructure team has not provisioned the gateway environment." }
        ],
        stageGates: [
          { id: "SG-1001", gate: "Requirements Gate", approvalStatus: "Approved", pendingSignOffs: 0, gateOwner: "Ananya", comments: "All requirements signed off." },
          { id: "SG-1002", gate: "Backlog Gate", approvalStatus: "Pending Sign-Off", pendingSignOffs: 1, gateOwner: "Product Owner", comments: "Backlog generation in progress." },
          { id: "SG-1003", gate: "Architecture Gate", approvalStatus: "Approved", pendingSignOffs: 0, gateOwner: "Chief Architect", comments: "Architecture validated." }
        ]
      }
    },
    {
      id: "insightiq",
      name: "InsightIQ",
      description: "Analytics and reporting platform for enterprise KPI tracking, dashboards, and data-driven decisions.",
      startedDate: "Mar 20, 2026",
      deliveryDate: "Jul 15, 2026",
      status: "In Progress",
      deliveryHealth: "At Risk",
      currentUserRole: "Product & Delivery",
      teamMembers: [
        { name: "Priya Menon", role: "Product & Delivery" },
        { name: "Arjun Das", role: "Technical Execution" },
        { name: "Sneha Kulkarni", role: "QA / Testing" },
        { name: "Vikram Singh", role: "Release / DevOps" }
      ],
      overview: {
        totalProjectsAssignedToUser: 3,
        productDeliveryProjectsCount: 3,
        crossRoleProjectsCount: 0,
        approvalsPending: 11,
        blockers: 3
      },
      deliveryFlowInsights: {
        summary: "InsightIQ has significant delivery risk due to delayed milestone, blocked dependencies, and pending escalations requiring leadership intervention.",
        keyHighlights: [
          "45 requirements, 5 need clarification",
          "11 backlog items pending approval",
          "2 delayed milestones",
          "5 blocked tasks",
          "3 open escalations, 2 critical",
          "Current stage: Feature Prioritization"
        ]
      },
      stats: {
        requirementIntake: { totalRequirements: 45, pendingReview: 5, needsClarification: 5, readyForBacklog: 35, convertedToBacklog: 40 },
        backlogApproval: { generated: 62, pendingApproval: 11, approved: 42, returned: 4, rejected: 3 },
        featurePriority: { mustHave: 25, shouldHave: 18, couldHave: 12, deferred: 7 },
        workflowStage: {
          currentStage: "Feature Prioritization",
          nextStage: "Task Planning",
          stages: [
            { name: "Requirement Review", status: "done" },
            { name: "Backlog Generation", status: "done" },
            { name: "Backlog Approval", status: "done" },
            { name: "Feature Prioritization", status: "active" },
            { name: "Task Planning", status: "upcoming" },
            { name: "Delivery Tracking", status: "upcoming" },
            { name: "Stage Approval", status: "upcoming" }
          ]
        },
        agentOutputReview: { pendingReview: 7, approved: 30, revisionRequested: 5, rejected: 2 },
        roadmapHealth: { currentMilestone: "Feature prioritization", nextMilestone: "Task planning kickoff", timelineStatus: "At Risk", deliveryConfidence: "Low", atRiskMilestones: 2 },
        taskTracking: { totalTasks: 65, inProgress: 18, completed: 35, blocked: 5 },
        sprintPlanning: { sprintName: "Sprint 15", sprintGoal: "Prioritize analytics features and resolve blockers", sprintStart: "May 1, 2026", sprintEnd: "May 15, 2026", sprintCapacity: 50, sprintCommitted: 48, sprintCompleted: 25 },
        milestoneDashboard: { totalMilestones: 10, completed: 5, active: 2, delayed: 2 },
        resourcePlanning: { totalResources: 15, allocated: 12, available: 1, overloaded: 3 },
        dependencyMapping: { totalDependencies: 22, openDependencies: 7, blockedDependencies: 4, resolvedDependencies: 11 },
        stakeholderCommunication: { totalStakeholders: 12, updatesSent: 8, pendingUpdates: 3, meetingsScheduled: 5 },
        escalationsSummary: { totalEscalations: 3, open: 2, inReview: 1, resolved: 0, critical: 2 },
        stageGates: { totalGates: 6, approved: 3, pendingSignOff: 2, rejected: 1, comments: 8 },
        prioritizationTools: { priorityCounts: 62, featureSequencing: 15, linkedBacklogItems: 45 }
      },
      details: {
        requirements: [
          { id: "REQ-201", title: "Real-time KPI dashboard", priority: "Critical", status: "Approved", owner: "Priya", lastUpdated: "Apr 10, 2026" },
          { id: "REQ-202", title: "Custom report builder", priority: "High", status: "Approved", owner: "Arjun", lastUpdated: "Apr 12, 2026" },
          { id: "REQ-203", title: "Data pipeline integration", priority: "High", status: "Needs Clarification", owner: "Priya", lastUpdated: "May 1, 2026" },
          { id: "REQ-204", title: "Role-based analytics access", priority: "Medium", status: "Pending Review", owner: "Sneha", lastUpdated: "May 3, 2026" },
          { id: "REQ-205", title: "Export to PDF/Excel", priority: "Low", status: "Approved", owner: "Arjun", lastUpdated: "Apr 15, 2026" }
        ],
        backlogItems: [
          { id: "BL-301", feature: "Dashboard widget framework", priority: "Critical", approvalStatus: "Approved", owner: "Arjun" },
          { id: "BL-302", feature: "Report scheduling engine", priority: "High", approvalStatus: "Pending Approval", owner: "Priya" },
          { id: "BL-303", feature: "Data connector API", priority: "High", approvalStatus: "Returned", owner: "Arjun" },
          { id: "BL-304", feature: "Analytics caching layer", priority: "Medium", approvalStatus: "Pending Approval", owner: "Vikram" }
        ],
        tasks: [
          { id: "TSK-401", taskName: "Build dashboard widget engine", assignee: "Arjun", status: "In Progress", dueDate: "May 12, 2026" },
          { id: "TSK-402", taskName: "Design report templates", assignee: "Priya", status: "Completed", dueDate: "May 5, 2026" },
          { id: "TSK-403", taskName: "Implement data pipeline connectors", assignee: "Arjun", status: "Blocked", dueDate: "May 18, 2026" },
          { id: "TSK-404", taskName: "Set up analytics caching", assignee: "Vikram", status: "Blocked", dueDate: "May 20, 2026" },
          { id: "TSK-405", taskName: "Write E2E tests for dashboards", assignee: "Sneha", status: "In Progress", dueDate: "May 22, 2026" }
        ],
        workflows: [
          { stage: "Requirement Review", status: "Completed", assignedAgent: "Requirement Analyzer", lastAction: "Requirements approved", nextAction: "N/A" },
          { stage: "Backlog Generation", status: "Completed", assignedAgent: "Backlog Generator", lastAction: "Backlog generated", nextAction: "N/A" },
          { stage: "Feature Prioritization", status: "Active", assignedAgent: "Prioritization Engine", lastAction: "Scoring features", nextAction: "Finalize priority ranking" }
        ],
        roadmaps: [
          { milestone: "Requirements sign-off", dueDate: "Apr 15, 2026", status: "Completed", owner: "Priya" },
          { milestone: "Feature prioritization", dueDate: "May 10, 2026", status: "Delayed", owner: "Priya" },
          { milestone: "Task planning kickoff", dueDate: "May 20, 2026", status: "At Risk", owner: "Arjun" },
          { milestone: "Beta release", dueDate: "Jun 20, 2026", status: "Upcoming", owner: "Vikram" }
        ],
        agentOutputs: [
          { id: "AO-501", agent: "Backlog Generator", outputType: "Generated backlog items", reviewStatus: "Approved", reviewer: "Priya" },
          { id: "AO-502", agent: "Prioritization Engine", outputType: "Priority scoring", reviewStatus: "Pending Review", reviewer: "Priya" },
          { id: "AO-503", agent: "Test Case Generator", outputType: "E2E test cases", reviewStatus: "Revision Requested", reviewer: "Sneha" }
        ],
        planningBoards: [
          { id: "PB-601", boardName: "Analytics Release Board", type: "Release", owner: "Priya", status: "Active" },
          { id: "PB-602", boardName: "Sprint Board", type: "Sprint", owner: "Arjun", status: "Active" },
          { id: "PB-603", boardName: "Risk Board", type: "Risk", owner: "Priya", status: "Active" }
        ],
        sprintPlans: [
          { sprint: "Sprint 15", goal: "Prioritize analytics features", plannedStoryPoints: 48, completedStoryPoints: 25, status: "In Progress" },
          { sprint: "Sprint 14", goal: "Data pipeline integration", plannedStoryPoints: 40, completedStoryPoints: 32, status: "Completed" }
        ],
        milestones: [
          { id: "MS-701", name: "Requirements sign-off", owner: "Priya", dueDate: "Apr 15, 2026", status: "Completed" },
          { id: "MS-702", name: "Feature prioritization", owner: "Priya", dueDate: "May 10, 2026", status: "Delayed" },
          { id: "MS-703", name: "Beta release", owner: "Vikram", dueDate: "Jun 20, 2026", status: "Upcoming" }
        ],
        resources: [
          { name: "Priya", role: "Product & Delivery", allocation: "100%", capacityStatus: "Overloaded" },
          { name: "Arjun", role: "Technical Execution", allocation: "90%", capacityStatus: "Allocated" },
          { name: "Sneha", role: "QA / Testing", allocation: "80%", capacityStatus: "Allocated" },
          { name: "Vikram", role: "Release / DevOps", allocation: "100%", capacityStatus: "Overloaded" }
        ],
        dependencies: [
          { id: "DEP-801", dependency: "Data warehouse access credentials", owner: "DBA", status: "Blocked", impact: "Critical" },
          { id: "DEP-802", dependency: "SSO integration for analytics", owner: "Security Lead", status: "Open", impact: "High" },
          { id: "DEP-803", dependency: "Cloud storage provisioning", owner: "DevOps Lead", status: "Open", impact: "Medium" },
          { id: "DEP-804", dependency: "Third-party API contract", owner: "Vendor Manager", status: "Blocked", impact: "High" }
        ],
        stakeholderCommunications: [
          { id: "COM-901", stakeholder: "VP Analytics", communicationType: "Executive Briefing", status: "Sent", nextUpdate: "May 15, 2026" },
          { id: "COM-902", stakeholder: "Data Science Team", communicationType: "Technical Review", status: "Scheduled", nextUpdate: "May 13, 2026" },
          { id: "COM-903", stakeholder: "Client Sponsor", communicationType: "Status Report", status: "Pending", nextUpdate: "May 14, 2026" }
        ],
        escalations: [
          { id: "ESC-1001", title: "Data warehouse access blocked", severity: "Critical", status: "Open", raisedBy: "Arjun", owner: "DBA", createdOn: "May 4, 2026", resolutionEta: "May 11, 2026", notes: "DBA has not provisioned analytics schema access." },
          { id: "ESC-1002", title: "Third-party API contract delay", severity: "Critical", status: "Open", raisedBy: "Priya", owner: "Vendor Manager", createdOn: "May 5, 2026", resolutionEta: "May 18, 2026", notes: "Vendor has not finalized API terms." },
          { id: "ESC-1003", title: "Resource overload on delivery lead", severity: "Medium", status: "In Review", raisedBy: "Priya", owner: "Program Manager", createdOn: "May 7, 2026", resolutionEta: "May 12, 2026", notes: "Delivery lead at 100% capacity with no backup." }
        ],
        stageGates: [
          { id: "SG-1101", gate: "Requirements Gate", approvalStatus: "Approved", pendingSignOffs: 0, gateOwner: "Priya", comments: "Requirements complete." },
          { id: "SG-1102", gate: "Backlog Gate", approvalStatus: "Approved", pendingSignOffs: 0, gateOwner: "Product Owner", comments: "Backlog approved." },
          { id: "SG-1103", gate: "Prioritization Gate", approvalStatus: "Pending Sign-Off", pendingSignOffs: 2, gateOwner: "Priya", comments: "Awaiting final priority ranking." },
          { id: "SG-1104", gate: "Architecture Gate", approvalStatus: "Rejected", pendingSignOffs: 0, gateOwner: "Chief Architect", comments: "Architecture needs revision for scalability." }
        ]
      }
    }
  ],

  getProjectById(projectId) {
    return this.productDeliveryProjects.find(p => p.id === projectId) || null;
  },

  getDefaultProject() {
    return this.productDeliveryProjects[0] || null;
  },

  /* ===== LEGACY DEFAULT METRICS (kept for backwards compat) ===== */
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
