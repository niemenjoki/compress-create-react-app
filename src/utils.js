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


const formatSizeUnits = (bytes) => {
  if (bytes >= 1073741824) {
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }
  if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(2) + ' MB';
  }
  if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  }
  if (bytes > 1) {
    return bytes + ' bytes';
  }
  if (bytes == 1) {
    return bytes + ' byte';
  }
  return '0 bytes';
};

const getCombinedSize = (arrayOfFiles) => {
  let totalSize = 0;
  arrayOfFiles.forEach((filePath) => {
    totalSize += fs.statSync(filePath).size;
  });
  return totalSize;
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

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

module.exports = {
  compressors,
  getCombinedSize,
  formatSizeUnits,
  readFile,
  writeFile,
  startCompressingFile,
};
