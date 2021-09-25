#!/usr/bin/env node

const {
  getFiles,
  getCombinedSize,
  formatSizeUnits,
  startCompressingFile,
  getBuildDirectory,
} = require('./utils');

(async () => {
  const algorithms = ['br', 'gz'];
  const buildDir = getBuildDirectory();
  const filesToCompress = getFiles(buildDir);
  const initialBuildSize = getCombinedSize(filesToCompress);

  console.log(`[compress-create-react-app]:
Compressing build files...
    `);

  algorithms.forEach(async (algorithm) => {
    const compressionPromises = filesToCompress.map((file) =>
      startCompressingFile(file, algorithm)
    );
    await Promise.all(compressionPromises);
    const compressedBuild = getFiles(buildDir, [], ['.' + algorithm]);
    const compressedBuildSize = getCombinedSize(compressedBuild);
    const reduction = initialBuildSize - compressedBuildSize;
    const reductionPercentage = Math.round(
      (compressedBuildSize / initialBuildSize) * 100
    );
    console.log(
      '\x1b[32m%s\x1b[0m',
      `Build compressed with ${algorithm}
The build size was reduced to ${reductionPercentage}% of its initial size.
${formatSizeUnits(compressedBuildSize)} instead of ${formatSizeUnits(
        initialBuildSize
      )}
`
    );
  });
})();
