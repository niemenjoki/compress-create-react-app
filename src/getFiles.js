const fs = require('fs');
const path = require('path');

const _getFiles = (dirPath, arrayOfFiles, filetypes) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.forEach((entry) => {
    const filePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      arrayOfFiles = _getFiles(filePath, arrayOfFiles, filetypes);
    } else if (entry.isFile()) {
      if (filetypes.includes(path.extname(filePath))) {
        arrayOfFiles.push(filePath);
      }
    }
  });
  return arrayOfFiles;
};

const getFiles = (dirPath, filetypes) => {
  return _getFiles(dirPath, [], filetypes);
};

module.exports = getFiles;
