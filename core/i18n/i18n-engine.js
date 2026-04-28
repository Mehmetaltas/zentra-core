const { LANGUAGES, allLanguages } = require("./languages");

function normalizeEntry(input){
  const out = {};
  const all = allLanguages();

  for(const lang of all){
    out[lang] = null;
  }

  if(typeof input === "string"){
    out[LANGUAGES.default] = input;
    return out;
  }

  for(const lang of all){
    if(input && input[lang]) out[lang] = input[lang];
  }

  return out;
}

function pick(entry, lang){
  if(!entry) return "";
  if(typeof entry === "string") return entry;

  return (
    entry[lang] ||
    entry[LANGUAGES.default] ||
    entry.en ||
    Object.values(entry).find(Boolean) ||
    ""
  );
}

function makeTR_EN_AR(tr,en,ar){
  return normalizeEntry({tr,en,ar});
}

function validateEntry(entry){
  const missingActive = LANGUAGES.active.filter(l => !entry || !entry[l]);
  return {
    ok: missingActive.length === 0,
    missingActive
  };
}

module.exports = {
  normalizeEntry,
  pick,
  makeTR_EN_AR,
  validateEntry
};
