const LOG = require('./logger');

const OPS = {
  execution_operator: { name: 'Execution Operator', role: 'run tasks' },
  productization_operator: { name: 'Productization Operator', role: 'build product' },
  audit_operator: { name: 'Audit Operator', role: 'verify' }
};

module.exports = {
  get(id){ return OPS[id] || null; },
  run(id, task){
    const op = OPS[id];
    if (!op) {
      LOG.error('operator_missing', {id, task_id: task.id});
      return { ok:false, error:'operator_missing', id, task };
    }
    return {
      ok:true,
      operator_id:id,
      operator_name:op.name,
      role:op.role,
      task_id:task.id,
      task_name:task.name,
      ts:new Date().toISOString()
    };
  }
};
