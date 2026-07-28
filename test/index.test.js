const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { gunzipSync, brotliDecompressSync } = require('zlib');
const { afterEach, test } = require('node:test');

const appRoot = path.join(__dirname, '..');
const cliPath = path.join(appRoot, 'index.js');
const temporaryDirectories = new Set();

const createFixture = () => {
  const fixtureRoot = fs.mkdtempSync(path.join(__dirname, '.tmp-'));
  const buildDirectory = path.join(fixtureRoot, 'build');
  const sourceFiles = {
    javascript: path.join(buildDirectory, 'js', 'mock.js'),
    stylesheet: path.join(buildDirectory, 'css', 'mock.css'),
    document: path.join(buildDirectory, 'html', 'mock.html'),
    nested: path.join(buildDirectory, 'nested', 'more.js'),
    ignored: path.join(buildDirectory, 'asset.txt'),
  };

  temporaryDirectories.add(fixtureRoot);
  Object.values(sourceFiles).forEach((filePath) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  });

  fs.writeFileSync(sourceFiles.javascript, 'console.log("test");\n');
  fs.writeFileSync(sourceFiles.stylesheet, 'body { color: black; }\n');
  fs.writeFileSync(
    sourceFiles.document,
    '<!doctype html><title>Test</title>\n'
  );
  fs.writeFileSync(sourceFiles.nested, 'export const nested = true;\n');
  fs.writeFileSync(sourceFiles.ignored, 'not compressed\n');

  return { fixtureRoot, buildDirectory, sourceFiles };
};

const relativeToAppRoot = (filePath) => path.relative(appRoot, filePath);

const writeConfig = (fixtureRoot, config) => {
  const configPath = path.join(fixtureRoot, 'compress-cra.json');
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  return configPath;
};

const runCli = (args = []) => {
  const outputDirectory = fs.mkdtempSync(path.join(__dirname, '.tmp-output-'));
  const stdoutPath = path.join(outputDirectory, 'stdout');
  const stderrPath = path.join(outputDirectory, 'stderr');
  const stdoutFile = fs.openSync(stdoutPath, 'w');
  const stderrFile = fs.openSync(stderrPath, 'w');
  const environment = { ...process.env };
  delete environment.NODE_TEST_CONTEXT;
  temporaryDirectories.add(outputDirectory);

  let result;
  try {
    result = spawnSync(process.execPath, [cliPath, ...args], {
      cwd: appRoot,
      env: environment,
      stdio: ['ignore', stdoutFile, stderrFile],
    });
  } finally {
    fs.closeSync(stdoutFile);
    fs.closeSync(stderrFile);
  }

  return {
    ...result,
    stdout: fs.readFileSync(stdoutPath, 'utf8'),
    stderr: fs.readFileSync(stderrPath, 'utf8'),
  };
};

const assertCompressedWithBothAlgorithms = (filePath) => {
  const original = fs.readFileSync(filePath);
  const brotli = fs.readFileSync(`${filePath}.br`);
  const gzip = fs.readFileSync(`${filePath}.gz`);

  assert.deepEqual(brotliDecompressSync(brotli), original);
  assert.deepEqual(gunzipSync(gzip), original);
};

afterEach(() => {
  temporaryDirectories.forEach((directory) => {
    fs.rmSync(directory, { recursive: true, force: true });
  });
  temporaryDirectories.clear();
});

