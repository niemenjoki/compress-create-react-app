const path = require('path');
const fs = require('fs');

const deleteUncompressedFiles = (filepaths) => {
  filepaths.forEach((filePath) => {
    const absoluteFilePath = path.join(filePath);
    fs.unlinkSync(absoluteFilePath);
  });
};

module.exports = deleteUncompressedFiles;
