import { generateSimulationCases } from "./data-universe.js";

export async function runSimulationEngine(pool, runEngine, rules, baseInput = {}) {

  const cases = generateSimulationCases(baseInput);
  } catch (e) {
    console.log("simulation insert skipped:", e.message);
  }
  const results = [];

  for (const c of cases) {
    const result = runEngine(c, rules);
  } catch (e) {
    console.log("simulation insert skipped:", e.message);
  }

    results.push({
      scenario_type: c.scenario_type,
      input: c,
      result
    });
  } catch (e) {
    console.log("simulation insert skipped:", e.message);
  }

    try {
    await pool.query(
      `insert into simulation_results (scenario_type, input, expected_behavior, status)
       values ($1,$2,$3,$4)`,
      [
        c.scenario_type,
        JSON.stringify(c),
        result.decision,
        "completed"
      ]
    );
  } catch (e) {
    console.log("simulation insert skipped:", e.message);
  }
  }

  try {
    await pool.query(
    `insert into simulation_runs (run_type, case_count, summary)
     values ($1,$2,$3)`,
    [
      "auto_full_engine_run",
      cases.length,
      JSON.stringify({ decisions: results.map(r => r.result.decision) })
    ]
  );
  } catch (e) {
    console.log("simulation insert skipped:", e.message);
  }

  return {
    status: "completed",
    total_cases: cases.length,
    results
  };
}