test('compresses supported files recursively and retains originals by default', () => {
  const { buildDirectory, sourceFiles } = createFixture();
  const result = runCli(['--directory', relativeToAppRoot(buildDirectory)]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  [
    sourceFiles.javascript,
    sourceFiles.stylesheet,
    sourceFiles.document,
    sourceFiles.nested,
  ].forEach((filePath) => {
    assert.equal(fs.existsSync(filePath), true);
    assertCompressedWithBothAlgorithms(filePath);
  });
  assert.equal(fs.existsSync(`${sourceFiles.ignored}.br`), false);
  assert.equal(fs.existsSync(`${sourceFiles.ignored}.gz`), false);
});

test('supports synchronous compression and deletes originals only after success', () => {
  const { fixtureRoot, buildDirectory, sourceFiles } = createFixture();
  const configPath = writeConfig(fixtureRoot, {
    filetypes: ['.js', '.html', '.css'],
    directory: relativeToAppRoot(buildDirectory),
    algorithms: ['br', 'gz'],
    retainUncompressedFiles: false,
    asynchronousCompression: false,
  });
  const originalContents = new Map(
    Object.values(sourceFiles)
      .filter((filePath) => path.extname(filePath) !== '.txt')
      .map((filePath) => [filePath, fs.readFileSync(filePath)])
  );

  const result = runCli(['--config', relativeToAppRoot(configPath)]);

  assert.equal(result.status, 0, result.stderr);
  originalContents.forEach((contents, filePath) => {
    assert.equal(fs.existsSync(filePath), false);
    assert.deepEqual(
      brotliDecompressSync(fs.readFileSync(`${filePath}.br`)),
      contents
    );
    assert.deepEqual(gunzipSync(fs.readFileSync(`${filePath}.gz`)), contents);
  });
  assert.equal(fs.existsSync(sourceFiles.ignored), true);
});

test('supports asynchronous compression before deleting originals', () => {
  const { fixtureRoot, buildDirectory, sourceFiles } = createFixture();
  const configPath = writeConfig(fixtureRoot, {
    directory: relativeToAppRoot(buildDirectory),
    retainUncompressedFiles: false,
  });

  const result = runCli(['-c', relativeToAppRoot(configPath)]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(sourceFiles.javascript), false);
  assert.equal(fs.existsSync(`${sourceFiles.javascript}.br`), true);
  assert.equal(fs.existsSync(`${sourceFiles.javascript}.gz`), true);
});

test('reports a missing build directory on stderr and exits non-zero', () => {
  const { fixtureRoot } = createFixture();
  const missingDirectory = path.join(fixtureRoot, 'missing');
  const result = runCli(['-d', relativeToAppRoot(missingDirectory)]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /No directory found/);
  assert.doesNotMatch(result.stderr, /TypeError/);
});

test('rejects a build path that is not a directory', () => {
  const { sourceFiles } = createFixture();
  const result = runCli(['-d', relativeToAppRoot(sourceFiles.javascript)]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /not a directory/);
});

test('rejects invalid configuration without modifying originals', async (t) => {
  const invalidConfigs = [
    {
      name: 'unknown option',
      config: { unexpected: true },
      message: /does not exist/,
    },
    {
      name: 'unsupported algorithm',
      config: { algorithms: ['zip'] },
      message: /not supported/,
    },
    {
      name: 'empty algorithms',
      config: { algorithms: [], retainUncompressedFiles: false },
      message: /non-empty array/,
    },
    {
      name: 'duplicate algorithms',
      config: { algorithms: ['gz', 'gz'] },
      message: /must not contain duplicates/,
    },
    {
      name: 'invalid filetypes',
      config: { filetypes: '.js' },
      message: /array of file extensions/,
    },
    {
      name: 'invalid deletion flag',
      config: { retainUncompressedFiles: 0 },
      message: /must be a boolean/,
    },
  ];

  for (const { name, config, message } of invalidConfigs) {
    await t.test(name, () => {
      const { fixtureRoot, sourceFiles } = createFixture();
      const configPath = writeConfig(fixtureRoot, config);
      const result = runCli(['-c', relativeToAppRoot(configPath)]);

      assert.equal(result.status, 1);
      assert.match(result.stderr, message);
      assert.equal(fs.existsSync(sourceFiles.javascript), true);
      assert.equal(fs.existsSync(`${sourceFiles.javascript}.br`), false);
      assert.equal(fs.existsSync(`${sourceFiles.javascript}.gz`), false);
    });
  }
});

test('refuses to delete originals from the project root', () => {
  const { fixtureRoot } = createFixture();
  const configPath = writeConfig(fixtureRoot, {
    filetypes: [],
    directory: '.',
    algorithms: ['gz'],
    retainUncompressedFiles: false,
  });
  const result = runCli(['-c', relativeToAppRoot(configPath)]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /inside the project root/);
});

test('refuses to delete originals outside the project root', () => {
  const outsideDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'compress-cra-outside-')
  );
  const outsideFile = path.join(outsideDirectory, 'keep.js');
  temporaryDirectories.add(outsideDirectory);
  fs.writeFileSync(outsideFile, 'keep me\n');

  const { fixtureRoot } = createFixture();
  const configPath = writeConfig(fixtureRoot, {
    directory: relativeToAppRoot(outsideDirectory),
    retainUncompressedFiles: false,
  });
  const result = runCli(['-c', relativeToAppRoot(configPath)]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /inside the project root/);
  assert.equal(fs.existsSync(outsideFile), true);
});

test('refuses a symbolic-link build directory when deleting originals', (t) => {
  const { fixtureRoot, buildDirectory, sourceFiles } = createFixture();
  const linkedBuildDirectory = path.join(fixtureRoot, 'linked-build');
  try {
    fs.symlinkSync(buildDirectory, linkedBuildDirectory, 'dir');
  } catch (error) {
    if (error.code === 'EPERM') {
      t.skip('Directory symlinks are unavailable on this platform.');
      return;
    }
    throw error;
  }

  const configPath = writeConfig(fixtureRoot, {
    directory: relativeToAppRoot(linkedBuildDirectory),
    retainUncompressedFiles: false,
  });
  const result = runCli(['-c', relativeToAppRoot(configPath)]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /symbolic-link build directory/);
  assert.equal(fs.existsSync(sourceFiles.javascript), true);
});

test('does not traverse nested symbolic-link directories', (t) => {
  const { fixtureRoot, buildDirectory, sourceFiles } = createFixture();
  const outsideDirectory = path.join(fixtureRoot, 'outside');
  const outsideFile = path.join(outsideDirectory, 'outside.js');
  const linkedDirectory = path.join(buildDirectory, 'linked');
  fs.mkdirSync(outsideDirectory);
  fs.writeFileSync(outsideFile, 'keep me\n');
  try {
    fs.symlinkSync(outsideDirectory, linkedDirectory, 'dir');
  } catch (error) {
    if (error.code === 'EPERM') {
      t.skip('Directory symlinks are unavailable on this platform.');
      return;
    }
    throw error;
  }

  const configPath = writeConfig(fixtureRoot, {
    directory: relativeToAppRoot(buildDirectory),
    retainUncompressedFiles: false,
  });
  const result = runCli(['-c', relativeToAppRoot(configPath)]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(sourceFiles.javascript), false);
  assert.equal(fs.existsSync(outsideFile), true);
  assert.equal(fs.existsSync(`${outsideFile}.br`), false);
  assert.equal(fs.existsSync(`${outsideFile}.gz`), false);
});

test('deletion preflight preserves originals when output is missing', () => {
  const deleteUncompressedFiles = require('../src/deleteUncompressedFiles');
  const { sourceFiles } = createFixture();

  assert.throws(
    () => deleteUncompressedFiles([sourceFiles.javascript], ['br', 'gz']),
    /Refusing to delete original files/
  );
  assert.equal(fs.existsSync(sourceFiles.javascript), true);
});
