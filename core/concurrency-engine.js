
/*
ZENTRA — CONCURRENCY ENGINE V1
Multi Mission Runner
*/

const EXEC = require('./execution-engine');
const MISSIONS = require('./mission-registry');

const CONCURRENCY = {

  runMultiple(missionList = []) {

    const results = [];

    for (const m of missionList) {

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
      missions: results,
      ts: new Date().toISOString()
    };
  }

};

module.exports = CONCURRENCY;

