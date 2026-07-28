const fs = require('fs');
const path = require('path');
const appRoot = require('app-root-path').path;
const args = require('./args');
const defaultConfig = require('./defaultConfig');
const config = require('./getConfig');
const validateDeletionDirectory = require('./validateDeletionDirectory');

const getBuildDirectory = () => {
  const relativeBuildPath =
    args.directory !== defaultConfig.directory
      ? args.directory
      : config.directory;

  const absoluteBuildPath = path.join(appRoot, relativeBuildPath);
  if (!fs.existsSync(absoluteBuildPath)) {
    throw new Error(
      `No directory found at: ${path.join(appRoot, relativeBuildPath)}. ` +
        'Please provide the relative path from the project root.'
    );
  }

  if (!fs.statSync(absoluteBuildPath).isDirectory()) {
    throw new Error(`The build path is not a directory: ${absoluteBuildPath}.`);
  }

  if (!config.retainUncompressedFiles) {
    validateDeletionDirectory(appRoot, absoluteBuildPath);
  }

  return absoluteBuildPath;
};

module.exports = getBuildDirectory;
