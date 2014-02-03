
var Q, expect, scrunch, fs;

expect = require('expect.js');
Q = require('kew');
scrunch = require('../index');
fs = require('../lib/fs');

describe('scrunch', function () {

  var options;

  options = {
    input: __dirname + '/files/a.coffee'
  };

  it('should scrunch', function (done) {

    Q.all([
      scrunch(options),
      fs.readFile(__dirname + '/files/out.js', {
        encoding: 'utf-8'
      })
    ]).then(function (result) {
      expect(result[0]).to.equal(result[1]);
      done();
    }).end();

  });

});
