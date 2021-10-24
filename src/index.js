#!/usr/bin/env node

const { getCombinedSize, startCompressingFile } = require('./utils');

const getBuildDirectory = require('./getBuildDirectory');
const getFiles = require('./getFiles');
const config = require('./getConfig');
const { printResult } = require('./printResult');

const compressAllUsingAlgorithm = async (filesToCompress, algorithm) => {
  const compressionPromises = filesToCompress.map((file) =>
    startCompressingFile(file, algorithm)
  );

  await Promise.all(compressionPromises);
};

const compress = async () => {
  const algorithms = config.algorithms;
  const buildDir = getBuildDirectory();
  const filesToCompress = getFiles(buildDir, config.filetypes);
  const initialBuildSize = getCombinedSize(filesToCompress);

  console.log(`[compress-create-react-app]:
Compressing build files...
    `);

  algorithms.forEach(async (algorithm) => {
    await compressAllUsingAlgorithm(filesToCompress, algorithm);
    printResult(buildDir, algorithm, initialBuildSize);
  });
};

module.exports = compress;
