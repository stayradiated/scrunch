#!/bin/node

var Scrunch = require('../lib/scrunch');
var lodash = require('lodash');
var utils = require('../lib/utils');
var fs = require('fs');

/**
 * Watch a folder
 */

watchFile = function (path, fn) {
    var callback, listener;
    callback = lodash.debounce(fn, 500);
    listener = fs.watch(path);
    listener.on('change', function (event) {
        callback();
    });
};

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

    fileIn = process.argv[fileIn + 1];

    var options = {
        fileIn: fileIn
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

    console.log('watching for', utils.getFolder(fileIn));
    watchFile(utils.getFolder(fileIn), function() {
        console.log('Recompiling file');
        console.log(compile(options));
    });

}

