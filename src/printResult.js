const getCombinedSize = require('./getCombinedSize');
const formatSizeUnits = require('./formatSizeUnits');
const getFiles = require('./getFiles');

const printResult = (buildDir, algorithm, filesToCompress) => {
  const initialBuildSize = getCombinedSize(filesToCompress);
  const compressedBuild = getFiles(buildDir, ['.' + algorithm]);
  const compressedBuildSize = getCombinedSize(compressedBuild);
  const reduction = initialBuildSize - compressedBuildSize;
  const reductionPercentage = Math.round(
    (compressedBuildSize / initialBuildSize) * 100
  );

  const formattedBuildSize = formatSizeUnits(compressedBuildSize);
  const formattedInitialBuildSize = formatSizeUnits(initialBuildSize);
  const formattedReductionSize = formatSizeUnits(reduction);

  console.log(
    '\x1b[32m%s\x1b[0m',
    `Build compressed with ${algorithm}
      The build size was reduced to ${reductionPercentage}% of its initial size, ${formattedReductionSize} was removed.
      ${formattedBuildSize} instead of ${formattedInitialBuildSize}
      `
  );
};

module.exports = printResult;
