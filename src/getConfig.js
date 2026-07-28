const fs = require('fs');
const path = require('path');
const appRoot = require('app-root-path').path;
const args = require('./args');
const supportedAlgorithms = require('./compress').supportedAlgorithms;
const defaultConfig = require('./defaultConfig');
const configFilePath = args.config;

const optionError = (key, message) => {
  throw new Error(`The option '${key}' ${message}.`);
};

const validateFiletypes = (filetypes) => {
  if (
    !Array.isArray(filetypes) ||
    filetypes.some(
      (filetype) =>
        typeof filetype !== 'string' ||
        filetype.length < 2 ||
        !filetype.startsWith('.')
    )
  ) {
    optionError('filetypes', 'must be an array of file extensions');
  }
};

const validateAlgorithms = (algorithms) => {
  if (!Array.isArray(algorithms) || algorithms.length === 0) {
    optionError('algorithms', 'must be a non-empty array');
  }

  if (new Set(algorithms).size !== algorithms.length) {
    optionError('algorithms', 'must not contain duplicates');
  }

  for (const algorithm of algorithms) {
    if (!supportedAlgorithms.includes(algorithm)) {
      throw new Error(`The algorithm '${algorithm}' is not supported.`);
    }
  }
};

const validateConfigs = (config) => {
  if (config === null || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('The configuration must be a JSON object.');
  }

  for (const key in config) {
    if (!Object.hasOwnProperty.call(defaultConfig, key)) {
      optionError(key, 'does not exist');
    }

    switch (key) {
      case 'filetypes':
        validateFiletypes(config[key]);
        break;
      case 'directory':
        if (typeof config[key] !== 'string' || config[key].trim() === '') {
          optionError(key, 'must be a non-empty string');
        }
        break;
      case 'algorithms':
        validateAlgorithms(config[key]);
        break;
      case 'retainUncompressedFiles':
      case 'asynchronousCompression':
        if (typeof config[key] !== 'boolean') {
          optionError(key, 'must be a boolean');
        }
        break;
    }
  }
};

const getConfig = () => {
  const configFile = path.join(appRoot, configFilePath);
  if (fs.existsSync(configFile)) {
    const strConfig = fs.readFileSync(configFile, 'utf8');
    const config = JSON.parse(strConfig);
    validateConfigs(config);

    return { ...defaultConfig, ...config };
  }

  return defaultConfig;
};

/** @type {{filetypes:string[], directory: string, algorithms:string[]}} */
const config = getConfig();
module.exports = config;
