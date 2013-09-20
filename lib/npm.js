/*jslint stupid: true*/

/**
 *
 * Try and resolve an NPM dependency
 *
 * Usage:
 *
 * === LOADING ===
 *
 * var npm = require('./npm');
 *
 * === NPM DEPENDENCY ===
 *
 * npm('/user/admin/project/scrunch.js', 'lodash');
 * #=> /user/admin/project/node_modules/lodash/dist/lodash.js
 *
 * === RELATIVE FILE ===
 *
 * npm('/user/admin/project/scrunch.js', './test.js');
 * #=> /user/admin/project/test.js
 *
 */

(function () {

    "use strict";

    var fs, path, utils, cache,
        checkArray, parsePackage, Walk, resolveFile;

    fs = require('fs');
    path = require('path');
    utils = require('./utils');

    cache = {};

    checkArray = function (array, string) {
        var i;
        for (i = 0; i < array.length; i += 1) {
            if (array[i] === string) {
                return true;
            }
        }
        return false;
    };

    parsePackage = function (folder) {
        var main = require(folder + '/package.json').main;
        if (main[0] !== '.') {
            main = './' + main;
        }
        return main;
    };

    Walk = (function () {

        var Walk = function (path, name) {
            this.startpath = this.path = utils.getFullPath(path);
            this.name = name;
        };

        Walk.prototype.next = function () {
            var folder, files;
            folder = utils.getFolder(this.path);
            this.path = folder;
            files = fs.readdirSync(folder);
            return checkArray(files, 'node_modules');
        };

        Walk.prototype.run = function () {
            var found, files;
            found = false;
            while (!found && this.path !== '/') {
                if (this.next()) {
                    files = fs.readdirSync(this.path + '/node_modules');
                    if (checkArray(files, this.name)) {
                        return this.path + '/node_modules/' + this.name;
                    }
                }
            }
            return false;
        };

        return Walk;

    }());

    resolveFile = function (sourcepath, name, isFolder) {
        var walk, folder, options;

        options = {
            source: sourcepath,
            name: name
        };

        if (name.length === 0) {
            console.log('[error] empty name');
            return name;
        }

        if (name[0] === '.') {

            // Try and find file
            if (!isFolder) {
                folder = utils.getFolder(sourcepath);
            } else {
                folder = sourcepath;
            }
            options.path = path.join(folder, name);
            options.path = utils.getExtension(options.path).fullpath;
            options.found = true;
            options.type = 'path';

        } else {

            // Check for NPM dependencies
            walk = new Walk(sourcepath, name);
            folder = walk.run();
            options.type = 'npm';
            if (folder) {
                options.path = parsePackage(folder);
                options.path = resolveFile(folder, options.path, true).path;
                options.found = true;
            } else {
                options.found = false;
                options.path  = name;
            }

        }

        return options;

    };

    module.exports = resolveFile;

}());
