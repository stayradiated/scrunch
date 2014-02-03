/**
 * Promise FS
 */

'use strict';

var Q, fs, _fs, key;

Q = require('kew');
fs = require('fs');

_fs = {}

for (key in fs) {
  _fs[key] = Q.bindPromise(fs[key], fs);
}

/**
 * File Exists
 *
 */

_fs.exists = function (path) {
  var promise = Q.defer();
  fs.exists(path, function (exists) {
    promise.resolve(exists);
  });
  return promise;
};


module.exports = _fs;