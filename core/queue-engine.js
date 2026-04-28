
/*
ZENTRA — QUEUE ENGINE V1
Mission Queue Manager
*/

const EXEC = require('./execution-engine');

const QUEUE = {

  queue: [],

  add(mission) {
    this.queue.push({
      ...mission,
      status: "waiting",
      ts: new Date().toISOString()
    });
    console.log("Queued:", mission.id);
  },

  run() {

    const results = [];

    while (this.queue.length > 0) {

      const m = this.queue.shift();

      try {

        EXEC.startMission(m.id);

        results.push({
          mission_id: m.id,
          status: "executed"
        });

      } catch (e) {

        results.push({
          mission_id: m.id,
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

module.exports = QUEUE;

