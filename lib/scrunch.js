
/**
 * Coffee Scrunch
 */

(function () {
    "use strict";

    var Event, path, shim, utils, npm, coffee, watch,
        Scrunch, compile, REGEX_DEPENDENCY, REGEX_FILENAME;


    Event  = require('events').EventEmitter;
    path   = require('path');
    coffee = require('coffee-script');
    utils  = require('./utils');
    shim   = require('./shim');
    npm    = require('./npm');
    watch  = require('./watch');

    /**
     * Constants
     */

    REGEX_DEPENDENCY = /\brequire\s*\(?\s*['"][\.\/\w\-]*['"]\s*\)?\s*;?$/mg;
    REGEX_FILENAME   = /['"]([\.\/\w\-]*)['"]/;

    /**
     * Compile
     */

    compile = function (contents) {
        return coffee.compile(contents);
    };

    /**
     * Scrunch class
     */

    Scrunch = (function () {

        var Scrunch = function (options) {
            options = this.options = options || {};

            this.compile = this.compile.bind(this);
            this.load    = this.load.bind(this);
            this.run     = this.run.bind(this);

            this.vent    = new Event();
            if (!options.path) { throw new Error("Must specify start file"); }
            this.verbose   = options.verbose || false;
            this.startFile = utils.getFullPath(options.path);
            this.cache     = {};
            this.output    = "";
        };

        Scrunch.prototype.run = function () {
            this.cache = {};
            this.load([this.startFile]);
            this.vent.emit('run');
            if (this.options.watch) {
                this.watch();
            }
        };

        Scrunch.prototype.watch = function () {
            var path;
            if (this.watchhing) { return; }
            this.watching = true;
            for (path in this.cache) {
                if (this.cache.hasOwnProperty(path)) {
                    watch(path, this.run);
                }
            }
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
            var folder, contents, file, files, i, stats, dependencies, dependency, dependencyPath;

            // Read file
            folder   = utils.getFolder(filepath);
            contents = utils.getContents(filepath);

            // Add file to cache
            file = this.cache[filepath] = {
                path: filepath,
                type: utils.getExtension(filepath).extension,
                contents: contents,
                dependencies: {}
            };

            // Get file dependencies
            dependencies = contents.match(REGEX_DEPENDENCY);

            if (this.verbose) {
                console.log('\n' + filepath);
            }

            if (dependencies === null) {
                return [];
            }

            files = [];

            for (i = 0; i < dependencies.length; i += 1) {

                dependency = dependencies[i].match(REGEX_FILENAME)[1];
                dependency = npm(filepath, dependency);

                if (dependency.found) {

                    if (this.verbose) {

                        if (dependency.type === 'npm') {
                            console.log('  + ' + dependency.name);
                        } else {
                            console.log('  - ' + dependency.name);
                        }
                    }

                    file.dependencies[dependency.name] = dependency.path;
                    files.push(dependency.path);

                } else if (this.verbose) {
                    console.log('  x ' + dependency.name);
                }

            }

            return files;

        };


        /**
         * Scrunch the loaded files into a single file
         */

        Scrunch.prototype.compile = function (options) {
            var i, id, map, contents, dependency, path, file, fullPath, hasJS;

            console.log('compiling...');

            hasJS = false;
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
                    this.output += shim.files.item;

                    // Fix for javascript
                    if (file.type === 'js') {
                        hasJS = true;
                        contents = file.contents.replace(/`/g, '__BACKTICK__');
                        contents = contents.replace(/\\[\r\n]+/g, '');
                        contents = '`' + contents + '`\nreturn';
                        this.output += contents.replace(/^/mg, '      ');
                    } else {
                        this.output += file.contents.replace(/^/mg, '      ');
                    }

                    this.output += shim.files.suffix;
                }
            }

            this.output += shim.app.suffix;

            if (options.compile) {
                this.output = compile(this.output);
                this.output = this.output.replace(/__BACKTICK__/g, '`');
            }

            this.vent.emit('compile', this.output);

            return this.output;
        };

        return Scrunch;

    }());


    module.exports = Scrunch;


}());
