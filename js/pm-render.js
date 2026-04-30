// PM Dashboard Renderer
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
