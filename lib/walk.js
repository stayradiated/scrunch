'use strict';

var Walk, fs, Promise, path;

Promise = require('bluebird');
fs = require('./fs');
path = require('path');


/**
 * Walk
 *
 * - (path) : path to start looking in
 * - (name) : name of the module
 */

Walk = function (_path, _name) {
  this.name = _name;
  this.path = _path;
};

/**
 * (private) Next
 *
 * Recursively move up a folder and check if it has a node_modules folder.
 * Fails if it reaches the top folder.
 *
 * > [promise] boolean
 */

Walk.prototype._next = function () {
  var self, module;

  self = this;
  module = path.resolve(this.path + '/node_modules/' + this.name);

  return fs.existsAsync(module).then(function(exists) {

    if (exists) return module;
    if (self.path === '/') return Promise.reject('err_no_module');

    // Go up a folder
    self.path = path.dirname(self.path);
    return self._next();
  });

};


/**
 * Start Walking
 *
 * > [promise] full path to the module
 * ! err_no_module
 */

Walk.prototype.start = function () {
  var self = this;
  return fs.realpathAsync(this.path).then(function (fullPath) {
    self.path = fullPath;
    return self._next();
  });
};

module.exports = Walk;
