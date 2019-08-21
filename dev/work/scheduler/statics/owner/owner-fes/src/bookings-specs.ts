const specs = {
  // MySpecForExperiment1: {
  //   scopes: ['my-service-scope', 'my-other-scope'], // "scopes" is the recommended property to use
  //   owner: 'thatsme@wix.com',
  //   onlyForLoggedInUsers: true,
  // },
  // MySpecForExperiment2: {
  //   scopes: ['my-service-scope'],
  //   owner: 'thatsme@wix.com',
  //   onlyForLoggedInUsers: false,
  //   persistent: false,
  //   allowedForBots: false,
  //   controlGroup: 'happy',
  //   variants: ['sad'],
  // },
};

// helpers. see usage below
module.exports.all = { ...specs };
module.exports.keys = Object.keys(module.exports.all).reduce((acc, key) => {
  acc[key] = key;
  return acc;
}, {});
