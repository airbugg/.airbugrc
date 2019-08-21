function includeAmbassadorFiles(config) {
  config.files.push({ pattern: 'rpc/**', instrument: true });
}

module.exports = function (wallaby) {
  const config = require('yoshi/config/wallaby-jest')(wallaby);
  includeAmbassadorFiles(config);
  return config;
};
