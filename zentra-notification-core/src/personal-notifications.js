const fs=require("fs");
const https=require("https");

const BOT_TOKEN="8590764340:AAFjjvfespCcl6gRw6uTXgQLnngDpmRBAZQ";
const CHAT_ID="798597064";

function read(p){try{return JSON.parse(fs.readFileSync(p,"utf8"))}catch{return null}}
function write(p,d){fs.mkdirSync(p.split("/").slice(0,-1).join("/"),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2))}
function tg(msg){
  const url=`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}`;
  https.get(url,res=>res.on("data",()=>{})).on("error",()=>{});
}

const client=read("zentra-client-intel/results/client_profile.json");
const basket=read("zentra-opportunity-basket/results/opportunity_basket.json");
const outcome=read("zentra-outcome-engine/results/outcome_result.json");
const proof=read("zentra-proof-tracking/results/latest_proof.json");

const messages=[];

if(client?.client){
  messages.push({
    type:"PERSONAL_PROFILE",
    title:"Kişisel Profil",
    text:`Niyet: ${client.client.intent}
Risk: ${client.client.riskTolerance}
Sermaye bandı: ${client.client.capitalBand}
Akış: eğitim + fırsat takibi + proof raporu`
  });
}

if(basket?.top?.length){
  basket.top.forEach(x=>{
    messages.push({
      type:"PERSONAL_OPPORTUNITY",
      title:`Fırsat Sepeti: ${x.symbol}`,
      text:`${x.symbol}
Skor: ${x.score}
Risk: ${x.risk}
Karar: ${x.decision}
Not: Paper-only takip. Gerçek emir yok.`
    });
  });
}

if(outcome?.summary){
  messages.push({
    type:"PERSONAL_PROOF_RESULT",
    title:"Günlük Proof Sonucu",
    text:`Bugünkü kararlar karşılaştırıldı.
Skor: ${outcome.summary.totalScore}
Accuracy: ${outcome.summary.accuracy}
Öğrenme hafızasına işlendi.`
  });
}

if(proof?.status){
  messages.push({
    type:"PERSONAL_PROOF_TRACKING",
    title:"Proof Tracking",
    text:"Bugün sistemin ne dediği kaydedildi. Sonraki döngüde sonuç, delta, doğru/yanlış ve skor karşılaştırılır."
  });
}

const report={time:new Date().toISOString(),layer:"PERSONAL",count:messages.length,messages};
write("zentra-notification-core/results/personal_notifications.json",report);

messages.forEach(m=>tg(`ZENTRA KİŞİSEL BİLDİRİM

${m.title}

${m.text}

Mode: PAPER ONLY`));

fs.appendFileSync("zentra-notification-core/logs/notification.log",new Date().toISOString()+" PERSONAL NOTIFICATIONS\n");
console.log("PERSONAL NOTIFICATIONS COMPLETE");
