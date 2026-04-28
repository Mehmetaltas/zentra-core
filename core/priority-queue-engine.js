
/*
ZENTRA — PRIORITY QUEUE ENGINE V1
Priority-based Mission Queue
*/

const EXEC = require('./execution-engine');

const PRIORITY_QUEUE = {

  queue: [],

  add(mission, priority="normal") {

    const levels = {
      critical: 3,
      high: 2,
      normal: 1,
      low: 0
    };

    this.queue.push({
      ...mission,
      priority,
      priority_level: levels[priority] || 1,
      status: "waiting",
      ts: new Date().toISOString()
    });

    console.log("Queued:", mission.id, "| priority:", priority);
  },

  sort() {
    this.queue.sort((a, b) => b.priority_level - a.priority_level);
  },

  run() {

    this.sort();

    const results = [];

    while (this.queue.length > 0) {

      const m = this.queue.shift();

      try {

        EXEC.startMission(m.id);

        results.push({
          mission_id: m.id,
          priority: m.priority,
          status: "executed"
        });

      } catch (e) {

        results.push({
          mission_id: m.id,
          priority: m.priority,
          status: "failed",
          error: String(e)
        });

      }

    }

    return {
      results,
      ts: new Date().toISOString()
    };
  }

};

module.exports = PRIORITY_QUEUE;

