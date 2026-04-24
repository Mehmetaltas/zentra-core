export async function getLiveContext() {
  const context = {
    status: "partial_live",
    sources: [],
    tcmb_fx: null,
    world_bank: null,
    bist: {
      status: "not_connected",
      reason: "BIST real-time/market data requires licensed data access."
    },
    updated_at: new Date().toISOString()
  };

  // TCMB daily FX XML - no key
  try {
    const r = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml");
    const xml = await r.text();

    function fx(code) {
      const block = xml.match(new RegExp(`<Currency[^>]*CurrencyCode="${code}"[\\s\\S]*?<\\/Currency>`));
      if (!block) return null;
      const text = block[0];
      const buy = text.match(/<ForexBuying>(.*?)<\/ForexBuying>/)?.[1] || null;
      const sell = text.match(/<ForexSelling>(.*?)<\/ForexSelling>/)?.[1] || null;
      return {
        code,
        forex_buying: buy ? Number(buy) : null,
        forex_selling: sell ? Number(sell) : null
      };
    }

    context.tcmb_fx = {
      USD: fx("USD"),
      EUR: fx("EUR"),
      GBP: fx("GBP")
    };
    context.sources.push("TCMB daily FX XML");
  } catch (e) {
    context.tcmb_fx = { error: String(e.message || e) };
  }

  // World Bank macro indicators - no key
  try {
    async function wb(indicator) {
      const url = `https://api.worldbank.org/v2/country/TR/indicator/${indicator}?format=json&per_page=3`;
      const r = await fetch(url);
      const j = await r.json();
      const rows = Array.isArray(j) ? j[1] || [] : [];
      const latest = rows.find(x => x && x.value !== null);
      return latest ? {
        indicator,
        year: latest.date,
        value: latest.value
      } : null;
    }

    context.world_bank = {
      gdp_growth: await wb("NY.GDP.MKTP.KD.ZG"),
      inflation_cpi: await wb("FP.CPI.TOTL.ZG"),
      unemployment: await wb("SL.UEM.TOTL.ZS")
    };
    context.sources.push("World Bank API");
  } catch (e) {
    context.world_bank = { error: String(e.message || e) };
  }

  return context;
}
