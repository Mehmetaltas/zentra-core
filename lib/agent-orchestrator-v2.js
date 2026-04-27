export async function runAgentOrchestratorV2(pool, context = {}) {
  await pool.query(`
    create table if not exists agent_job_registry (
      id serial primary key,
      created_at timestamptz default now(),
      job_type text,
      status text,
      input jsonb,
      output jsonb,
      next_jobs jsonb
    )
  `);

  const jobs = [];

  function createJob(type, input) {
    const job = {
      job_type: type,
      status: "pending",
      input,
      output: null,
      next_jobs: []
    };
    jobs.push(job);
    return job;
  }

  function completeJob(job, output, next = []) {
    job.status = "completed";
    job.output = output;
    job.next_jobs = next;
  }

  // INITIAL JOB
  const root = createJob("data_collection", context);

  // JOB FLOW
  completeJob(root, { collected: true }, ["validation"]);

  const validation = createJob("validation", context);
  completeJob(validation, { valid: true }, ["financial_trade"]);

  const trade = createJob("financial_trade", context);
  completeJob(trade, { fx_pressure: "HIGH" }, ["simulation"]);

  const simulation = createJob("simulation", context);
  completeJob(simulation, { scenarios: 2 }, ["learning"]);

  const learning = createJob("learning", context);
  completeJob(learning, { updated: false }, ["execution"]);

  const execution = createJob("execution", context);
  completeJob(execution, { applied: false }, []);

  // STORE
  for (const j of jobs) {
    await pool.query(
      `insert into agent_job_registry
       (job_type, status, input, output, next_jobs)
       values ($1,$2,$3,$4,$5)`,
      [
        j.job_type,
        j.status,
        JSON.stringify(j.input),
        JSON.stringify(j.output),
        JSON.stringify(j.next_jobs)
      ]
    );
  }

  return {
    status: "orchestrated",
    total_jobs: jobs.length,
    flow: jobs.map(j => ({
      job: j.job_type,
      next: j.next_jobs
    }))
  };
}
