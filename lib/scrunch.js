
/**
 * Coffee Scrunch
 */

'use strict';

var path, shim, find, npm, coffee, Promise, replace, fs,
  Scrunch, compile, log,
  REGEX_DEPENDENCY, REGEX_FILENAME, BACKTICK, REGEX_BACKTICK;

path    = require('path');
coffee  = require('coffee-script');
Promise = require('bluebird');
log     = require('log_')('scrunch', 'blue');
find    = require('./find');
shim    = require('./shim');
npm     = require('./npm');
replace = require('./replace');
fs      = require('./fs');

/**
 * Constants
 */

REGEX_DEPENDENCY = /\brequire\s*\(?\s*['"][\.\/\w\-]*['"]\s*\)?/g;
REGEX_FILENAME   = /\brequire\s*\(?\s*['"]([\.\/\w\-]*)['"]/;
BACKTICK         = '__COFFEE_SCRUNCH_BACKTICK__';
REGEX_BACKTICK   = new RegExp(BACKTICK, 'g');

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

Scrunch.prototype.log = function() {
  if (! this.options.log) return;
  log.apply(null, arguments);
};

Scrunch.prototype.init = function () {
  var self = this;

  self.log('initiating from:', this.options.input);

  // Load the input file and get it's dependencies
  return fs.realpathAsync(this.options.input).then(function (input) {
    return self.load([ input ]);
  });

};


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

    self.log('+', file);

    // Don't load the same file twice
    if (self.files.hasOwnProperty(file) === true) return;

    promise = self.parse(file).then(function (dependencies) {
      return self.load(dependencies);
    });

    promises.push(promise);

  });

  return Promise.all(promises);

};

/**
 * Read a file and get it's dependencies
 */

Scrunch.prototype.parse = function (filepath) {
  var self, contents, file, files, promises, extn, dependencies;

  self = this;

  // Add to order
  this.order.push(filepath);

  // Create new file object
  file = this.files[filepath] = {
    path: filepath,
    type: null,
    contents: null,
    dependencies: {}
  };

  // The dependency filenames
  files = [];

  // The promises
  promises = [];

  return fs.readFileAsync(filepath, {
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

        if (! dependency.found) {
          return;
        }

        file.dependencies[dependency.name] = dependency.path;
        files.push(dependency.path);

      });

      promises.push(promise);

    });

    return Promise.all(promises);

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
