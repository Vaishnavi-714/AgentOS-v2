// PM Dashboard Renderer
const progressReportData = {
  projectName: 'FinTech Payment Gateway',
  manager: 'Sarah Chen',
  reportingPeriod: '2026-01-15 to 2026-06-30',
  status: 'At Risk',
  healthMetrics: {
    completion: 62,
    timeline: 55,
    scope: 72,
    risk: 68,
    phase: 'Execution',
    healthScore: 68
  },
  features: [
    { name: 'Auth Module', status: 'Completed', completion: 100, planned: 100 },
    { name: 'Payment Core', status: 'In Progress', completion: 65, planned: 80 },
    { name: 'Merchant Portal', status: 'In Progress', completion: 40, planned: 60 },
    { name: 'Analytics', status: 'Pending', completion: 15, planned: 30 },
    { name: 'Compliance', status: 'Pending', completion: 10, planned: 20 }
  ],
  risks: [
    { title: 'Payment processor API deprecation', severity: 'High', status: 'Mitigating', mitigation: 'Building adapter layer for multiple processors' },
    { title: 'Compliance deadline pressure', severity: 'Medium', status: 'Monitoring', mitigation: 'Parallel compliance workstream started' },
    { title: 'Third-party KYC API integration delay', severity: 'High', status: 'Open', mitigation: 'Escalated with vendor and backend team' }
  ],
  kpis: {
    completion: 62,
    velocity: 34,
    riskLevel: 'Medium',
    qualityScore: 78
  },
  nextSteps: [
    'Recover Payment Core variance before next milestone review',
    'Decide on PCI compliance scope change',
    'Stabilize vendor dependencies affecting schedule',
    'Reconfirm budget and delivery plan with leadership'
  ]
};

function buildProgressReportFallbackSection() {
  const deliveredFeatureCount = progressReportData.features.filter(item => item.status === 'Completed').length;
  const inProgressFeatureCount = progressReportData.features.filter(item => item.status === 'In Progress').length;
  const plannedFeatureCount = progressReportData.features.length;
  return {
    overallStatus: {
      healthScore: progressReportData.healthMetrics.healthScore,
      status: progressReportData.status,
      phase: progressReportData.healthMetrics.phase,
      summary: `${progressReportData.projectName} is ${progressReportData.status.toLowerCase()} with ${progressReportData.healthMetrics.completion}% completion across the current reporting period.`
    },
    kpis: progressReportData.kpis,
    featureProgress: progressReportData.features,
    roadmapAlignment: {
      plannedFeatureCount,
      deliveredFeatureCount,
      inProgressFeatureCount,
      deviations: progressReportData.features
        .filter(item => item.completion < item.planned)
        .map(item => ({
          feature: item.name,
          delta: item.planned - item.completion,
          note: `${item.name} is ${item.planned - item.completion}% behind planned roadmap delivery.`
        }))
    },
    scopeTracking: {
      definedScopeCount: plannedFeatureCount,
      currentScopeCount: plannedFeatureCount + 1,
      changeRequestCount: 1,
      scopeDelta: 1,
      scopeChanges: [
        { id: 'CR-01', title: 'PCI DSS Level 1 compliance', status: 'In Review', impact: 'High', effort: '+2 sprints' }
      ],
      impactSummary: 'One active scope change is increasing delivery effort and sequencing pressure.'
    },
    timelineStatus: {
      achievedMilestones: 1,
      delayedMilestones: 4,
      milestones: progressReportData.features.map(item => ({
        name: item.name,
        planned: item.planned,
        actual: item.completion
      })),
      delays: ['KYC API dependency delay', 'Compliance workstream expansion'],
      reasons: ['KYC API dependency delay', 'Compliance workstream expansion']
    },
    costImpact: {
      budgetAllocated: 450000,
      budgetSpent: 285000,
      budgetPct: 63,
      forecast: 412000,
      overrunRisk: 'Medium'
    },
    qualityOverview: {
      defectRate: 0.6,
      testingStatus: 'Testing in progress',
      releaseReadiness: 'Needs hardening',
      qualityScore: progressReportData.kpis.qualityScore
    },
    risksIssues: {
      activeRisks: progressReportData.risks,
      activeIssues: [
        { id: 'ISS-01', title: 'Payment timeout errors in staging', priority: 'Critical', status: 'In Progress' },
        { id: 'ISS-02', title: 'Merchant onboarding UX gaps', priority: 'High', status: 'Open' }
      ]
    },
    businessImpact: {
      valueDelivered: 'Core authentication capability is fully delivered and payment workflows are partially enabling merchant onboarding progress.',
      userBusinessImpact: 'Current progress supports continued product momentum, but unresolved schedule and compliance risks are constraining launch confidence.'
    },
    nextSteps: {
      priorities: progressReportData.nextSteps,
      decisionsRequired: [
        'Approve or defer PCI compliance scope increase',
        'Confirm mitigation plan for KYC vendor delay',
        'Validate milestone recovery plan against current velocity'
      ]
    }
  };
}

function renderProgressReport() {
  const container = document.getElementById('tab-content') || document.getElementById('pmPageContent');
  if (!progressReportData) {
    console.error('Progress data missing');
    return;
  }
  if (!container) return;
  PMRender.renderProgressReport(buildProgressReportFallbackSection());
}

function handleProgressReportTabClick() {
  sessionStorage.setItem('pm_last_tab', 'progress-report');
  renderProgressReport();
}

function renderHealthRing(score){
  const c=score>=70?'#10b981':score>=50?'#f59e0b':'#ef4444';
  const r=52,circ=2*Math.PI*r,off=circ-(score/100)*circ;
  return `<div class="health-score-ring"><svg width="120" height="120"><circle cx="60" cy="60" r="${r}" stroke="var(--border)" stroke-width="8" fill="none"/><circle cx="60" cy="60" r="${r}" stroke="${c}" stroke-width="8" fill="none" stroke-dasharray="${circ}" stroke-dashoffset="${off}" stroke-linecap="round"/></svg><div class="score-text" style="color:${c}">${score}%</div><div class="score-label">Health Score</div></div>`;
}

function renderScoreBreakdown(s){
  return ['Progress','Risk','Quality','Budget'].map((l,i)=>{
    const v=[s.progress,100-s.risk,s.quality,s.budget][i];
    const c=v>=70?'#10b981':v>=50?'#f59e0b':'#ef4444';
    return `<div class="metric-bar"><span class="metric-label">${l}</span><div class="metric-track"><div class="metric-fill" style="width:${v}%;background:${c}"></div></div><span class="metric-value" style="color:${c}">${v}%</span></div>`;
  }).join('');
}

