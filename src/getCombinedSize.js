const fs = require('fs');

const getCombinedSize = (arrayOfFiles) => {
  let totalSize = 0;
  arrayOfFiles.forEach((filePath) => {
    totalSize += fs.statSync(filePath).size;
  });
  return totalSize;
};

module.exports = getCombinedSize;
