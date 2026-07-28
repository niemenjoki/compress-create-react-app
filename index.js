#!/usr/bin/env node

const run = async () => {
  const args = require('./src/args');
  if (args._.includes('help') || args._.includes('version')) {
    return;
  }

  const compress = require('./src');
  await compress();
};

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[compress-create-react-app]: ${message}`);
  process.exitCode = 1;
});
