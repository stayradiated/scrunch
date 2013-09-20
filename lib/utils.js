/*jslint stupid: true*/

(function () {

    "use strict";

    var fs, path, EXTENSIONS;

    fs   = require('fs');
    path = require('path');

    // Valid extensions
    EXTENSIONS = ['coffee', 'js', 'json'];

    /**
     * Utilities
     */

    module.exports = {

        // Tries to find out the correct extension of a file,
        // as require() allows you to not specify it
        getExtension: function (filepath) {
            var extension, i, exists;
            extension = filepath.match(/\.(coffee|js|json)$/);
            if (extension !== null) {
                extension = extension[1];
            } else {
                for (i = 0; i < EXTENSIONS.length; i += 1) {
                    exists = fs.existsSync(filepath + '.' + EXTENSIONS[i]);
                    if (exists) {
                        extension = EXTENSIONS[i];
                        filepath += '.' + extension;
                        break;
                    }
                }
            }
            return {
                fullpath: filepath,
                extension: extension
            };
        },

        getContents: function (path) {
            return fs.readFileSync(path, {encoding: 'utf-8'});
        },

        getFullPath: function (path) {
            return fs.realpathSync(path);
        },

        getFolder: function (filename) {
            return path.dirname(filename);
        }

    };

}());
