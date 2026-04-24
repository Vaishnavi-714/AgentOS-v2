// NEXUS Event Bus — publish/subscribe pattern for cross-module communication
const NexusEventBus = {
  _listeners: {},
  _history: [],

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
    return () => { this._listeners[event] = this._listeners[event].filter(cb => cb !== callback); };
  },

  emit(event, data) {
    const entry = { event, data, timestamp: new Date().toISOString() };
    this._history.unshift(entry);
    if (this._history.length > 200) this._history.length = 200;
    (this._listeners[event] || []).forEach(cb => { try { cb(data); } catch(e) { console.error('EventBus error:', e); } });
    // Persist notifications for cross-page consumption
    if (event.startsWith('notification:')) {
      const notifs = NexusStore.get('notifications') || [];
      notifs.unshift({ id: 'NOTIF-' + Date.now().toString(36).toUpperCase(), ...data, event, timestamp: entry.timestamp, read: false });
      if (notifs.length > 300) notifs.length = 300;
      NexusStore.set('notifications', notifs);
    }
  },

  getHistory(event) {
    return event ? this._history.filter(e => e.event === event) : this._history;
  },

  // Common events
  notify(type, title, message, meta = {}) {
    this.emit('notification:' + type, { type, title, message, ...meta });
  }
};
