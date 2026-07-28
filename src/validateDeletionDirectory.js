const fs = require('fs');
const path = require('path');

const validateDeletionDirectory = (projectRoot, buildDirectory) => {
  if (fs.lstatSync(buildDirectory).isSymbolicLink()) {
    throw new Error(
      'Refusing to delete original files from a symbolic-link build directory.'
    );
  }

  const realProjectRoot = fs.realpathSync(projectRoot);
  const realBuildDirectory = fs.realpathSync(buildDirectory);
  const relativePath = path.relative(realProjectRoot, realBuildDirectory);
  const isOutsideProject =
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath);

  if (relativePath === '' || isOutsideProject) {
    throw new Error(
      'Refusing to delete original files unless the build directory is inside the project root.'
    );
  }
};

module.exports = validateDeletionDirectory;