function renderTriangle(ctq){
  const gc=v=>v>=70?'#10b981':v>=50?'#f59e0b':'#ef4444';
  return `<div class="triangle-container"><div class="triangle-viz"><svg width="240" height="180" style="position:absolute;top:20px"><polygon points="120,10 20,170 220,170" fill="none" stroke="var(--border)" stroke-width="2"/></svg><div class="triangle-vertex top"><div class="triangle-vertex-label">Quality</div><div class="triangle-vertex-value" style="color:${gc(ctq.quality)}">${ctq.quality}%</div></div><div class="triangle-vertex bottom-left"><div class="triangle-vertex-label">Cost</div><div class="triangle-vertex-value" style="color:${gc(ctq.cost)}">${ctq.cost}%</div></div><div class="triangle-vertex bottom-right"><div class="triangle-vertex-label">Time</div><div class="triangle-vertex-value" style="color:${gc(ctq.time)}">${ctq.time}%</div></div></div></div>`;
}

function renderDecisions(decs){
  return decs.map(d=>`<div class="decision-log-item"><div class="decision-log-title">${d.title}</div><div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">${d.reason}</div><div class="decision-log-meta"><span>📅 ${d.date}</span><span>👤 ${d.decidedBy}</span><span>Impact: <strong style="color:${d.impact==='Critical'?'#ef4444':d.impact==='High'?'#f59e0b':'#3b82f6'}">${d.impact}</strong></span><span>${statusBadge(d.status.toUpperCase().replace(/ /g,'_'))}</span></div></div>`).join('');
}

