# NEXUS Skill Library

## Requirements & Analysis

### analyze_requirements
- **Description:** Parse, classify, and validate project requirements from raw documents, transcripts, and stakeholder inputs.
- **Category:** Requirements & Analysis
- **Inputs:** Raw documents, meeting transcripts, stakeholder notes
- **Outputs:** Structured requirement list, classification tags, confidence scores

### stakeholder_mapping
- **Description:** Identify and map stakeholders, their interests, influence levels, and communication preferences.
- **Category:** Requirements & Analysis
- **Inputs:** Organization data, project context, communication logs
- **Outputs:** Stakeholder map, influence matrix, RACI chart

### ambiguity_detection
- **Description:** Detect vague, conflicting, or incomplete requirements and flag them for human review.
- **Category:** Requirements & Analysis
- **Inputs:** Requirement documents, acceptance criteria
- **Outputs:** Ambiguity report, conflict list, clarification requests

### domain_analysis
- **Description:** Analyze business domain context, terminology, and constraints to ensure alignment.
- **Category:** Requirements & Analysis
- **Inputs:** Domain documents, glossary, business rules
- **Outputs:** Domain model, terminology map, constraint list

## Project Management

### backlog_management
- **Description:** Create, prioritize, and maintain product backlog items including epics, features, and user stories.
- **Category:** Project Management
- **Inputs:** Requirements, stakeholder priorities, team capacity
- **Outputs:** Prioritized backlog, sprint candidates, dependency map

### sprint_planning
- **Description:** Plan sprint scope, assign story points, balance workload, and set sprint goals.
- **Category:** Project Management
- **Inputs:** Backlog items, team velocity, capacity data
- **Outputs:** Sprint plan, task assignments, velocity forecast

### priority_assignment
- **Description:** Apply MoSCoW, WSJF, or custom prioritization frameworks to backlog items.
- **Category:** Project Management
- **Inputs:** Backlog items, business value data, risk assessments
- **Outputs:** Prioritized list, priority rationale, impact analysis

### stakeholder_communication
- **Description:** Generate status reports, meeting summaries, and stakeholder updates automatically.
- **Category:** Project Management
- **Inputs:** Project metrics, sprint data, decision logs
- **Outputs:** Status reports, executive summaries, stakeholder emails

### story_acceptance
- **Description:** Review completed user stories against acceptance criteria and approve or request changes.
- **Category:** Project Management
- **Inputs:** Completed stories, acceptance criteria, test results
- **Outputs:** Acceptance decisions, feedback notes, quality scores

### story_rejection
- **Description:** Formally reject user stories that don't meet acceptance criteria with detailed feedback.
- **Category:** Project Management
- **Inputs:** Story deliverables, acceptance criteria, test results
- **Outputs:** Rejection report, required changes list, remediation steps

### priority_decisions
- **Description:** Make real-time priority decisions based on changing business context and dependencies.
- **Category:** Project Management
- **Inputs:** Current priorities, new information, dependency changes
- **Outputs:** Updated priority list, decision rationale, impact assessment

### sprint_health_monitoring
- **Description:** Track sprint progress, burndown, and health metrics in real-time.
- **Category:** Project Management
- **Inputs:** Task statuses, time tracking, blocker reports
- **Outputs:** Health dashboard, burndown chart, risk indicators

### velocity_tracking
- **Description:** Calculate and forecast team velocity across sprints for capacity planning.
- **Category:** Project Management
- **Inputs:** Sprint history, completed story points, team changes
- **Outputs:** Velocity trends, capacity forecast, reliability index

### impediment_escalation
- **Description:** Detect, classify, and escalate blockers that impede team progress.
- **Category:** Project Management
- **Inputs:** Task statuses, blocker reports, dependency data
- **Outputs:** Escalation tickets, blocker analysis, resolution suggestions

## Architecture & Design

### system_architecture
- **Description:** Design high-level system architecture including components, services, and infrastructure.
- **Category:** Architecture & Design
- **Inputs:** Requirements, tech constraints, scalability needs
- **Outputs:** Architecture diagrams, component specs, infrastructure plan

