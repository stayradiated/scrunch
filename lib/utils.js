/*jslint stupid: true*/

'use strict';

var fs, path, Q, EXTENSIONS, REGEX_EXTN;

fs   = require('./fs');
path = require('path');
Q = require('kew');

// Supported extensions
EXTENSIONS = ['coffee', 'js', 'json'];
REGEX_EXTN = new RegExp('\\.(' + EXTENSIONS.join('|') + ')$')

/**
 * Utilities
 */

module.exports = {

  /**
   * Get Extension
   *
   * Find out the correct extension of a file.
   * Example: './app' > {
   *   fullpath: '/home/app.js',
   *   extension: 'js',
   *   found: true
   * }
   *
   * - filepath (string)
   * > [promise] info (object)
   */

  getExtension: function (filepath) {
    var extension, i, exists, promise;

    // Check if filepath currently has an extension
    extension = filepath.match(REGEX_EXTN);
    exists = false;

    if (extension !== null) {

      extension = extension[1];
      promise = fs.exists(filepath).then(function (_exists) {
        exists = _exists;
      });

    } else {

      promise = Q.resolve();

      // Check each extension
      EXTENSIONS.forEach(function (extn) {
        promise = promise.then(function () {

          // Don't do anything if we have already found the file
          if (exists) return;

          var file = filepath + '.' + extn;

          return fs.exists(file).then(function (_exists) {
            if (! _exists) return;
            exists = true;
            filepath = file;
            extension = extn;
          });

        });
      });

    }

    return promise.then(function () {
      return {
        fullpath: filepath,
        extension: extension,
        found: exists
      };
    })

  },


  /**
   * Get Contents
   *
   * Get the contents of a file.
   *
   * - path (string)
   * > [promise] contents (string)
   */

  getContents: function (path) {
    return fs.readFile(path, {
      encoding: 'utf-8'
    });
  }

};
