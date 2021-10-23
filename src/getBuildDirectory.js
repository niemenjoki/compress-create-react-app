const fs = require('fs');
const path = require('path');
const appRoot = require('app-root-path').path;
const config = require('./getConfig');

const getBuildDirectory = () => {
    const customBuildPathIndex =
      process.argv.indexOf('--directory') !== -1
        ? process.argv.indexOf('--directory') + 1
        : process.argv.indexOf('-d') + 1;
  
    const relativeBuildPath =
      customBuildPathIndex === 0 ? config.directory : process.argv[customBuildPathIndex];
  
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