window.onload = function () {

  console.log("✅ settings.js loaded");

  const tech = document.getElementById("techStackField");
  const modules = document.getElementById("modulesField");
  const team = document.getElementById("teamSizeField");
  const timeline = document.getElementById("timelineField");
  const risk = document.getElementById("riskField");
  const pricing = document.getElementById("pricingField");
  const tools = document.getElementById("toolsField");

  if (!tech || !modules || !team) {
    console.error("❌ ID mismatch OR HTML not loaded");
    return;
  }

  // FORCE DUMMY DATA
  tech.innerText = "React, Node.js, PostgreSQL";
  modules.innerHTML = "auth, payments, dashboard".split(",").map((m) => `<span>${m.trim()}</span>`).join("");
  team.innerText = "4";
  timeline.innerText = "12 weeks, 4 milestones";
  risk.innerText = "Dependency risk, scope risk";
  pricing.innerText = "Fixed bid / T&M";
  tools.innerText = "Slack, Jira, Zoom";

};
