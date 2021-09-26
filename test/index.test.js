const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const path = require('path');
const appRoot = require('app-root-path').path;
const execPromisified = util.promisify(exec);

const runCommand = async (command) => {
  let result;
  try {
    result = await execPromisified(command);
  } catch (ex) {
    result = ex;
  }
  if (Error[Symbol.hasInstance](result)) return;
  return result;
};

const compressedFiles = [
  '/test/testBuild/js/mock.js.br',
  '/test/testBuild/js/mock.js.gz',
  '/test/testBuild/css/mock.css.br',
  '/test/testBuild/css/mock.css.gz',
  '/test/testBuild/html/mock.html.br',
  '/test/testBuild/html/mock.html.gz',
];

const compressedFilesExist = () => {
  let allExist = true;
  compressedFiles.forEach((filePath) => {
    const absoluteFilePath = path.join(appRoot, filePath);
    if (!fs.existsSync(absoluteFilePath)) {
      allExist = false;
    }
  });
  return allExist;
};

const deleteCompressedFiles = () => {
  compressedFiles.forEach((filePath) => {
    const absoluteFilePath = path.join(appRoot, filePath);
    fs.unlinkSync(absoluteFilePath);
  });
};

describe('compress-cra package', () => {
  it('should create compressed files with --directory parameter', async () => {
    const { stdout, stderr } = await runCommand(
      'node index.js --directory /test/testBuild'
    );
    expect(stderr).toBeFalsy();
    expect(compressedFilesExist()).toBe(true);
    deleteCompressedFiles();
  });

  it('should create compressed files with -d parameter', async () => {
    const { stdout, stderr } = await runCommand(
      'node index.js -d /test/testBuild'
    );
    expect(stderr).toBeFalsy();
    expect(compressedFilesExist()).toBe(true);
    deleteCompressedFiles();
  });

  it('should throw an error if build path is incorrect', async () => {
    const { stdout, stderr } = await runCommand('node index.js');
    expect(stderr).not.toBeFalsy();
  });
});
