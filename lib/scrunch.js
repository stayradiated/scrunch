
/**
 * Coffee Scrunch
 */

'use strict';

var path, shim, find, npm, coffee, Q, replace, fs,
  Scrunch, compile, log, slog, warn,
  REGEX_DEPENDENCY, REGEX_FILENAME, BACKTICK, REGEX_BACKTICK;

path   = require('path');
coffee = require('coffee-script');
find  = require('./find');
shim   = require('./shim');
npm    = require('./npm');
replace = require('./replace');
Q      = require('kew');
fs     = require('./fs');

/**
 * Constants
 */

REGEX_DEPENDENCY = /\brequire\s*\(?\s*['"][\.\/\w\-]*['"]\s*\)?/g;
REGEX_FILENAME   = /\brequire\s*\(?\s*['"]([\.\/\w\-]*)['"]/;
BACKTICK         = '__COFFEE_SCRUNCH_BACKTICK__'
REGEX_BACKTICK   = new RegExp(BACKTICK, 'g')

/**
 * Compile
 */

compile = function (contents) {
  try {
    return coffee.compile(contents);
  } catch (e) {
    console.error('\u0007ERROR', e);
    return '';
  }
};

/**
 * Scrunch class
 */

var Scrunch = function (options) {
  this.options = options || {};

  if (! this.options.input) {
    throw new Error('coffee-scrunch: options.input is required');
  }

  this.files  = {};
  this.order  = [];

};

Scrunch.prototype.init = function () {
  var self = this;

  // Load the input file and get it's dependencies
  return fs.realpath(this.options.input).then(function (input) {
    return self.load([ input ]);
  })

}


/**
 * Load
 *
 * Recursive function to loop through all file requirements.
 */

Scrunch.prototype.load = function (files) {
  var self, promises;

  self = this;
  promises = [];

  files.forEach(function (file) {

    var promise;

    // Don't load the same file twice
    if (self.files.hasOwnProperty(file) === true) return;

    promise = self.parse(file).then(function (dependencies) {
      return self.load(dependencies);
    });

    promises.push(promise);

  });

  return Q.all(promises);

};

/**
 * Read a file and get it's dependencies
 */

Scrunch.prototype.parse = function (filepath) {
  var contents, file, files, promises, extn, dependencies;

  // Add to order
  this.order.push(filepath);

  // Create new file object
  file = this.files[filepath] = {
    path: filepath,
    type: null,
    contents: null,
    dependencies: {}
  }

  // The dependency filenames
  files = [];

  // The promises
  promises = [];

  return fs.readFile(filepath, {
    encoding: 'utf-8'
  }).then(function (contents) {

    file.contents = contents;

    return find(filepath);

  }).then(function (info) {

    file.type = info.extension;

    // Get file dependencies
    dependencies = file.contents.match(REGEX_DEPENDENCY) || [];

    dependencies.forEach(function (dependency) {

      var promise;

      dependency = dependency.match(REGEX_FILENAME)[1];
      promise = npm(filepath, dependency).then(function (dependency) {

        file.dependencies[dependency.name] = dependency.path;
        files.push(dependency.path);

      });

      promises.push(promise);

    });

    return Q.all(promises);

  }).then(function () {

    return files;

  });

};


/**
 * Scrunch the loaded files into a single file
 */

Scrunch.prototype.compile = function () {
  var output, contents, path, file;

  // Replace require function calls
  replace(this.files, this.order);

  output = shim.app.prefix;

  // Concatenate files
  for (path in this.files) {
    file = this.files[path];

    output += shim.files.prefix;
    output += shim.files.item;

    switch (file.type) {

      case 'coffee':
        output += file.contents.replace(/^/mg, shim.files.pad);
        break;

      case 'js':
        contents = file.contents.replace(/`/g, BACKTICK);
        contents = contents.replace(/\\[\r\n]+/g, '');
        contents = '`' + contents + '`\nreturn';
        output += contents.replace(/^/mg, shim.files.pad);
        break;

      case 'json':
        output += shim.json.prefix;
        output += file.contents.replace(/^/mg, shim.json.pad);
        break;

    }

    output += shim.files.suffix;
  }

  output += shim.app.suffix;

  // Compile coffeescript
  output = compile(output);
  output = output.replace(REGEX_BACKTICK, '`');

  if (this.options.output) {
    return fs.writeFile(this.options.output, output);
  } else {
    return output;
  }

};

module.exports = Scrunch;
