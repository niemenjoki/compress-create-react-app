const fs = require('fs');
const path = require('path');
const appRoot = require('app-root-path').path;
const args = require('./args');
const defaultConfig = require('./defaultConfig');
const config = require('./getConfig');

const getBuildDirectory = () => {
  const relativeBuildPath =
    args.directory !== defaultConfig.directory
      ? args.directory
      : config.directory;

  const absoluteBuildPath = path.join(appRoot, relativeBuildPath);
  if (!fs.existsSync(absoluteBuildPath)) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      `No directory found at: ${path.join(appRoot, relativeBuildPath)}.`
    );
    console.log('Please provide the relative path from the project root');
    process.exit(1);
  }

  return absoluteBuildPath;
};

module.exports = getBuildDirectory;
