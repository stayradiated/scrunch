/*jslint stupid: true*/

'use strict';

var fs, path, find, Promise, EXTENSIONS, REGEX_EXTN;

fs      = require('./fs');
path    = require('path');
Promise = require('bluebird');

// Supported extensions
EXTENSIONS = ['coffee', 'js', 'json'];
REGEX_EXTN = new RegExp('\\.(' + EXTENSIONS.join('|') + ')$');

/**
 * Find
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

find = function (filepath) {
  var extension, i, exists, promise;

  // Check if filepath currently has an extension
  extension = filepath.match(REGEX_EXTN);
  exists = false;

  if (extension !== null) {

    extension = extension[1];
    promise = fs.existsAsync(filepath).then(function (_exists) {
      exists = _exists;
    });

  } else {

    // Check each extension
    promise = Promise.reduce(EXTENSIONS, function (_, extn) {

      // Don't do anything if we have already found the file
      if (exists) return;

      var file = filepath + '.' + extn;

      return fs.existsAsync(file).then(function (_exists) {

        if (! _exists) return;
        exists = true;
        filepath = file;
        extension = extn;
      });

    }, null);

  }

  return promise.then(function () {
    return {
      fullpath: filepath,
      extension: extension,
      found: exists
    };
  });

};

module.exports = find;