### module_design
- **Description:** Design individual module boundaries, interfaces, and internal structure.
- **Category:** Architecture & Design
- **Inputs:** System architecture, module requirements, API contracts
- **Outputs:** Module specs, interface definitions, data models

### tech_stack_decisions
- **Description:** Evaluate and recommend technology choices based on project requirements and constraints.
- **Category:** Architecture & Design
- **Inputs:** Requirements, team skills, performance needs, budget
- **Outputs:** Tech stack recommendation, comparison matrix, migration plan

### api_contract_design
- **Description:** Design RESTful or GraphQL API contracts with schemas, endpoints, and versioning.
- **Category:** Architecture & Design
- **Inputs:** Module interfaces, data models, consumer requirements
- **Outputs:** API specs (OpenAPI), schema definitions, versioning strategy

### release_decisions
- **Description:** Plan release scope, timing, and rollout strategy based on readiness and risk.
- **Category:** Architecture & Design
- **Inputs:** Feature readiness, test results, risk assessments
- **Outputs:** Release plan, rollout strategy, rollback procedures

### design_module_architecture
- **Description:** Create detailed module-level architecture with patterns, layers, and dependencies.
- **Category:** Architecture & Design
- **Inputs:** System architecture, module scope, tech stack
- **Outputs:** Module architecture doc, layer diagram, dependency graph

### create_task_breakdown
- **Description:** Break down features and stories into implementable developer tasks with estimates.
- **Category:** Architecture & Design
- **Inputs:** User stories, module architecture, acceptance criteria
- **Outputs:** Task list, effort estimates, dependency order

### review_dev_output
- **Description:** Review code submissions, architecture compliance, and quality standards adherence.
- **Category:** Architecture & Design
- **Inputs:** Code submissions, architecture specs, quality standards
- **Outputs:** Review comments, approval/rejection, improvement suggestions

### mock_api_specs
- **Description:** Generate mock API specifications and sample data for parallel development.
- **Category:** Architecture & Design
- **Inputs:** API contracts, data models, use cases
- **Outputs:** Mock server config, sample responses, test fixtures

## Development

### write_code
- **Description:** Generate production-quality code following architecture specs and coding standards.
- **Category:** Development
- **Inputs:** Task specs, module architecture, coding standards
- **Outputs:** Source code, unit tests, code documentation

### run_unit_tests
- **Description:** Execute unit test suites, analyze results, and report coverage metrics.
- **Category:** Development
- **Inputs:** Test suites, source code, coverage thresholds
- **Outputs:** Test results, coverage report, failure analysis

### create_mock_apis
- **Description:** Build mock API endpoints for development and testing isolation.
- **Category:** Development
- **Inputs:** API contracts, mock data requirements
- **Outputs:** Mock server, endpoint stubs, sample data

### task_reports
- **Description:** Generate detailed task completion reports with metrics and deliverables summary.
- **Category:** Development
- **Inputs:** Completed tasks, code metrics, test results
- **Outputs:** Task report, metrics summary, deliverable inventory

### api_documentation
- **Description:** Auto-generate comprehensive API documentation from code and specifications.
- **Category:** Development
- **Inputs:** Source code, API specs, usage examples
- **Outputs:** API docs, endpoint reference, code samples

### readme_generation
- **Description:** Generate and maintain README files with setup, usage, and contribution guides.
- **Category:** Development
- **Inputs:** Project structure, dependencies, configuration
- **Outputs:** README.md, setup guide, contribution guide

### architecture_diagrams
- **Description:** Generate visual architecture and sequence diagrams from code and specs.
- **Category:** Development
- **Inputs:** Architecture specs, code structure, API flows
- **Outputs:** System diagrams, sequence diagrams, component maps

### knowledge_base
- **Description:** Build and maintain searchable knowledge base from project artifacts and decisions.
- **Category:** Development
- **Inputs:** Decision logs, architecture docs, meeting notes
- **Outputs:** Knowledge articles, search index, FAQ documents

## Quality Assurance

### extract_acceptance_criteria
- **Description:** Extract and structure acceptance criteria from user stories and requirements.
- **Category:** Quality Assurance
- **Inputs:** User stories, requirement documents
- **Outputs:** Structured acceptance criteria, test scenarios, edge cases

