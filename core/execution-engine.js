const MODULES = require('./module-registry');
const PRODUCTS = require('./product-registry');
const APPS = require('./app-registry');
const MISSIONS = require('./mission-registry');
const OPS = require('./operator-engine');
const AUDIT = require('./audit-engine');
const SNAP = require('./snapshot-engine');
const LOG = require('./logger');

const EXEC = {
  startMission(id){
    const m = MISSIONS.get ? MISSIONS.get(id) : MISSIONS.list().find(x=>x.id===id);
    if (!m) return LOG.error('mission_not_found',{id});

    if (m.status === 'tamamlandı') {
      return LOG.info('mission_already_completed',{id});
    }

    const mod = MODULES.get(m.module_id);
    const prod = PRODUCTS.get(m.product_id);
    const app = APPS.get(m.app_id);

    if (!mod || !prod || !app) {
      LOG.error('dependency_missing',{id, module:!!mod, product:!!prod, app:!!app});
      return;
    }

    AUDIT.log({ type:'mission_started', mission_id:id, module_id:m.module_id, product_id:m.product_id, app_id:m.app_id });

    for (const t of m.tasks) {
      this.executeTask(m, t);
    }

    MISSIONS.updateStatus(id, 'tamamlandı');

    const snap = SNAP.create({
      type:'mission_completed',
      mission_id:id,
      task_count:m.tasks.length,
      status:'tamamlandı'
    });

    AUDIT.log({ type:'mission_completed', mission_id:id, snapshot_id:snap.id });
    LOG.info('mission_done',{id});
  },

  executeTask(m, t){
    try {
      const opRes = OPS.run(t.operator, t);
      AUDIT.log({
        type:'task_operator_run',
        mission_id:m.id,
        task_id:t.id,
        operator:t.operator,
        result:opRes
      });

      const status = opRes.ok ? 'executed' : 'failed';

      AUDIT.log({
        type:'action_executed',
        mission_id:m.id,
        task_id:t.id,
        status
      });

      t.status = 'tamamlandı';
    } catch(e) {
      AUDIT.log({ type:'task_error', mission_id:m.id, task_id:t.id, error:String(e) });
      LOG.error('task_error',{e:String(e), task_id:t.id});
    }
  }
};

module.exports = EXEC;
