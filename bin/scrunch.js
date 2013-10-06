#!/usr/bin/env node

(function () {

    "use strict";

    var Scrunch, lodash, utils, fs, npmPackage,
        options, fileOut, compile, folderName;

    Scrunch    = require('../lib/scrunch');
    lodash     = require('lodash');
    utils      = require('../lib/utils');
    fs         = require('fs');
    npmPackage = require('../package.json');

    /**
     * Init function
     */

    compile = function (options) {
        var scrunch = new Scrunch(options);

        scrunch.vent.on('init', function () {
            scrunch.scrunch(options);
        });

        scrunch.vent.on('scrunch', function (output) {
            console.log('...scrunched');
            if (options.fileOut) {
                console.log('Saving to ' + options.fileOut);
                fs.writeFile(options.fileOut, output, options.fn);
            }
        });

        scrunch.init();

        return scrunch.output;

    };


    if (process.argv.length < 3) {

        console.log('Usage: scrunch FILE [OPTION]\n' +
'\n' +
'Options:\n' +
'   -v --vebose\n' +
'   -c --compile\n' +
'   -w --watch\n' +
'   -o [file]\n' +
'\n' +
'Version: ' + npmPackage.version);

    } else {

        options = {
            path: process.argv[2]
        };

        if (utils.containsAny(process.argv, '-l', '--log')) {
            options.verbose = true;
        }

        if (utils.containsAny(process.argv, '-c', '--compile')) {
            options.compile = true;
        }

        if (utils.containsAny(process.argv, '-w', '--watch')) {
            options.watch = true;
        }

        fileOut = process.argv.indexOf('-o');
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
