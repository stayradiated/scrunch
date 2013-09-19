/*jslint node: true, stupid: true*/

var fs     = require('fs');
var path   = require('path');

/**
 * Utilities
 */

module.exports = {

    getExtension: function (path) {
        var extension = path.match(/\.(coffee|json|js)$/);
        return extension ? '' : '.coffee';
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
