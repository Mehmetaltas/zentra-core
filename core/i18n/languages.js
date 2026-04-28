const LANGUAGES = {
  active: ["tr","en","ar"],
  extended: ["es","fr","de","ru","cn"],
  default: "tr"
};

function allLanguages(){
  return [...LANGUAGES.active, ...LANGUAGES.extended];
}

module.exports = { LANGUAGES, allLanguages };
