(function(){
  const API = "http://localhost:4000";

  function token(){ return localStorage.getItem("zentra_token") || ""; }
  function setUser(data){
    localStorage.setItem("zentra_token", data.token);
    localStorage.setItem("zentra_user", JSON.stringify(data.user));
    localStorage.setItem("zentra_user_id", data.user.id);
  }

  async function login(email, name){
    const r = await fetch(`${API}/login`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email,name})
    });
    const data = await r.json();
    if(data.ok) setUser(data);
    return data;
  }

  async function action(product="trade", input={asset:"THY"}){
    const r = await fetch(`${API}/action`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer " + token()
      },
      body:JSON.stringify({product,type:product,input})
    });
    return await r.json();
  }

  async function workspace(){
    const r = await fetch(`${API}/workspace`, {
      headers:{ "Authorization":"Bearer " + token() }
    });
    return await r.json();
  }

  async function paymentRequest(plan="core"){
    const r = await fetch(`${API}/payment/request`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer " + token()
      },
      body:JSON.stringify({plan})
    });
    return await r.json();
  }

  window.ZENTRA_COMMERCIAL_CORE = { login, action, workspace, paymentRequest };
})();
