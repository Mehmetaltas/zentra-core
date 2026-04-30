(function(){
  const API = "http://localhost:4000";

  function token(){ return localStorage.getItem("zentra_token") || ""; }
  function userId(){ return localStorage.getItem("zentra_user_id") || "agent-001"; }

  async function login(email, name=""){
    const res = await fetch(`${API}/auth/login`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ email, name })
    });
    const data = await res.json();
    if(data.ok){
      localStorage.setItem("zentra_token", data.token);
      localStorage.setItem("zentra_user_id", data.user.id);
      localStorage.setItem("zentra_user_email", data.user.email);
      localStorage.setItem("zentra_plan", data.plan);
    }
    return data;
  }

  async function me(){
    const res = await fetch(`${API}/auth/me`, {
      headers:{ Authorization:`Bearer ${token()}` }
    });
    return await res.json();
  }

  async function activatePlan(plan){
    const res = await fetch(`${API}/subscription/test-activate`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ user_id:userId(), plan })
    });
    const data = await res.json();
    if(data.ok) localStorage.setItem("zentra_plan", data.plan);
    return data;
  }

  async function runAction(type="trade", input={asset:"THY"}){
    const res = await fetch(`${API}/action`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token()}`
      },
      body: JSON.stringify({ type, input })
    });
    return await res.json();
  }

  async function getHistory(){
    const res = await fetch(`${API}/history/${userId()}`);
    return await res.json();
  }

  window.ZENTRA_CORE_API = { login, me, activatePlan, runAction, getHistory };
})();
