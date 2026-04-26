// NEXUS Agent-OS Global Simulation Engine
window.AgentOS = {
  agents: [],
  tasks: [],
  logs: [],
  events: [],
  timer: null,
  
  init() {
    this.startSimulation();
  },

  startSimulation() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.tick();
    }, 2000);
  },

  tick() {
    // Dispatch a global tick event
    if (window.NexusEventBus) {
      NexusEventBus.notify('simulation', 'tick', 'Simulation tick', { time: Date.now() });
    }
  }
};

window.AgentOS.init();
