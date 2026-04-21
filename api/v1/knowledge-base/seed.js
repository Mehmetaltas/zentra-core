import { getPool } from "../../../lib/neon.js";

function json(res, status, body) {
  res.status(status).json(body);
}

const SEED = [

  {category:"risk", name:"payment_stress", description:"ödeme gücü zayıflığı", logic_type:"rule", input_fields:"income,debt,payment", output_fields:"stress_score", priority:"high"},
  {category:"risk", name:"debt_pressure", description:"borç baskısı", logic_type:"rule", input_fields:"debt,liquidity", output_fields:"risk_score", priority:"high"},

  {category:"market", name:"fx_pressure", description:"kur baskısı", logic_type:"rule", input_fields:"fx,volatility", output_fields:"macro_pressure", priority:"high"},
  {category:"market", name:"rate_stress", description:"faiz baskısı", logic_type:"rule", input_fields:"interest_rate", output_fields:"stress_level", priority:"high"},

  {category:"macro", name:"country_risk", description:"ülke risk mantığı", logic_type:"rule", input_fields:"country,macro", output_fields:"risk_band", priority:"high"},

  {category:"trade", name:"counterparty_risk", description:"alıcı/satıcı güveni", logic_type:"rule", input_fields:"partner,data", output_fields:"trust_score", priority:"high"},
  {category:"trade", name:"shipment_delay", description:"gecikme etkisi", logic_type:"rule", input_fields:"eta,delay", output_fields:"delay_risk", priority:"medium"},

  {category:"contract", name:"unfair_terms", description:"haksız şart analizi", logic_type:"rule", input_fields:"contract", output_fields:"fairness_score", priority:"high"},
  {category:"contract", name:"hidden_cost", description:"gizli maliyet", logic_type:"rule", input_fields:"contract", output_fields:"cost_risk", priority:"high"},

  {category:"document", name:"bank_statement", description:"banka dökümü tanıma", logic_type:"classifier", input_fields:"doc", output_fields:"type", priority:"high"},
  {category:"document", name:"contract_doc", description:"sözleşme tanıma", logic_type:"classifier", input_fields:"doc", output_fields:"type", priority:"high"}

];

export default async function handler(req, res) {
  try {
    const db = getPool();

    await db.query(`
      create table if not exists knowledge_base (
        id bigserial primary key,
        category text,
        name text unique,
        description text,
        logic_type text,
        input_fields text,
        output_fields text,
        priority text,
        active boolean default true
      );
    `);

    for (const item of SEED) {
      await db.query(`
        insert into knowledge_base (
          category,name,description,logic_type,
          input_fields,output_fields,priority
        )
        values ($1,$2,$3,$4,$5,$6,$7)
        on conflict (name) do nothing
      `, [
        item.category,
        item.name,
        item.description,
        item.logic_type,
        item.input_fields,
        item.output_fields,
        item.priority
      ]);
    }

    const result = await db.query(`select * from knowledge_base`);

    return json(res, 200, {
      ok: true,
      count: result.rows.length,
      items: result.rows
    });

  } catch (e) {
    return json(res, 500, {
      ok: false,
      error: String(e.message || e)
    });
  }
}
