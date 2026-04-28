/*
ZENTRA CORE — OPERATOR ENGINE
Agent / operator çağırma katmanı
*/

const OPERATOR_ENGINE = {
  operators: {
    productization_operator: {
      name: "Productization Operator",
      role: "Modül ve ürünü tamamlar"
    },
    execution_operator: {
      name: "Execution Operator",
      role: "Mission ve task çalıştırır"
    },
    audit_operator: {
      name: "Audit Operator",
      role: "Kanıt ve iz kontrol eder"
    }
  },

  get(operator_id) {
    return this.operators[operator_id] || null;
  },

  run(operator_id, task) {
    const operator = this.get(operator_id);

    if (!operator) {
      return {
        ok: false,
        message: "Operator not found",
        operator_id,
        task
      };
    }

    return {
      ok: true,
      operator_id,
      operator_name: operator.name,
      role: operator.role,
      task_id: task.id,
      task_name: task.name,
      status: "action_ready",
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = OPERATOR_ENGINE;
