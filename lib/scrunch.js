
/*jslint node: true, stupid: true */

/**
 * Coffee Scrunch
 */

(function () {
    "use strict";

    var path, fs, shim, loadedFiles,
        getContents, getName, getFolder,
        EXTENSION, REGEX_DEPENDENCY, REGEX_FILENAME,
        readFile, loadFiles, joinFiles,
        fileIn, fileOut;

    path = require('path');
    fs   = require('fs');
    shim = require('./shim');

    loadedFiles = {};

    /**
     * Utilities
     */

    var getExtension = function(path) {
        var extension = path.match(/\.(coffee|json|js)$/);
        return extension ? '' : EXTENSION;
    };

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
        var folder, contents, file, files, i, dependencies, dependency, dependencyPath;

        // Read file
        folder = getFolder(filepath);
        contents = getContents(filepath);

        // Add file to loadedFiles
        file = loadedFiles[filepath] = {
            contents: contents,
            dependencies: {}
        };

        // Get file dependencies
        dependencies = contents.match(REGEX_DEPENDENCY);
        if (dependencies === null) {
            return [];
        }

        files = [];

        for (i = 0; i < dependencies.length; i += 1) {
            dependency = dependencies[i].match(REGEX_FILENAME)[1];

            dependencyPath = path.join(folder, dependency + getExtension(dependency));
            console.log(dependencyPath);

            file.dependencies[dependency] = dependencyPath;
            files.push(dependencyPath);
        }

        return files;

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
        var i, id, map, dependency, rel, abs, path, file, output, fullPath;

        i = 0;
        map = {};

        // Generate map
        for (path in loadedFiles) {
            if (loadedFiles.hasOwnProperty(path)) {
                map[path] = i;
                i += 1;
            }
        }

        output = shim.app.prefix;

        for (path in loadedFiles) {
            if (loadedFiles.hasOwnProperty(path)) {

                file = loadedFiles[path];

                output += shim.files.prefix;

                output += shim.index.prefix(path);
                for (dependency in file.dependencies) {
                    if (file.dependencies.hasOwnProperty(dependency)) {
                        fullPath = file.dependencies[dependency];
                        id = map[fullPath];
                        output += shim.index.item(dependency, id);
                    }
                }
                output += shim.index.suffix;

                output += shim.files.item;
                output += file.contents.replace(/(^|\n)/g, '\n      ');

                output += shim.files.suffix;
            }
        }

        output += shim.app.suffix;

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

        if (fileOut > -1) {
            fileOut = process.argv[fileOut + 1];
            module.exports(fileIn, fileOut);
        } else {
            console.log(module.exports(fileIn));
        }
    }

}());
