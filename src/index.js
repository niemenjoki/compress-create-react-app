#!/usr/bin/env node

const config = require('./getConfig');
const getBuildDirectory = require('./getBuildDirectory');
const getFiles = require('./getFiles');
const printResult = require('./printResult');
const startCompressingAll = require('./compress').startCompressingAll;
const compressAllSync = require('./compress').compressAllSync;
const deleteUncompressedFiles = require('./deleteUncompressedFiles');

const compress = async () => {
  const algorithms = config.algorithms;
  const buildDir = getBuildDirectory();
  const filesToCompress = getFiles(buildDir, config.filetypes);
  const logMessage = config.asynchronousCompression
    ? 'Compressing build files...'
    : 'Compressing build files synchronously (reduced memory usage)...';
  console.log(`[compress-create-react-app]:
  ${logMessage}
    `);

  if (config.asynchronousCompression) {
    await Promise.all(
      algorithms.map(async (algorithm) => {
        await startCompressingAll(filesToCompress, algorithm);
        printResult(buildDir, algorithm, filesToCompress);
      })
    );
  } else {
    for (const algorithm of algorithms) {
      compressAllSync(filesToCompress, algorithm);
      printResult(buildDir, algorithm, filesToCompress);
    }
  }

  if (!config.retainUncompressedFiles) {
    deleteUncompressedFiles(filesToCompress);
  }
};

module.exports = compress;
