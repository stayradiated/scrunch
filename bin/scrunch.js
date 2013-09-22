#!/usr/bin/env node

(function () {

    "use strict";

    var Scrunch, lodash, utils, fs,
        options, fileOut, compile, folderName;

    Scrunch = require('../lib/scrunch');
    lodash = require('lodash');
    utils = require('../lib/utils');
    fs = require('fs');

    /**
     * Init function
     */

    compile = function (options) {
        var scrunch = new Scrunch(options);

        scrunch.vent.on('run', function () {
            scrunch.compile(options);
        });

        scrunch.vent.on('compile', function (output) {
            console.log('...compiled');
            if (options.fileOut) {
                console.log('writing');
                fs.writeFile(options.fileOut, output, options.fn);
            }
        });

        scrunch.run();

        return scrunch.output;

    };


    if (process.argv.length < 3) {

        console.log('Usage: scrunch file [--log] [--compile] [[--watch] --out file]');

    } else {

        options = {
            path: process.argv[2]
        };

        if (process.argv.indexOf('--log') > -1) {
            options.verbose = true;
        }

        if (process.argv.indexOf('--compile') > -1) {
            options.compile = true;
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
            console.log('\n' + compile(options));
        }

    }

}());
