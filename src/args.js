const defaultConfig = require('./defaultConfig');

var argv = require('yargs/yargs')(process.argv.slice(2))
  .option('directory', {
    alias: 'd',
    description: 'Provide a path to your build directory.',
    default: defaultConfig.directory,
    type: 'string',
  })
  .option('config', {
    alias: 'c',
    description: 'Provide a path to your config file.',
    default: 'compress-cra.json',
    type: 'string',
  })
  .help()
  .alias('help', 'h').argv;

module.exports = argv;