### generate_positive_tests
- **Description:** Generate test cases that verify expected happy-path behavior.
- **Category:** Quality Assurance
- **Inputs:** Acceptance criteria, API specs, data models
- **Outputs:** Positive test cases, test data, expected results

### generate_negative_tests
- **Description:** Generate test cases for error handling, invalid inputs, and boundary conditions.
- **Category:** Quality Assurance
- **Inputs:** Acceptance criteria, validation rules, error specs
- **Outputs:** Negative test cases, error scenarios, boundary tests

### generate_edge_tests
- **Description:** Generate test cases for edge cases, race conditions, and unusual scenarios.
- **Category:** Quality Assurance
- **Inputs:** System constraints, concurrency specs, data limits
- **Outputs:** Edge case tests, stress scenarios, concurrency tests

### test_case_generation
- **Description:** Comprehensive test case generation combining positive, negative, and edge cases.
- **Category:** Quality Assurance
- **Inputs:** Requirements, acceptance criteria, system constraints
- **Outputs:** Complete test suite, test matrix, coverage map

### test_execution
- **Description:** Execute test suites across environments and collect detailed results.
- **Category:** Quality Assurance
- **Inputs:** Test suites, test environment, test data
- **Outputs:** Execution results, pass/fail report, performance data

### coverage_reporting
- **Description:** Analyze and report code coverage metrics with gap identification.
- **Category:** Quality Assurance
- **Inputs:** Test results, source code, coverage thresholds
- **Outputs:** Coverage report, uncovered areas, improvement recommendations

### defect_reporting
- **Description:** Classify, document, and report software defects with reproduction steps.
- **Category:** Quality Assurance
- **Inputs:** Test failures, error logs, system behavior
- **Outputs:** Defect tickets, severity classification, reproduction steps

## Security & DevOps

### vulnerability_scanning
- **Description:** Scan code and dependencies for known vulnerabilities and security issues.
- **Category:** Security & DevOps
- **Inputs:** Source code, dependency manifest, security policies
- **Outputs:** Vulnerability report, severity ratings, remediation advice

### cicd_pipeline
- **Description:** Configure and manage CI/CD pipelines for automated build, test, and deployment.
- **Category:** Security & DevOps
- **Inputs:** Project config, build specs, deployment targets
- **Outputs:** Pipeline config, build scripts, deployment manifests

### deployment_packaging
- **Description:** Package applications for deployment with proper configuration and versioning.
- **Category:** Security & DevOps
- **Inputs:** Build artifacts, environment configs, version info
- **Outputs:** Deployment package, release notes, rollback script

### compliance_checking
- **Description:** Verify code and processes against regulatory and organizational compliance standards.
- **Category:** Security & DevOps
- **Inputs:** Compliance rules, audit requirements, code artifacts
- **Outputs:** Compliance report, violation list, remediation plan

### performance_profiling
- **Description:** Profile application performance, identify bottlenecks, and suggest optimizations.
- **Category:** Security & DevOps
- **Inputs:** Application runtime, load test data, performance baselines
- **Outputs:** Performance report, bottleneck analysis, optimization recommendations

## Integration

### cross_module_integration
- **Description:** Coordinate and implement integration between independent modules and services.
- **Category:** Integration
- **Inputs:** Module interfaces, API contracts, data flows
- **Outputs:** Integration code, adapter layers, data transformers

### dependency_resolution
- **Description:** Analyze and resolve dependency conflicts between modules and packages.
- **Category:** Integration
- **Inputs:** Dependency trees, version constraints, compatibility data
- **Outputs:** Resolved dependency graph, version recommendations, conflict report

### integration_testing
- **Description:** Design and execute tests that verify cross-module integration behavior.
- **Category:** Integration
- **Inputs:** Integration specs, API contracts, test scenarios
- **Outputs:** Integration test suite, results report, compatibility matrix

### contract_validation
- **Description:** Validate that module implementations comply with agreed API contracts.
- **Category:** Integration
- **Inputs:** API contracts, implementation code, test results
- **Outputs:** Validation report, contract violations, compliance score
