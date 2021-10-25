const zlib = require('zlib');
const fs = require('fs');
const util = require('util');

const compressors = {
  br: {
    func: util.promisify(zlib.brotliCompress),
    options: {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]:
          zlib.constants.BROTLI_MAX_QUALITY,
      },
    },
  },
  gz: {
    func: util.promisify(zlib.gzip),
    options: {
      level: zlib.constants.Z_BEST_COMPRESSION,
    },
  },
};

const startCompressingFile = (file, algorithm) => {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = await readFile(file);
      const { func, options } = compressors[algorithm];
      const compressedBuffer = await func(buffer, options);
      await writeFile(file + '.' + algorithm, compressedBuffer);
      return resolve();
    } catch (err) {
      reject(err);
    }
  });
};

const startCompressingAll = async (filesToCompress, algorithm) => {
  const compressionPromises = filesToCompress.map((file) =>
    startCompressingFile(file, algorithm)
  );

  await Promise.all(compressionPromises);
};

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const supportedAlgorithms = Object.keys(compressors);

module.exports = {
  startCompressingAll,
  supportedAlgorithms,
};
