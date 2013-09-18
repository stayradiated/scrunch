
/*jslint node: true, stupid: true */

/**
 * Coffee Scrunch
 */

(function () {
    "use strict";

    var path, fs, shim, loadedFiles, fileIndex,
        getContents, getName, getFolder,
        EXTENSION, REGEX_DEPENDENCY, REGEX_FILENAME,
        readFile, loadFiles, joinFiles,
        fileIn, fileOut;

    path = require('path');
    fs   = require('fs');
    shim = require('./shim');

    loadedFiles = {};
    fileIndex = {};


    /**
     * Utilities
     */

    getContents = function (path) {
        return fs.readFileSync(path, {encoding: 'utf-8'});
    };

    getName = function (path) {
        return fs.realpathSync(path);
    };

    getFolder = function (filename) {
        return path.dirname(filename);
    };


    /**
     * Constants
     */

    EXTENSION        = '.coffee';
    REGEX_DEPENDENCY = /\brequire\s*\(?\s*['"][\.\/][\.\/\w]*['"]\s*\)?\s*[$\n]/g;
    REGEX_FILENAME   = /['"]([\.\/\w]*)['"]/;


    /**
     * Read a file and get it's dependencies
     */

    readFile = function (filepath) {
        var folder, contents, file, i, dependencies, dependency, path;

        // Read file
        folder = getFolder(filepath);
        contents = getContents(filepath);

        // Add file to loadedFiles
        file = loadedFiles[filepath] = {
            contents: contents,
            dependencies: []
        };

        // Get file dependencies
        dependencies = contents.match(REGEX_DEPENDENCY);
        if (dependencies === null) {
            return [];
        }

        for (i = 0; i < dependencies.length; i += 1) {
            dependency = dependencies[i].match(REGEX_FILENAME)[1];

            // Change ./test to /full/path/to/test.coffee
            path = folder + dependency.replace(/^\.\//, '/') + EXTENSION;

            // Add path to fileIndex and file
            fileIndex[dependency] = path;
            file.dependencies.push(path);
        }

        return file.dependencies;

    };


    /**
     * Recursive function to loop through all file requirements
     */

    loadFiles = function (files) {
        var i, file, requires;
        for (i = 0; i < files.length; i += 1) {
            file = files[i];
            if (loadedFiles.hasOwnProperty(file) === false) {
                requires = readFile(file);
                loadFiles(requires);
            }
        }
    };


    /**
     * Scrunch the loaded files into a single file
     */

    joinFiles = function (init) {
        var rel, abs, path, file, output;
        output = shim.app.prefix;

        /* create index */
        output += shim.index.prefix;
        for (rel in fileIndex) {
            if (fileIndex.hasOwnProperty(rel)) {
                abs = fileIndex[rel];
                output += shim.index.join(rel, abs);
            }
        }
        output += shim.index.suffix;

        /* create files */
        output += shim.files.prefix;
        for (path in loadedFiles) {
            if (loadedFiles.hasOwnProperty(path)) {
                file = loadedFiles[path];
                output += shim.files.join(path);
                output += file.contents.replace(/(^|\n)/g, '\n    ');
            }
        }
        output += shim.files.suffix;

        output += shim.app.suffix.replace('$(path)', init);

        return output;
    };


    /**
     * Init function
     */

    module.exports = function (fileIn, fileOut, fn) {
        var contents;
        fileIn = getName(fileIn);
        loadFiles([fileIn]);
        contents = joinFiles(fileIn);
        if (fileOut) {
          fs.writeFile(fileOut, contents, fn);
        }
        return contents;
    };

    if (module.parent === null) {

        fileIn  = process.argv.indexOf('--in');
        fileOut = process.argv.indexOf('--out');

        if (fileIn === -1) {
            return console.log('Usage: node index.js --in file --out file');
        }

        fileIn  = process.argv[fileIn + 1];
        fileOut = process.argv[fileOut + 1];

        module.exports(fileIn, fileOut);
    }

}());
