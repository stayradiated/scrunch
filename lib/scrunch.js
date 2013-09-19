
/*jslint node: true, stupid: true */

/**
 * Coffee Scrunch
 */

(function () {
    "use strict";

    var path, fs, shim, uglify, coffee, loadedFiles,
        getExtension, getContents, getFullPath, getFolder,
        watchFile, Scrunch, minify,
        EXTENSION, REGEX_DEPENDENCY, REGEX_FILENAME;

    path   = require('path');
    uglify = require('uglify-js');
    coffee = require('coffee-script');
    fs     = require('fs');
    shim   = require('./shim');


    /**
     * Utilities
     */

    getExtension = function (path) {
        var extension = path.match(/\.(coffee|json|js)$/);
        return extension ? '' : EXTENSION;
    };

    getContents = function (path) {
        return fs.readFileSync(path, {encoding: 'utf-8'});
    };

    getFullPath = function (path) {
        return fs.realpathSync(path);
    };

    getFolder = function (filename) {
        return path.dirname(filename);
    };

    watchFile = function (path, fn) {
        fs.watchFile(path, {persistant: true}, function (curr, prev) {
            if (curr.mtime !== prev.mtime) {
                fn();
            }
        });
    };

    minify = function (contents) {
        return uglify.minify(coffee.compile(contents), { fromString: true }).code;
    };


    /**
     * Constants
     */

    EXTENSION        = '.coffee';
    REGEX_DEPENDENCY = /\brequire\s*\(?\s*['"][\.\/][\.\/\w]*['"]\s*\)?\s*[$\n]/g;
    REGEX_FILENAME   = /['"]([\.\/\w]*)['"]/;


    /**
     * Scrunch class
     */

    Scrunch = (function () {

        var Scrunch = function (startFile) {
            this.startFile = getFullPath(startFile);
            this.cache = {};
            this.output = "";
            this.load([this.startFile]);
        };


        /**
         * Recursive function to loop through all file requirements
         */

        Scrunch.prototype.load = function (files) {
            var i, dependencies;
            for (i = 0; i < files.length; i += 1) {
                if (this.cache.hasOwnProperty(files[i]) === false) {
                    dependencies = this.parse(files[i]);
                    this.load(dependencies);
                }
            }
        };


        /**
         * Read a file and get it's dependencies
         */

        Scrunch.prototype.parse = function (filepath) {
            var folder, contents, file, files, i, dependencies, dependency, dependencyPath;

            // Read file
            folder   = getFolder(filepath);
            contents = getContents(filepath);

            // Add file to cache
            file = this.cache[filepath] = {
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
                // console.log(dependencyPath);

                file.dependencies[dependency] = dependencyPath;
                files.push(dependencyPath);
            }

            return files;

        };


        /**
         * Scrunch the loaded files into a single file
         */

        Scrunch.prototype.compile = function (options) {
            var i, id, map, dependency, path, file, fullPath;

            options = options || {};

            i = 0;
            map = {};

            // Generate map
            for (path in this.cache) {
                if (this.cache.hasOwnProperty(path)) {
                    map[path] = i;
                    i += 1;
                }
            }

            this.output = shim.app.prefix;

            // Concatenate files
            for (path in this.cache) {
                if (this.cache.hasOwnProperty(path)) {

                    file = this.cache[path];

                    this.output += shim.files.prefix;

                    // List dependencies
                    this.output += shim.index.prefix(path);
                    for (dependency in file.dependencies) {
                        if (file.dependencies.hasOwnProperty(dependency)) {
                            fullPath = file.dependencies[dependency];
                            id = map[fullPath];
                            this.output += shim.index.item(dependency, id);
                        }
                    }
                    this.output += shim.index.suffix;

                    // Insert file content
                    this.output += shim.files.item;
                    this.output += file.contents.replace(/^/mg, '      ');

                    this.output += shim.files.suffix;
                }
            }

            this.output += shim.app.suffix;

            if (options.minify) {
                this.output = minify(this.output);
            }

            return this.output;
        };

        return Scrunch;

    }());


    module.exports = Scrunch;


}());
