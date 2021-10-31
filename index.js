#!/usr/bin/env node
const args = require('./src/args');
if (args._.includes('help') || args._.includes('version')) {
  return;
}

const compress = require('./src');
compress();
