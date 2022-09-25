#!/usr/bin/env node

const config = require('./getConfig');
const getBuildDirectory = require('./getBuildDirectory');
const getFiles = require('./getFiles');
const printResult = require('./printResult');
const startCompressingAll = require('./compress').startCompressingAll;
const deleteUncompressedFiles = require('./deleteUncompressedFiles');

const compress = async () => {
  const algorithms = config.algorithms;
  const buildDir = getBuildDirectory();
  const filesToCompress = getFiles(buildDir, config.filetypes);

  console.log(`[compress-create-react-app]:
Compressing build files...
    `);

  algorithms.forEach(async (algorithm) => {
    await startCompressingAll(filesToCompress, algorithm);
    printResult(buildDir, algorithm, filesToCompress);
  });

  if (!config.retainUncompressedFiles) {
    deleteUncompressedFiles(filesToCompress);
  }
};

module.exports = compress;
