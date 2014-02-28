/**
 * Wrap node fs with promises
 */

'use strict';

var Promise, fs;

Promise = require('bluebird');
fs = Promise.promisifyAll(require('fs'));

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

fs.existsAsync = function (path) {
  var deferred = Promise.defer();
  fs.exists(path, function (exists) {
    deferred.resolve(exists);
  });
  return deferred.promise;
};


module.exports = fs;
