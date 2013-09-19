#!/bin/node

var Scrunch = require('../lib/scrunch');
var fs = require('fs');


/**
 * Init function
 */

compile = function (options) {
    var scrunch = new Scrunch(options.fileIn);
    scrunch.compile(options);
    if (options.fileOut) {
      fs.writeFile(options.fileOut, scrunch.output, options.fn);
    }
    return scrunch.output;
};

fileIn  = process.argv.indexOf('--in');
fileOut = process.argv.indexOf('--out');

if (fileIn === -1) {

    console.log('Usage: node index.js --in file [--minify] [--out file]');

} else {

    var options = {
        fileIn: process.argv[fileIn + 1]
    };

    if (process.argv.indexOf('--minify') > -1) {
        options.minify = true;
    }

    if (fileOut > -1) {
        options.fileOut = process.argv[fileOut + 1];
        compile(options);
    } else {
        console.log(compile(options));
    }


}
