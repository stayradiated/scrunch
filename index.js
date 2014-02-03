'use strict';

var Scrunch;

Scrunch = require('./lib/scrunch');

module.exports = function (options) {

  var scrunch;

  scrunch = new Scrunch(options);

  return scrunch.init().then(function () {
    return scrunch.compile();
  });

};
