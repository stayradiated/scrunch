
var Promise, expect, scrunch, fs;

expect  = require('expect.js');
Promise = require('bluebird');
scrunch = require('../index');
fs      = require('../lib/fs');

describe('scrunch', function () {

  var options;

  options = {
    input: __dirname + '/files/a.coffee'
  };

  it('should scrunch', function (done) {

    Promise.all([
      scrunch(options),
      fs.readFileAsync(__dirname + '/files/out.js', {
        encoding: 'utf-8'
      })
    ]).spread(function (actual, expected) {
      expect(actual).to.equal(expected);
      done();
    }).done();

  });

});
