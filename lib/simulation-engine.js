import { generateSimulationCases } from "./data-universe.js";

export async function runSimulationEngine(pool, runEngine, rules, baseInput = {}) {

  const cases = generateSimulationCases(baseInput);
  const results = [];

  for (const c of cases) {
    const result = runEngine(c, rules);

    results.push({
      scenario_type: c.scenario_type,
      input: c,
      result
    });

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
  }

  await pool.query(
    `insert into simulation_runs (run_type, case_count, summary)
     values ($1,$2,$3)`,
    [
      "auto_full_engine_run",
      cases.length,
      JSON.stringify({ decisions: results.map(r => r.result.decision) })
    ]
  );

  return {
    status: "completed",
    total_cases: cases.length,
    results
  };
}
