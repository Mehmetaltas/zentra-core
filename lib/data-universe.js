export function generateSimulationCases(input = {}) {
  const income = Number(input.income || 20000);
  const debt = Number(input.debt || 60000);
  const monthlyPayment = Number(input.monthly_payment || Math.round(income * 0.3));
  const totalLimit = Number(input.total_limit || Math.round(income * 3));

  return [
    {
      scenario_type: "clean_case",
      product_context: input.product_context || "intel",
      income,
      debt: Math.round(income * 0.2),
      monthly_payment: Math.round(income * 0.05),
      total_limit: Math.round(income * 1)
    },
    {
      scenario_type: "review_case",
      product_context: input.product_context || "intel",
      income,
      debt: Math.round(income * 3),
      monthly_payment: Math.round(income * 0.35),
      total_limit: Math.round(income * 3.5)
    },
    {
      scenario_type: "stress_case",
      product_context: input.product_context || "intel",
      income,
      debt: Math.round(income * 5),
      monthly_payment: Math.round(income * 0.55),
      total_limit: Math.round(income * 5)
    },
    {
      scenario_type: "extreme_case",
      product_context: input.product_context || "intel",
      income,
      debt: Math.round(income * 15),
      monthly_payment: Math.round(income * 1),
      total_limit: Math.round(income * 8)
    },
    {
      scenario_type: "edge_zero_income",
      product_context: input.product_context || "intel",
      income: 0,
      debt,
      monthly_payment: monthlyPayment,
      total_limit: totalLimit
    },
    {
      scenario_type: "edge_high_limit_low_debt",
      product_context: input.product_context || "intel",
      income,
      debt: Math.round(income * 0.2),
      monthly_payment: Math.round(income * 0.05),
      total_limit: Math.round(income * 6)
    }
  ];
}
