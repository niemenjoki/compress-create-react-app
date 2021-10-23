const fs = require('fs');
const path = require('path');
const appRoot = require('app-root-path').path;

const defaultConfig = {
  filetypes : ['.js', '.html', '.css'],
  directory : '/build'
}

const getConfig = () => {
  const configFile = path.join(appRoot, 'compress-cra.json');
  if (fs.existsSync(configFile)) {
    const strConfig = fs.readFileSync(configFile);
    const config = JSON.parse(strConfig);
    for (const key in config) {
      if (!Object.hasOwnProperty.call(defaultConfig, key)) {
        throw new Error(`[compress-create-react-app]: The option '${key}' does not exists.`);
      }
    }

    return {...defaultConfig, ...config};
  }

  return defaultConfig;
};

/** @type {{filetypes:string[], directory: string}} */
const config = getConfig();
module.exports = config;