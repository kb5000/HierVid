
module.exports = function (config, env) {
  config.experiments = {
    ...config.experiments,
    topLevelAwait: true
  }
  return config;
}
