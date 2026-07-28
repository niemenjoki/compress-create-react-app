const fs = require('fs');

const deleteUncompressedFiles = (filepaths, algorithms) => {
  filepaths.forEach((filePath) => {
    algorithms.forEach((algorithm) => {
      const compressedFilePath = `${filePath}.${algorithm}`;
      if (
        !fs.existsSync(compressedFilePath) ||
        !fs.statSync(compressedFilePath).isFile()
      ) {
        throw new Error(
          `Refusing to delete original files because '${compressedFilePath}' is missing.`
        );
      }
    });
  });

  filepaths.forEach((filePath) => {
    fs.unlinkSync(filePath);
  });
};

module.exports = deleteUncompressedFiles;
