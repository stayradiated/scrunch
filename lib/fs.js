/**
 * Wrap node fs with promises
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
 * Standard node callback signature is (err, value).
 * fs.exists callback is just (value).
 * So we need to wrap it in a promise manually.
 *
 * - path (string) : path to check
 * > [promise] boolean
 */

_fs.exists = function (path) {
  var promise = Q.defer();
  fs.exists(path, function (exists) {
    promise.resolve(exists);
  });
  return promise;
};


module.exports = _fs;