const fs = require('fs');
const path = require('path');

const _getFiles = (dirPath, arrayOfFiles, filetypes) => {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = _getFiles(dirPath + '/' + file, arrayOfFiles, filetypes);
    } else {
      const filePath = path.join(dirPath, '/', file);
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
