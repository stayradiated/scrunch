
/**
 * Coffee Scrunch
 */

'use strict';

var path, shim, utils, npm, coffee, Q, replace, fs,
  Scrunch, compile, log, slog, warn,
  REGEX_DEPENDENCY, REGEX_FILENAME, BACKTICK, REGEX_BACKTICK;

path   = require('path');
coffee = require('coffee-script');
utils  = require('./utils');
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

log = function () {
  console.log.apply(console,  arguments);
};

warn = function (message) {
  message = '\u001b[31m' + message + '\u001b[0m';
  log(message);
};

slog = function (message) {
  message = '\u001b[34m' + message + '\u001b[0m';
  log(message);
};

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
  this.output = '';

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
      console.log('dependencies', dependencies)
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

  log('\n' + filepath);

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

  return utils.getContents(filepath).then(function (contents) {

    file.contents = contents;

    return utils.getExtension(filepath);

  }).then(function (info) {

    file.type = info.extension;

    // Get file dependencies
    dependencies = file.contents.match(REGEX_DEPENDENCY) || [];

    dependencies.forEach(function (dependency) {

      var promise;

      dependency = dependency.match(REGEX_FILENAME)[1];
      promise = npm(filepath, dependency).then(function (dependency) {

        if (! dependency.found) {
          return warn('  x' + dependency.name);
        }

        if (dependency.type === 'npm') {
          slog('  + ' + dependency.name);
        } else {
          log('  - ' + dependency.name);
        }

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

Scrunch.prototype.compile = function (options) {
  var i, id, map, contents, dependency, path, file, fullPath, hasJS;

  log('\n' + 'replacing...');

  replace(this);

  log('\n' + 'scrunching...');

  hasJS = false;
  options = options || {};

  i = 0;
  map = {};

  // Generate map
  for (path in this.files) {
    if (this.files.hasOwnProperty(path)) {
      map[path] = i;
      i += 1;
    }
  }

  this.output = shim.app.prefix;

  // Concatenate files
  for (path in this.files) {
    if (this.files.hasOwnProperty(path)) {

      file = this.files[path];

      this.output += shim.files.prefix;
      this.output += shim.files.item;

      // Fix for javascript
      if (file.type === 'js') {
        contents = file.contents.replace(/`/g, BACKTICK);
        contents = contents.replace(/\\[\r\n]+/g, '');
        contents = '`' + contents + '`\nreturn';
        this.output += contents.replace(/^/mg, shim.files.pad);
      } else if (file.type === 'json') {
        this.output += shim.json.prefix;
        this.output += file.contents.replace(/^/mg, shim.json.pad);
      } else {
        this.output += file.contents.replace(/^/mg, shim.files.pad);
      }

      this.output += shim.files.suffix;
    }
  }

  this.output += shim.app.suffix;

  log('compiling...');
  this.output = compile(this.output);
  this.output = this.output.replace(REGEX_BACKTICK, '`');

  return Q.resolve(this.output);
};

module.exports = Scrunch;
