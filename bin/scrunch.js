#!/usr/bin/env node

'use strict';

var scrunch, npmPackage, program;

scrunch    = require('../index');
npmPackage = require('../package.json');
program    = require('commander');

program
  .version(npmPackage.version)
  .option('-v, --verbose', 'Detailed logs');

program
  .command('*')
  .description('scrunch [in] [out]')
  .action(function (fileIn, fileOut) {
    scrunch({
      input: fileIn,
      output: typeof(fileOut) === 'string' ? fileOut : undefined,
      log: program.verbose
    }).then(function (output) {
      if (output) console.log(output);
    }).done();
  });

program.parse(process.argv);

if (! program.args.length) {
  program.help();
}

