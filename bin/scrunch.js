#!/usr/bin/env node

'use strict';

var scrunch, npmPackage, program;

scrunch    = require('../index');
npmPackage = require('../package.json');
program    = require('commander');

program
  .version(npmPackage.version)
  .option('-v, --verbose', 'Detailed logs')
  .option('-i, --in [file]', 'Input file')
  .option('-o, --out [file]', 'Write to file')
  .parse(process.argv);

if (! program.in) {
  return console.log('Must specify input and output files');
}

scrunch({
  input: program.in,
  output: program.out,
  log: program.verbose
}).then(function (output) {
  if (! program.out) {
    console.log(output);
  }
}).done();
