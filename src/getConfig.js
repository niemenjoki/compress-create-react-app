const fs = require('fs');
const path = require('path');
const appRoot = require('app-root-path').path;
const args = require('./args');
const supportedAlgorithms = require('./compress').supportedAlgorithms;
const defaultConfig = require('./defaultConfig');
const configFilePath = args.config;

const validateAlgorithms = (key, config) => {
  if (key === 'algorithms') {
    for (const algorithm of config[key]) {
      if (!supportedAlgorithms.includes(algorithm)) {
        throw new Error(
          `[compress-create-react-app]: The algorithm '${algorithm}' is not supported.`
        );
      }
    }
  }
};

const validateConfigs = (config) => {
  for (const key in config) {
    if (!Object.hasOwnProperty.call(defaultConfig, key)) {
      throw new Error(
        `[compress-create-react-app]: The option '${key}' does not exists.`
      );
    }

    validateAlgorithms(key, config);
  }
};

const getConfig = () => {
  const configFile = path.join(appRoot, configFilePath);
  if (fs.existsSync(configFile)) {
    const strConfig = fs.readFileSync(configFile);
    const config = JSON.parse(strConfig);
    validateConfigs(config);

    return { ...defaultConfig, ...config };
  }

  return defaultConfig;
};

/** @type {{filetypes:string[], directory: string, algorithms:string[]}} */
const config = getConfig();
module.exports = config;