function renderIssues(issues){
  if(!issues||!issues.length) return '<div class="empty-state" style="padding:20px"><div class="empty-state-icon">✅</div><p class="empty-state-text">No open issues</p></div>';
  return `<div class="table-container"><table><thead><tr><th>ID</th><th>Title</th><th>Type</th><th>Priority</th><th>Status</th></tr></thead><tbody>${issues.map(i=>`<tr><td style="font-family:var(--mono);color:var(--accent)">${i.id}</td><td>${i.title}</td><td><span class="tag">${i.type}</span></td><td>${priorityBadge(i.priority.toUpperCase())}</td><td>${statusBadge(i.status.toUpperCase().replace(/ /g,'_'))}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderGovernance(gov){
  let h='';
  // Approvals
  h+=`<div class="pm-section"><div class="pm-section-header"><h3 class="pm-section-title">📋 Pending Approvals</h3></div>`;
  if(gov.approvals.length){
    h+=gov.approvals.map(a=>`<div class="decision-log-item"><div class="decision-log-title">${a.title}</div><div class="decision-log-meta"><span>Status: ${statusBadge(a.status.toUpperCase())}</span><span>Approver: ${a.approver}</span><span>Ceiling: ${a.ceiling}</span><span>📅 ${a.date}</span></div></div>`).join('');
  } else { h+='<p style="font-size:13px;color:var(--text-muted)">No pending approvals</p>'; }
  h+=`</div>`;
  // Audit
  h+=`<div class="pm-section"><div class="pm-section-header"><h3 class="pm-section-title">📜 Audit Log</h3></div><div class="card" style="padding:16px">`;
  h+=gov.auditLog.map(a=>`<div class="audit-item"><span class="audit-time">${new Date(a.timestamp).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span><span class="audit-action">${a.action}</span><span class="audit-detail">${a.detail}</span></div>`).join('');
  h+=`</div></div>`;
  // Ceilings
  h+=`<div class="pm-section"><div class="pm-section-header"><h3 class="pm-section-title">🔒 Decision Ceilings</h3></div><div class="grid grid-3">`;
  h+=gov.ceilings.map(c=>`<div class="ceiling-card"><div class="ceiling-level">${c.level}</div><div class="ceiling-limit">Limit: ${c.limit}</div><div class="ceiling-items">${c.canDecide.map(d=>'• '+d).join('<br>')}</div></div>`).join('');
  h+=`</div></div>`;
  return h;
}

function renderIdeaPhase(p){
  let h='';
  // Problem Clarity
  h+=`<div class="grid grid-2"><div class="card"><div class="card-header"><h3 class="card-title">🎯 Problem Clarity</h3><span class="status-badge" style="background:${p.problemClarity.score>=70?'#10b98120':'#f59e0b20'};color:${p.problemClarity.score>=70?'#10b981':'#f59e0b'}">${p.problemClarity.score}% Clear</span></div><p style="font-size:13px;color:var(--text-secondary);line-height:1.6">${p.problemClarity.statement}</p></div>`;
  // Market
  h+=`<div class="card"><div class="card-header"><h3 class="card-title">📊 Market Validation</h3><span class="status-badge" style="background:#3b82f620;color:#3b82f6">Score: ${p.marketValidation.score}/100</span></div><div class="grid grid-2" style="gap:10px"><div class="portfolio-meta-item"><div class="portfolio-meta-label">TAM</div><div class="portfolio-meta-value">${p.marketValidation.tam}</div></div><div class="portfolio-meta-item"><div class="portfolio-meta-label">Growth</div><div class="portfolio-meta-value">${p.marketValidation.growth}</div></div><div class="portfolio-meta-item"><div class="portfolio-meta-label">Competitors</div><div class="portfolio-meta-value">${p.marketValidation.competitors}</div></div><div class="portfolio-meta-item"><div class="portfolio-meta-label">Edge</div><div class="portfolio-meta-value" style="font-size:11px">${p.marketValidation.differentiator}</div></div></div></div></div>`;
  // Personas
  h+=`<div class="pm-section"><div class="pm-section-header"><h3 class="pm-section-title">👥 User Personas & Pain Points</h3></div><div class="grid grid-3">${p.personas.map(pe=>`<div class="persona-card"><div class="persona-name">${pe.name}</div><div class="persona-priority">${pe.priority} Target</div>${pe.painPoints.map(pp=>`<div class="persona-pain">• ${pp}</div>`).join('')}</div>`).join('')}</div></div>`;
  // Competitors
  h+=`<div class="pm-section"><div class="pm-section-header"><h3 class="pm-section-title">🏁 Competitor Snapshot</h3></div><div class="competitor-row" style="font-weight:700;color:var(--text-muted);font-size:11px"><span>NAME</span><span>STRENGTH</span><span>WEAKNESS</span><span>THREAT</span></div>${p.competitors.map(c=>{const tc=c.threat==='High'?'#ef4444':c.threat==='Medium'?'#f59e0b':'#10b981';return `<div class="competitor-row"><span class="competitor-name">${c.name}</span><span style="color:var(--text-secondary)">${c.strength}</span><span style="color:var(--text-secondary)">${c.weakness}</span><span style="color:${tc};font-weight:600">${c.threat}</span></div>`}).join('')}</div>`;
  // MVP Scope
  h+=`<div class="grid grid-2"><div class="card"><div class="card-header"><h3 class="card-title">🚀 MVP Scope</h3></div>${p.mvpScope.mvp.map(s=>`<span class="scope-tag mvp">✓ ${s}</span>`).join('')}</div><div class="card"><div class="card-header"><h3 class="card-title">🔮 Future Scope</h3></div>${p.mvpScope.future.map(s=>`<span class="scope-tag future">${s}</span>`).join('')}</div></div>`;
  // Feasibility
  h+=`<div class="card"><div class="card-header"><h3 class="card-title">⚙️ Feasibility Meter</h3></div>${['Time','Cost','Tech'].map((l,i)=>{const v=[p.feasibility.time,p.feasibility.cost,p.feasibility.tech][i];const c=v>=70?'#10b981':v>=50?'#f59e0b':'#ef4444';return `<div class="feasibility-bar"><span class="feasibility-label">${l}</span><div class="feasibility-track"><div class="feasibility-fill" style="width:${v}%;background:${c}"></div></div><span class="feasibility-value" style="color:${c}">${v}%</span></div>`}).join('')}</div>`;
  // Decision Gate
  h+=`<div class="pm-section"><div class="pm-section-header"><h3 class="pm-section-title">🚦 Decision Gate</h3><span class="pm-section-subtitle">Should we build this?</span></div><div class="decision-gate"><button class="gate-btn proceed" onclick="gateDecision('proceed')">✅ Proceed</button><button class="gate-btn hold" onclick="gateDecision('hold')">⏸️ Hold</button><button class="gate-btn kill" onclick="gateDecision('kill')">❌ Kill</button></div></div>`;
  return h;
}

function renderExecutionPhase(p){
  let h='';
  // Roadmap
  h+=`<div class="card"><div class="card-header"><h3 class="card-title">🗺️ Roadmap vs Actual Progress</h3></div>${p.roadmap.planned.map(r=>`<div class="roadmap-row"><span class="roadmap-label">${r.name}</span><div class="roadmap-tracks"><div class="roadmap-planned" style="width:${r.planned}%"></div><div class="roadmap-actual" style="width:${r.actual}%"></div></div><span class="roadmap-pct">${r.actual}%</span></div>`).join('')}<div style="display:flex;gap:16px;margin-top:8px;font-size:11px"><span style="color:var(--text-muted)">■ <span style="color:var(--accent)">Actual</span></span><span style="color:var(--text-muted)">┊ <span style="color:rgba(99,102,241,0.5)">Planned</span></span></div></div>`;
  // Sprint
  h+=`<div class="grid grid-2"><div class="card"><div class="card-header"><h3 class="card-title">🏃 Sprint Progress</h3><span class="tag">Sprint ${p.sprint.current}/${p.sprint.total}</span></div><div class="grid grid-2" style="gap:10px;margin-bottom:12px"><div class="portfolio-meta-item"><div class="portfolio-meta-label">Velocity</div><div class="portfolio-meta-value" style="color:${p.sprint.velocity<p.sprint.planned*0.7?'#ef4444':'#10b981'}">${p.sprint.velocity} <span style="font-size:11px;color:var(--text-muted)">/ ${p.sprint.planned} planned</span></div></div><div class="portfolio-meta-item"><div class="portfolio-meta-label">Burndown</div><div class="portfolio-meta-value">${p.sprint.burndown[p.sprint.burndown.length-1]} pts left</div></div></div><div class="progress-bar" style="height:10px"><div class="progress-fill" style="width:${Math.round(p.sprint.current/p.sprint.total*100)}%"></div></div></div>`;
  // Scope Changes
  h+=`<div class="card"><div class="card-header"><h3 class="card-title">📐 Scope Changes</h3><span class="tag">${p.scopeChanges.length} changes</span></div>${p.scopeChanges.map(s=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="font-weight:600;color:var(--text-primary);min-width:120px">${s.title}</span><span style="color:${s.impact==='Critical'?'#ef4444':s.impact==='High'?'#f59e0b':'#3b82f6'};font-weight:600;min-width:60px">${s.impact}</span>${statusBadge(s.status.toUpperCase().replace(/ /g,'_'))}<span style="margin-left:auto;color:var(--text-muted)">${s.effort}</span></div>`).join('')}</div></div>`;
  // Risks & Blockers
  h+=`<div class="grid grid-2"><div class="card"><div class="card-header"><h3 class="card-title">⚠️ Risks</h3></div>${p.risks.map(r=>{const sc=r.severity==='Critical'?'#ef4444':r.severity==='High'?'#f59e0b':'#3b82f6';return `<div style="padding:10px;margin-bottom:8px;border-left:3px solid ${sc};background:${sc}10;border-radius:0 var(--radius) var(--radius) 0"><div style="font-size:13px;font-weight:600;color:var(--text-primary)">${r.title}</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px">${r.severity} · ${r.probability} prob · ${r.status}</div><div style="font-size:11px;color:var(--text-secondary);margin-top:4px">↳ ${r.mitigation}</div></div>`}).join('')}</div>`;
  h+=`<div class="card"><div class="card-header"><h3 class="card-title">🚧 Blockers</h3></div>${p.blockers.map(b=>`<div style="padding:10px;margin-bottom:8px;border-left:3px solid var(--danger);background:rgba(239,68,68,0.06);border-radius:0 var(--radius) var(--radius) 0"><div style="font-size:13px;font-weight:600;color:var(--text-primary)">${b.title}</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px">⏱ ${b.daysPending} days · Owner: ${b.owner}</div></div>`).join('')}</div></div>`;
  // Team & Feedback
  h+=`<div class="grid grid-2"><div class="card"><div class="card-header"><h3 class="card-title">🤝 Team Alignment</h3></div><div style="text-align:center;padding:12px"><div style="font-size:36px;font-weight:800;color:${p.teamAlignment>=70?'#10b981':p.teamAlignment>=50?'#f59e0b':'#ef4444'}">${p.teamAlignment}%</div><div class="progress-bar" style="height:10px;margin-top:8px"><div class="progress-fill" style="width:${p.teamAlignment}%;background:${p.teamAlignment>=70?'#10b981':p.teamAlignment>=50?'#f59e0b':'#ef4444'}"></div></div></div></div>`;
  h+=`<div class="card"><div class="card-header"><h3 class="card-title">💬 Early Feedback</h3></div>${p.earlyFeedback.map(f=>{const sc=f.sentiment==='positive'?'#10b981':f.sentiment==='negative'?'#ef4444':'#f59e0b';return `<div style="padding:8px 10px;margin-bottom:6px;border-left:3px solid ${sc};background:${sc}08;border-radius:0 var(--radius) var(--radius) 0;font-size:12px"><span style="font-weight:600;color:var(--text-primary)">${f.user}</span> <span style="color:var(--text-muted)">· ${f.date}</span><div style="color:var(--text-secondary);margin-top:2px">"${f.comment}"</div></div>`}).join('')}</div></div>`;
  // Red Flags
  if(p.redFlags&&p.redFlags.length){
    h+=`<div class="pm-section"><div class="pm-section-header"><h3 class="pm-section-title">🚨 Red Flag Engine</h3></div><div class="red-flag-panel">${p.redFlags.map(f=>`<div class="red-flag-item ${f.severity}"><span>${f.severity==='critical'?'🔴':'🟡'}</span><span>${f.message}</span></div>`).join('')}</div></div>`;
  }
  return h;
}

function renderPostLaunchPhase(p){
  let h='';
  // Usage
  h+=`<div class="grid grid-4"><div class="stat-card"><span class="stat-label">Daily Active Users</span><span class="stat-value">${p.usageMetrics.dau.toLocaleString()}</span><span class="stat-change up">↑ ${p.usageMetrics.dauGrowth}%</span></div><div class="stat-card"><span class="stat-label">Monthly Active Users</span><span class="stat-value">${p.usageMetrics.mau.toLocaleString()}</span><span class="stat-change up">↑ ${p.usageMetrics.mauGrowth}%</span></div><div class="stat-card"><span class="stat-label">MRR</span><span class="stat-value">$${(p.revenue.mrr/1000).toFixed(0)}K</span><span class="stat-change up">↑ ${p.revenue.growth}%</span></div><div class="stat-card"><span class="stat-label">NPS Score</span><span class="stat-value" style="color:${p.userFeedback.nps>=50?'#10b981':p.userFeedback.nps>=30?'#f59e0b':'#ef4444'}">${p.userFeedback.nps}</span><span class="stat-change">CSAT: ${p.userFeedback.csat}/5</span></div></div>`;
  // Retention
  h+=`<div class="grid grid-2"><div class="card"><div class="card-header"><h3 class="card-title">📈 Retention</h3></div>${['Day 1','Day 7','Day 30'].map((l,i)=>{const v=[p.retention.day1,p.retention.day7,p.retention.day30][i];const c=v>=60?'#10b981':v>=40?'#f59e0b':'#ef4444';return `<div class="metric-bar"><span class="metric-label">${l}</span><div class="metric-track"><div class="metric-fill" style="width:${v}%;background:${c}"></div></div><span class="metric-value" style="color:${c}">${v}%</span></div>`}).join('')}<div style="margin-top:8px;font-size:12px;color:var(--text-muted)">Churn Rate: <span style="color:#ef4444;font-weight:600">${p.retention.churnRate}%</span></div></div>`;
  // Funnel
  h+=`<div class="card"><div class="card-header"><h3 class="card-title">🔽 Conversion Funnel</h3></div>${p.conversionFunnel.map((s,i)=>`<div class="funnel-stage" style="width:${100-i*8}%;margin:0 auto"><span class="funnel-stage-name">${s.stage}</span><span class="funnel-stage-count">${s.count.toLocaleString()}</span><span class="funnel-stage-pct">${s.pct}%</span></div>`).join('')}</div></div>`;
  // Revenue & Feedback
  h+=`<div class="grid grid-2"><div class="card"><div class="card-header"><h3 class="card-title">💰 Revenue & Impact</h3></div><div class="grid grid-2" style="gap:10px"><div class="portfolio-meta-item"><div class="portfolio-meta-label">ARR</div><div class="portfolio-meta-value" style="color:#10b981">$${(p.revenue.arr/1000).toFixed(0)}K</div></div><div class="portfolio-meta-item"><div class="portfolio-meta-label">LTV</div><div class="portfolio-meta-value">$${p.revenue.ltv}</div></div><div class="portfolio-meta-item"><div class="portfolio-meta-label">Growth</div><div class="portfolio-meta-value" style="color:#10b981">↑ ${p.revenue.growth}%</div></div><div class="portfolio-meta-item"><div class="portfolio-meta-label">Budget Used</div><div class="portfolio-meta-value">${Math.round(p.budget.spent/p.budget.allocated*100)}%</div></div></div></div>`;
  h+=`<div class="card"><div class="card-header"><h3 class="card-title">💬 User Feedback Summary</h3></div><div style="margin-bottom:10px"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">TOP PRAISE</div>${p.userFeedback.topPraise.map(t=>`<span class="scope-tag mvp">👍 ${t}</span>`).join('')}</div><div><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">TOP COMPLAINTS</div>${p.userFeedback.topComplaints.map(t=>`<span class="scope-tag future">👎 ${t}</span>`).join('')}</div></div></div>`;
  // Bugs & Improvements
  h+=`<div class="grid grid-2"><div class="card"><div class="card-header"><h3 class="card-title">🐛 Bugs</h3></div>${p.bugs.map(b=>{const sc=b.severity==='High'?'#ef4444':b.severity==='Medium'?'#f59e0b':'#6b7280';return `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="color:var(--mono);color:var(--accent)">${b.id}</span><span style="flex:1;color:var(--text-secondary)">${b.title}</span><span style="color:${sc};font-weight:600;font-size:11px">${b.severity}</span>${statusBadge(b.status.toUpperCase().replace(/ /g,'_'))}</div>`}).join('')}</div>`;
  h+=`<div class="card"><div class="card-header"><h3 class="card-title">🔧 Improvements</h3></div>${p.improvements.map(im=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="flex:1;font-weight:600;color:var(--text-primary)">${im.title}</span><span class="tag">${im.effort}</span>${statusBadge(im.status.toUpperCase().replace(/ /g,'_'))}</div>`).join('')}</div></div>`;
  // Learnings
  h+=`<div class="card"><div class="card-header"><h3 class="card-title">📚 Learning Panel</h3></div><div class="grid grid-3"><div class="learning-col"><div style="font-size:11px;font-weight:700;color:#10b981;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px">✅ What Worked</div>${p.learnings.worked.map(w=>`<div class="learning-item success">${w}</div>`).join('')}</div><div class="learning-col"><div style="font-size:11px;font-weight:700;color:#ef4444;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px">❌ What Failed</div>${p.learnings.failed.map(f=>`<div class="learning-item failure">${f}</div>`).join('')}</div><div class="learning-col"><div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px">🎯 Next Actions</div>${p.learnings.nextActions.map(a=>`<div class="learning-item action">${a}</div>`).join('')}</div></div></div>`;
  return h;
}

const PMRender = {
  tabs: [
    { id: 'overview', label: 'Overview', href: 'pm-overview.html' },
    { id: 'scope', label: 'Scope', href: 'pm-scope.html' },
    { id: 'schedule', label: 'Schedule', href: 'pm-schedule.html' },
    { id: 'cost', label: 'Cost', href: 'pm-cost.html' },
    { id: 'quality', label: 'Quality', href: 'pm-quality.html' },
    { id: 'resources', label: 'Resources', href: 'pm-resources.html' },
    { id: 'risks', label: 'Risks', href: 'pm-risks.html' },
    { id: 'governance', label: 'Governance', href: 'pm-governance.html' },
    { id: 'summary', label: 'Summary', href: 'pm-summary.html' },
    { id: 'progress-report', label: 'Project Progress Report', href: 'pm-progress-report.html' }
  ],

  mount(targetId, html) {
    const el = document.getElementById(targetId);
    if (el) el.innerHTML = html;
  },

  escape(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(value);
    const div = document.createElement('div');
    div.textContent = value || '';
    return div.innerHTML;
  },

  renderTabs(activeTab) {
    return `
      <div class="tabs" data-tab-group="pm-dashboard">
        ${this.tabs.map(tab => `
          <a href="${tab.href}" class="tab nav-link ${tab.id === activeTab ? 'active' : ''}"${tab.id === 'progress-report' ? ' onclick="handleProgressReportTabClick()"' : ''}>${tab.label}</a>
        `).join('')}
      </div>
    `;
  },

  renderHeader(meta, activeTab, pageTitle, pageSubtitle) {
    const activeTabConfig = this.tabs.find(tab => tab.id === activeTab);
    const activeLabel = activeTabConfig ? activeTabConfig.label : (activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
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
          <span class="status-badge" style="background:${PMData.getPhaseColor(meta.phase)}20;color:${PMData.getPhaseColor(meta.phase)};border:1px solid ${PMData.getPhaseColor(meta.phase)}40">${PMData.getPhaseLabel(meta.phase)}</span>
          <span class="tag">${this.escape(meta.projectName)}</span>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">${this.escape(meta.projectName)}</h3>
            <p class="card-subtitle">Owner: ${this.escape(meta.manager)} · Reporting Period: ${this.escape(meta.reportingPeriod)}</p>
          </div>
          <span class="status-badge">${this.escape(meta.status)}</span>
        </div>
        <div class="grid grid-4">
          <div class="stat-card"><span class="stat-label">Audience</span><span class="stat-value" style="font-size:16px">${this.escape(meta.audience)}</span></div>
          <div class="stat-card"><span class="stat-label">Purpose</span><span class="stat-value" style="font-size:16px">${this.escape(meta.purpose)}</span></div>
          <div class="stat-card"><span class="stat-label">Active Section</span><span class="stat-value" style="font-size:16px">${this.escape(activeLabel)}</span></div>
          <div class="stat-card"><span class="stat-label">Phase</span><span class="stat-value" style="font-size:16px">${this.escape(PMData.getPhaseLabel(meta.phase))}</span></div>
        </div>
      </div>
    `;
  },

  showLoader(text) {
    if (typeof showLoading === 'function') showLoading(text);
  },

  hideLoader() {
    if (typeof hideLoading === 'function') hideLoading();
  },

  async bootstrapPage(config) {
    const role = localStorage.getItem('role');
    if (role !== 'tenant') {
      window.location.href = '../index.html';
      return;
    }

    seedNexusData();
    createNavigation('role-dashboard');
    if (TenantState.isTenantUser()) injectTenantInfoCard();

    const meta = await PMData.loadMeta();
    if (!meta) {
      this.mount('pmPageChrome', '<div class="empty-state"><div class="empty-state-icon">📋</div><h3 class="empty-state-title">No PM Project</h3><p class="empty-state-text">No project data is available for the Product Manager dashboard.</p></div>');
      return;
    }

    this.mount('pmPageChrome', `${this.renderHeader(meta, config.activeTab, config.pageTitle, config.pageSubtitle)}${this.renderTabs(config.activeTab)}`);
    this.showLoader(`Loading ${config.pageTitle}...`);

    try {
      const data = await PMData.loadSection(config.section);
      if (!data) {
        if (config.section === 'progressReport') {
          renderProgressReport();
          return;
        }
        this.mount('pmPageContent', '<div class="empty-state"><div class="empty-state-icon">📭</div><h3 class="empty-state-title">No Section Data</h3><p class="empty-state-text">This PM section does not have data yet.</p></div>');
        return;
      }
      this[config.renderMethod](data);
    } finally {
      this.hideLoader();
    }
  },

  renderOverview(data) {
    const health = data.overallHealth;
    const html = `
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="stat-card"><span class="stat-label">Health Score</span><span class="stat-value" style="color:${health.healthScore >= 70 ? 'var(--success)' : health.healthScore >= 50 ? 'var(--warning)' : 'var(--danger)'}">${health.healthScore}%</span></div>
        <div class="stat-card"><span class="stat-label">Cost</span><span class="stat-value">${health.cost}%</span></div>
        <div class="stat-card"><span class="stat-label">Time</span><span class="stat-value">${health.time}%</span></div>
        <div class="stat-card"><span class="stat-label">Quality</span><span class="stat-value">${health.quality}%</span></div>
      </div>
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Project Details</h3></div>
          <div class="grid grid-2">
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Project Name</div><div class="portfolio-meta-value">${this.escape(data.projectDetails.name)}</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Manager</div><div class="portfolio-meta-value">${this.escape(data.projectDetails.manager)}</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Reporting Period</div><div class="portfolio-meta-value">${this.escape(data.projectDetails.reportingPeriod)}</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Audience</div><div class="portfolio-meta-value">${this.escape(data.projectDetails.audience)}</div></div>
          </div>
          <div style="margin-top:12px;font-size:13px;color:var(--text-secondary);line-height:1.7">${this.escape(data.projectDetails.purpose)}</div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Overall Health</h3>${statusBadge(health.status.toUpperCase())}</div>
          <div class="metric-bar"><span class="metric-label">Risk Level</span><div class="metric-track"><div class="metric-fill" style="width:${health.riskLevel === 'High' ? 85 : health.riskLevel === 'Medium' ? 60 : 30}%;background:${health.riskLevel === 'High' ? '#ef4444' : health.riskLevel === 'Medium' ? '#f59e0b' : '#10b981'}"></div></div><span class="metric-value">${health.riskLevel}</span></div>
          <div class="metric-bar"><span class="metric-label">Stakeholders</span><div class="metric-track"><div class="metric-fill" style="width:${health.stakeholderAlignment}%;background:var(--accent)"></div></div><span class="metric-value">${health.stakeholderAlignment}%</span></div>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-top:14px">${this.escape(health.summary)}</p>
        </div>
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Key Achievements</h3></div>
          ${data.achievements.map(item => `<div class="pipeline-stage completed"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Challenges</h3></div>
          ${data.challenges.map(item => `<div class="pipeline-stage pending"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-header"><h3 class="card-title">Final Conclusion</h3></div>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin:0">${this.escape(data.conclusion)}</p>
      </div>
    `;
    this.mount('pmPageContent', html);
  },

  renderScope(data) {
    const html = `
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Defined Scope</h3></div>
          ${data.definedScope.map(item => `<span class="scope-tag mvp">${this.escape(item)}</span>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Scope Changes</h3></div>
          ${data.scopeChanges.length ? data.scopeChanges.map(item => `
            <div class="decision-log-item">
              <div class="decision-log-title">${this.escape(item.title)}</div>
              <div class="decision-log-meta">
                <span>${statusBadge(item.status.toUpperCase().replace(/ /g, '_'))}</span>
                <span>Impact: ${this.escape(item.impact)}</span>
                <span>${this.escape(item.effort)}</span>
              </div>
            </div>
          `).join('') : '<p style="font-size:13px;color:var(--text-muted)">No scope changes recorded.</p>'}
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-header"><h3 class="card-title">Change Requests</h3></div>
        <div class="table-container">
          <table>
            <thead><tr><th>ID</th><th>Request</th><th>Status</th><th>Impact</th><th>Effort</th></tr></thead>
            <tbody>
              ${data.changeRequests.map(item => `
                <tr>
                  <td style="font-family:var(--mono);color:var(--accent)">${this.escape(item.id)}</td>
                  <td>${this.escape(item.title)}</td>
                  <td>${statusBadge(item.status.toUpperCase().replace(/ /g, '_'))}</td>
                  <td>${this.escape(item.impact)}</td>
                  <td>${this.escape(item.effort)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    this.mount('pmPageContent', html);
  },

  renderSchedule(data) {
    const html = `
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="stat-card"><span class="stat-label">% On-Time Delivery</span><span class="stat-value">${data.onTimeDelivery}%</span></div>
        <div class="stat-card"><span class="stat-label">SPI</span><span class="stat-value">${data.spi}</span></div>
        <div class="stat-card"><span class="stat-label">Milestones</span><span class="stat-value">${data.milestones.length}</span></div>
        <div class="stat-card"><span class="stat-label">Delays</span><span class="stat-value" style="color:${data.delays.length ? 'var(--warning)' : 'var(--success)'}">${data.delays.length}</span></div>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">Milestones</h3></div>
        ${data.milestones.map(item => `
          <div class="roadmap-row">
            <span class="roadmap-label">${this.escape(item.name)}</span>
            <div class="roadmap-tracks">
              <div class="roadmap-planned" style="width:${item.planned}%"></div>
              <div class="roadmap-actual" style="width:${item.actual}%"></div>
            </div>
            <span class="roadmap-pct">${item.actual}%</span>
          </div>
        `).join('')}
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Delay Reasons</h3></div>
          ${data.delayReasons.map(item => `<div class="pipeline-stage pending"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Mitigation Actions</h3></div>
          ${data.mitigationActions.map(item => `<div class="pipeline-stage completed"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
        </div>
      </div>
    `;
    this.mount('pmPageContent', html);
  },

  renderCost(data) {
    const varianceColor = data.costVariance >= 0 ? 'var(--success)' : 'var(--danger)';
    const html = `
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="stat-card"><span class="stat-label">Budget</span><span class="stat-value">$${Math.round(data.budget / 1000)}K</span></div>
        <div class="stat-card"><span class="stat-label">Actual Spend</span><span class="stat-value">$${Math.round(data.actualSpend / 1000)}K</span></div>
        <div class="stat-card"><span class="stat-label">Forecast</span><span class="stat-value">$${Math.round(data.forecast / 1000)}K</span></div>
        <div class="stat-card"><span class="stat-label">CPI</span><span class="stat-value" style="color:${data.cpi >= 1 ? 'var(--success)' : 'var(--warning)'}">${data.cpi}</span></div>
      </div>
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Cost Variance</h3></div>
          <div style="font-size:32px;font-weight:700;color:${varianceColor};margin-bottom:12px">$${Math.round(Math.abs(data.costVariance) / 1000)}K ${data.costVariance >= 0 ? 'Under Budget' : 'Over Budget'}</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, Math.round((data.actualSpend / Math.max(data.budget, 1)) * 100))}%;background:${data.costVariance >= 0 ? '#10b981' : '#ef4444'}"></div></div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Cost Drivers</h3></div>
          ${data.costDrivers.map(item => `<div class="pipeline-stage in-progress"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
        </div>
      </div>
    `;
    this.mount('pmPageContent', html);
  },

  renderQuality(data) {
    const html = `
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="stat-card"><span class="stat-label">Defect Density</span><span class="stat-value">${data.defectDensity}</span></div>
        <div class="stat-card"><span class="stat-label">Defect Leakage</span><span class="stat-value">${data.defectLeakage}%</span></div>
        <div class="stat-card"><span class="stat-label">Test Coverage</span><span class="stat-value">${data.testCoverage}%</span></div>
        <div class="stat-card"><span class="stat-label">Automation Coverage</span><span class="stat-value">${data.automationCoverage}%</span></div>
      </div>
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Quality Trends</h3></div>
          ${data.qualityTrends.map(item => `<div class="metric-bar"><span class="metric-label">${this.escape(item.label)}</span><div class="metric-track"><div class="metric-fill" style="width:${item.value}%;background:${item.status === 'POSITIVE' ? '#10b981' : '#f59e0b'}"></div></div><span class="metric-value">${item.value}%</span></div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Quality Risks</h3></div>
          ${data.risks.map(item => `<div class="pipeline-stage pending"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-header"><h3 class="card-title">Improvement Actions</h3></div>
        ${data.improvementActions.map(item => `<div class="pipeline-stage completed"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
      </div>
    `;
    this.mount('pmPageContent', html);
  },

  renderResources(data) {
    const html = `
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="stat-card"><span class="stat-label">Team Size</span><span class="stat-value">${data.teamSize}</span></div>
        <div class="stat-card"><span class="stat-label">Utilization</span><span class="stat-value">${data.utilization}%</span></div>
        <div class="stat-card"><span class="stat-label">Attrition</span><span class="stat-value">${this.escape(data.attrition)}</span></div>
        <div class="stat-card"><span class="stat-label">Stability</span><span class="stat-value">${this.escape(data.stability)}</span></div>
      </div>
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Skill Updates</h3></div>
          ${data.skillUpdates.map(item => `<div class="pipeline-stage in-progress"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Resource Planning Actions</h3></div>
          ${data.resourcePlanningActions.map(item => `<div class="pipeline-stage completed"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
        </div>
      </div>
    `;
    this.mount('pmPageContent', html);
  },

  renderRisks(data) {
    const html = `
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Identified Risks</h3></div>
          ${data.identifiedRisks.map(item => `
            <div class="decision-log-item">
              <div class="decision-log-title">${this.escape(item.title)}</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">${this.escape(item.mitigation)}</div>
              <div class="decision-log-meta">
                <span>Impact: ${this.escape(item.impact)}</span>
                <span>Probability: ${this.escape(item.probability)}</span>
                <span>${statusBadge(item.status.toUpperCase().replace(/ /g, '_'))}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Status Tracking</h3></div>
          ${data.statusTracking.map(item => `<div class="metric-bar"><span class="metric-label">${this.escape(item.owner)}</span><div class="metric-track"><div class="metric-fill" style="width:${item.severity === 'Critical' ? 90 : item.severity === 'High' ? 70 : 45}%;background:${item.severity === 'Critical' ? '#ef4444' : item.severity === 'High' ? '#f59e0b' : '#3b82f6'}"></div></div><span class="metric-value">${this.escape(item.status)}</span></div>`).join('')}
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-header"><h3 class="card-title">Active Issues</h3></div>
        ${data.activeIssues.length ? renderIssues(data.activeIssues.map(item => ({
          id: item.id,
          title: item.title,
          type: 'Issue',
          priority: item.priority,
          status: item.status
        }))) : '<p style="font-size:13px;color:var(--text-muted)">No active issues logged.</p>'}
      </div>
    `;
    this.mount('pmPageContent', html);
  },

  renderGovernance(data) {
    const html = `
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="stat-card"><span class="stat-label">Stakeholder Engagement</span><span class="stat-value">${data.stakeholderEngagement}%</span></div>
        <div class="stat-card"><span class="stat-label">Compliance Status</span><span class="stat-value" style="font-size:18px">${this.escape(data.complianceStatus)}</span></div>
        <div class="stat-card"><span class="stat-label">Audit Status</span><span class="stat-value" style="font-size:18px">${this.escape(data.auditStatus)}</span></div>
        <div class="stat-card"><span class="stat-label">Approvals</span><span class="stat-value">${data.approvals.length}</span></div>
      </div>
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Meetings / Reviews</h3></div>
          ${data.meetingsReviews.map(item => `<div class="pipeline-stage in-progress"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Feedback</h3></div>
          ${data.feedback.map(item => `<div class="pipeline-stage completed"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-header"><h3 class="card-title">Compliance & Audit</h3></div>
        ${renderGovernance({ approvals: data.approvals, auditLog: data.auditLog, ceilings: [] })}
      </div>
    `;
    this.mount('pmPageContent', html);
  },

  renderSummary(data) {
    const html = `
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Forward Plan</h3></div>
          ${data.forwardPlan.map(item => `<div class="pipeline-stage in-progress"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Recommendations</h3></div>
          ${data.recommendations.map(item => `<div class="pipeline-stage completed"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-header"><h3 class="card-title">Final Project Health Conclusion</h3></div>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin:0">${this.escape(data.conclusion)}</p>
      </div>
    `;
    this.mount('pmPageContent', html);
  },

  renderProgressReport(data) {
    const overall = data.overallStatus;
    const kpis = data.kpis;
    const statusColor = overall.status === 'On Track' ? '#10b981' : overall.status === 'At Risk' ? '#f59e0b' : '#ef4444';
    const riskColor = kpis.riskLevel === 'Low' ? '#10b981' : kpis.riskLevel === 'Medium' ? '#f59e0b' : '#ef4444';
    const qualityColor = kpis.qualityScore >= 75 ? '#10b981' : kpis.qualityScore >= 60 ? '#f59e0b' : '#ef4444';
    const budgetColor = data.costImpact.overrunRisk === 'Low' ? '#10b981' : data.costImpact.overrunRisk === 'Medium' ? '#f59e0b' : '#ef4444';
    const completionColor = kpis.completion >= 75 ? '#10b981' : kpis.completion >= 50 ? '#f59e0b' : '#ef4444';
    const featureSummary = `${data.roadmapAlignment.deliveredFeatureCount}/${data.roadmapAlignment.plannedFeatureCount} features delivered`;
    const html = `
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="stat-card"><span class="stat-label">Completion %</span><span class="stat-value" style="color:${completionColor}">${kpis.completion}%</span><span class="stat-change">${this.escape(featureSummary)}</span></div>
        <div class="stat-card"><span class="stat-label">Velocity</span><span class="stat-value">${kpis.velocity}</span><span class="stat-change">Current execution pace</span></div>
        <div class="stat-card"><span class="stat-label">Risk Level</span><span class="stat-value" style="color:${riskColor}">${this.escape(kpis.riskLevel)}</span><span class="stat-change">Portfolio exposure</span></div>
        <div class="stat-card"><span class="stat-label">Quality Score</span><span class="stat-value" style="color:${qualityColor}">${kpis.qualityScore}%</span><span class="stat-change">Release confidence</span></div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Overall Project Status</h3>${statusBadge(overall.status.toUpperCase().replace(/ /g, '_'))}</div>
          <div class="grid grid-2" style="align-items:center;gap:16px">
            <div style="display:flex;justify-content:center;align-items:center;padding:8px 0">
              ${renderHealthRing(overall.healthScore)}
            </div>
            <div class="grid grid-2" style="gap:10px">
              <div class="portfolio-meta-item"><div class="portfolio-meta-label">Health Score</div><div class="portfolio-meta-value" style="color:${statusColor}">${overall.healthScore}%</div></div>
              <div class="portfolio-meta-item"><div class="portfolio-meta-label">Phase</div><div class="portfolio-meta-value">${this.escape(overall.phase)}</div></div>
              <div class="portfolio-meta-item"><div class="portfolio-meta-label">Delivery Status</div><div class="portfolio-meta-value" style="color:${statusColor}">${this.escape(overall.status)}</div></div>
              <div class="portfolio-meta-item"><div class="portfolio-meta-label">Quality Signal</div><div class="portfolio-meta-value" style="color:${qualityColor}">${kpis.qualityScore}%</div></div>
            </div>
          </div>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-top:14px">${this.escape(overall.summary)}</p>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Business / User Impact</h3></div>
          <div class="pipeline-stage completed"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(data.businessImpact.valueDelivered)}</div></div></div>
          <div class="pipeline-stage in-progress"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(data.businessImpact.userBusinessImpact)}</div></div></div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><h3 class="card-title">Feature / Module Progress</h3><span class="tag">${data.featureProgress.length} tracked features</span></div>
        <div class="table-container">
          <table>
            <thead><tr><th>Feature / Module</th><th>Status</th><th>Completion %</th><th>Delivery Progress</th></tr></thead>
            <tbody>
              ${data.featureProgress.map(item => {
                const color = item.status === 'Completed' ? '#10b981' : item.status === 'In Progress' ? '#f59e0b' : '#6b7280';
                return `
                  <tr>
                    <td>${this.escape(item.name)}</td>
                    <td><span class="status-badge" style="background:${color}20;color:${color};border:1px solid ${color}40">${this.escape(item.status)}</span></td>
                    <td>${item.completion}%</td>
                    <td><div class="metric-track"><div class="metric-fill" style="width:${item.completion}%;background:${color}"></div></div></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid grid-2" style="margin-top:16px">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Roadmap Alignment</h3></div>
          <div class="grid grid-3" style="gap:10px;margin-bottom:14px">
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Planned</div><div class="portfolio-meta-value">${data.roadmapAlignment.plannedFeatureCount}</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Delivered</div><div class="portfolio-meta-value">${data.roadmapAlignment.deliveredFeatureCount}</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">In Progress</div><div class="portfolio-meta-value">${data.roadmapAlignment.inProgressFeatureCount}</div></div>
          </div>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-bottom:12px">Roadmap execution is currently tracking at ${data.roadmapAlignment.deliveredFeatureCount} delivered features against ${data.roadmapAlignment.plannedFeatureCount} planned items, with deviations called out below for fast product decisions.</p>
          ${data.roadmapAlignment.deviations.map(item => `
            <div class="decision-log-item">
              <div class="decision-log-title">${this.escape(item.feature)}</div>
              <div style="font-size:12px;color:var(--text-secondary)">${this.escape(item.note)}</div>
            </div>
          `).join('')}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Scope Tracking</h3></div>
          <div class="grid grid-2" style="gap:10px;margin-bottom:14px">
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Defined Scope</div><div class="portfolio-meta-value">${data.scopeTracking.definedScopeCount}</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Current Scope</div><div class="portfolio-meta-value">${data.scopeTracking.currentScopeCount}</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Change Requests</div><div class="portfolio-meta-value">${data.scopeTracking.changeRequestCount}</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Scope Delta</div><div class="portfolio-meta-value" style="color:${data.scopeTracking.scopeDelta > 0 ? '#f59e0b' : '#10b981'}">${data.scopeTracking.scopeDelta >= 0 ? '+' : ''}${data.scopeTracking.scopeDelta}</div></div>
          </div>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.7">${this.escape(data.scopeTracking.impactSummary)}</p>
          ${data.scopeTracking.scopeChanges.length ? data.scopeTracking.scopeChanges.map(item => `
            <div class="decision-log-item">
              <div class="decision-log-title">${this.escape(item.title)}</div>
              <div class="decision-log-meta">
                <span>${statusBadge(item.status.toUpperCase().replace(/ /g, '_'))}</span>
                <span>Impact: ${this.escape(item.impact)}</span>
                <span>${this.escape(item.effort)}</span>
              </div>
            </div>
          `).join('') : '<p style="font-size:13px;color:var(--text-muted)">No scope changes recorded.</p>'}
        </div>
      </div>

      <div class="grid grid-2" style="margin-top:16px">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Timeline / Schedule Status</h3></div>
          <div class="grid grid-2" style="gap:10px;margin-bottom:14px">
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Milestones Achieved</div><div class="portfolio-meta-value" style="color:var(--success)">${data.timelineStatus.achievedMilestones}</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Delayed Milestones</div><div class="portfolio-meta-value" style="color:${data.timelineStatus.delayedMilestones ? 'var(--warning)' : 'var(--success)'}">${data.timelineStatus.delayedMilestones}</div></div>
          </div>
          ${data.timelineStatus.milestones.map(item => `
            <div class="roadmap-row">
              <span class="roadmap-label">${this.escape(item.name)}</span>
              <div class="roadmap-tracks">
                <div class="roadmap-planned" style="width:${item.planned}%"></div>
                <div class="roadmap-actual" style="width:${item.actual}%"></div>
              </div>
              <span class="roadmap-pct">${item.actual}%</span>
            </div>
          `).join('')}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Delay Reasons</h3></div>
          ${data.timelineStatus.reasons.map(item => `<div class="pipeline-stage pending"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
        </div>
      </div>

      <div class="grid grid-2" style="margin-top:16px">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Cost / Effort Impact</h3></div>
          <div class="grid grid-2" style="gap:10px;margin-bottom:14px">
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Budget Utilization</div><div class="portfolio-meta-value" style="color:${budgetColor}">${data.costImpact.budgetPct}%</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Overrun Risk</div><div class="portfolio-meta-value" style="color:${budgetColor}">${this.escape(data.costImpact.overrunRisk)}</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Budget</div><div class="portfolio-meta-value">$${Math.round(data.costImpact.budgetAllocated / 1000)}K</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Spent</div><div class="portfolio-meta-value">$${Math.round(data.costImpact.budgetSpent / 1000)}K</div></div>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(data.costImpact.budgetPct, 100)}%;background:${budgetColor}"></div></div>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-top:12px">Forecast spend is $${Math.round(data.costImpact.forecast / 1000)}K, indicating a ${this.escape(data.costImpact.overrunRisk.toLowerCase())} overrun risk on the current delivery path.</p>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Quality Overview</h3></div>
          <div class="grid grid-2" style="gap:10px;margin-bottom:14px">
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Defect Rate</div><div class="portfolio-meta-value">${data.qualityOverview.defectRate}</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Testing Status</div><div class="portfolio-meta-value">${this.escape(data.qualityOverview.testingStatus)}</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Release Readiness</div><div class="portfolio-meta-value" style="color:${qualityColor}">${this.escape(data.qualityOverview.releaseReadiness)}</div></div>
            <div class="portfolio-meta-item"><div class="portfolio-meta-label">Quality Score</div><div class="portfolio-meta-value" style="color:${qualityColor}">${data.qualityOverview.qualityScore}%</div></div>
          </div>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.7">Quality posture reflects current testing confidence, defect signal, and readiness to support the next planned product release.</p>
        </div>
      </div>

      <div class="grid grid-2" style="margin-top:16px">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Risks & Issues</h3></div>
          ${data.risksIssues.activeRisks.map(item => {
            const color = item.severity === 'Critical' || item.severity === 'High' ? '#ef4444' : item.severity === 'Medium' ? '#f59e0b' : '#10b981';
            return `
              <div class="decision-log-item">
                <div class="decision-log-title">${this.escape(item.title)}</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">${this.escape(item.mitigation)}</div>
                <div class="decision-log-meta">
                  <span style="color:${color};font-weight:600">${this.escape(item.severity)}</span>
                  <span>${statusBadge(item.status.toUpperCase().replace(/ /g, '_'))}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Active Product Issues</h3></div>
          ${data.risksIssues.activeIssues.length ? renderIssues(data.risksIssues.activeIssues.map(item => ({
            id: item.id,
            title: item.title,
            type: 'Issue',
            priority: item.priority,
            status: item.status
          }))) : '<p style="font-size:13px;color:var(--text-muted)">No active product issues logged.</p>'}
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><h3 class="card-title">Next Steps / Product Decisions</h3></div>
        <div class="grid grid-2" style="gap:16px">
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px">Upcoming Priorities</div>
            ${data.nextSteps.priorities.map(item => `<div class="pipeline-stage in-progress"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px">Decisions Required</div>
            ${data.nextSteps.decisionsRequired.map(item => `<div class="pipeline-stage pending"><div class="pipeline-stage-info"><div class="pipeline-stage-name">${this.escape(item)}</div></div></div>`).join('')}
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><h3 class="card-title">Decision Summary</h3></div>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin:0">The product is <span style="color:${statusColor};font-weight:700">${this.escape(overall.status)}</span> in the <span style="color:var(--accent);font-weight:700">${this.escape(overall.phase)}</span> phase. Completion is at <span style="color:${completionColor};font-weight:700">${kpis.completion}%</span>, roadmap delivery stands at <span style="color:var(--accent);font-weight:700">${this.escape(featureSummary)}</span>, budget utilization is <span style="color:${budgetColor};font-weight:700">${data.costImpact.budgetPct}%</span>, and release confidence is <span style="color:${qualityColor};font-weight:700">${data.qualityOverview.qualityScore}%</span>. The immediate PM focus is to resolve roadmap deviations, contain scope or cost pressure, and clear the decisions required for the next milestone.</p>
      </div>
    `;
    this.mount('pmPageContent', html);
  }
};
