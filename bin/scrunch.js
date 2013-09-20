#!/bin/node

(function () {

    "use strict";

    var Scrunch, lodash, utils, fs,
        options, fileOut, watchFile, compile, folderName;

    Scrunch = require('../lib/scrunch');
    lodash = require('lodash');
    utils = require('../lib/utils');
    fs = require('fs');

    /**
     * Watch a folder
     */

    watchFile = function (path, fn) {
        var callback, listener;
        callback = lodash.debounce(fn, 500);
        listener = fs.watch(path);
        listener.on('change', function (event, filename) {
            callback(filename);
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


    if (process.argv.length < 3) {

        console.log('Usage: scrunch file [--minify] [[--watch] --out file]');

    } else {


        options = {
            fileIn: process.argv[2]
        };

        if (process.argv.indexOf('--minify') > -1) {
            options.minify = true;
        }

        if (process.argv.indexOf('--watch') > -1) {
            options.watch = true;
        }

        fileOut = process.argv.indexOf('--out');
        if (fileOut > -1) {
            options.fileOut = process.argv[fileOut + 1];
            compile(options);
        } else if (options.watch) {
            console.log('[error] You must specify an output file to use --watch');
        } else {
            console.log(compile(options));
        }

        if (options.watch && options.fileOut) {
            folderName = utils.getFolder(options.fileIn);
            console.log('\n[watching]', folderName);
            watchFile(folderName, function (filename) {
                console.log('\n[watching] Recompiling', filename);
                compile(options);
            });
        }

    }

}());
