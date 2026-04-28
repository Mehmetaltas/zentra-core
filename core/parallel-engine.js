
/*
ZENTRA — PARALLEL ENGINE V1
Concurrent Mission Execution (Promise-based)
*/

const EXEC = require('./execution-engine');

const PARALLEL = {

  async run(missions = []) {

    const tasks = missions.map(m => {

      return new Promise((resolve) => {

        try {
          EXEC.startMission(m.id);

          resolve({
            mission_id: m.id,
            status: "executed"
          });

        } catch (e) {

          resolve({
            mission_id: m.id,
            status: "failed",
            error: String(e)
          });

        }

      });

    });

    const results = await Promise.all(tasks);

    return {
      missions: results,
      ts: new Date().toISOString()
    };
  }

};

module.exports = PARALLEL;

