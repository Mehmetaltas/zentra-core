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

const marketIntel=read("zentra-learning-core/results/market_intel.json");
const academia=read("zentra-academia-core/results/academia_expansion_report.json");

const messages=[];

messages.push({
  type:"GENERAL_MARKET_PULSE",
  title:"ZENTRA Free Feed",
  text:"Genel piyasa, risk iştahı, makro gündem ve ZENTRA lens notu takipte. Yatırım tavsiyesi değildir."
});

if(marketIntel?.insights?.opportunities?.length){
  messages.push({
    type:"GENERAL_MARKET_OPPORTUNITY",
    title:"Market Intel",
    text:"Piyasa ihtiyaçlarından yeni fırsat alanları tespit edildi: "+marketIntel.insights.opportunities.slice(0,3).join(" | ")
  });
}

if(academia?.productCandidates?.length){
  messages.push({
    type:"GENERAL_ACADEMIA_RADAR",
    title:"Academia AI",
    text:"Sökümden ürünleşebilir adaylar çıktı. Ham alınır, işlenmeden ürün yapılmaz."
  });
}

const report={time:new Date().toISOString(),layer:"GENERAL",count:messages.length,messages};
write("zentra-notification-core/results/general_notifications.json",report);

messages.forEach(m=>tg(`ZENTRA GENEL BİLDİRİM

${m.title}

${m.text}

Mode: PAPER ONLY`));

fs.appendFileSync("zentra-notification-core/logs/notification.log",new Date().toISOString()+" GENERAL NOTIFICATIONS\n");
console.log("GENERAL NOTIFICATIONS COMPLETE");
