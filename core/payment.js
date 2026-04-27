function simulatePayment(user, plan){
  return {
    ok:true,
    user,
    plan,
    payment_id:Math.random().toString(36).slice(2),
    status:"paid_mock"
  };
}
module.exports={simulatePayment};
