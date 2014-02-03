/**
*
* Resolve an NPM dependency to a filepath
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

'use strict';

var path, find, parsePackage, Walk, resolveFile;

path = require('path');
find = require('./find');
Walk = require('./walk');

/**
 * Parse Package
 *
 * Retrieve the package.json for a folder and return it's main file;
 * Will throw an error if the folder does not have a package.json file
 * and if that package.json file does not have a main file.
 *
 * - folder (string)
 * > mainFile (string)
 */

parsePackage = function (folder) {
  var file, mainFile;

  try {
    file = require(folder + '/package.json');
  } catch (e) {
    throw new Error('The package "' + folder + '" does not contain a package.json');
  }

  if (typeof file.main !== 'string') {
    throw new Error('The file "' + folder + '/package.json" does not have a "main" file');
  }

  mainFile = file.main;

  if (mainFile[0] !== '.') {
    mainFile = './' + mainFile;
  }
  return mainFile;
};


/**
 * Resolve File
 *
 * The `sourcepath` must exist.
 *
 * - sourcepath (string) : path of the file that requires a file
 * - name (string) : the dependency being required
 * - [isFolder=false] (boolean)
 * > object
 */

resolveFile = function (sourcepath, name, isFolder) {
  var walk, folder, options, split, promise;

  options = {
    source: sourcepath,
    name: name,
    found: false
  };

  if (name.length === 0) {
    throw new Error('[error] empty name');
  }

  // Relative paths start with a period
  // Example: './folder/my_file.js'

  if (name[0] === '.') {

    // Try and find file
    if (isFolder) {
      folder = sourcepath;
    } else {
      folder = path.dirname(sourcepath);
    }

    options.type = 'path';
    options.path = path.join(folder, name);

    promise = find(options.path).then(function (extn) {
      options.path = extn;
      options.found = options.path.found;
      options.path = options.path.fullpath;
    });

  } else {

    // Check for NPM dependencies
    options.type = 'npm';

    // require('node_module/path/to/folder')
    split = name.split('/');

    // Walk up the directory looking for the module
    walk = new Walk(sourcepath, split[0]);
    promise = walk.start().then(function (folder) {

      if (split.length > 1) {
        options.path = '.' + name.slice(split[0].length);
      } else {
        options.path = parsePackage(folder);
      }

      return resolveFile(folder, options.path, true).then(function (results) {
        options.path = results.path;
        options.found = true;
      });

    }, function () {

      /* Could not find dependency */

    });

  }

  return promise.then(function () {
    return options;
  });

};

module.exports = resolveFile;
