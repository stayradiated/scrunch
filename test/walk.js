'use strict';

var expect, Walk;

expect = require('expect.js');
Walk = require('../lib/walk');

describe('walk', function () {

  it('should find an npm module path', function (done) {

    var walk = new Walk('.', 'expect.js');
    walk.start().then(function (result) {
      expect(result).to.match(/scrunch\/node_modules\/expect\.js$/)
      done();
    }).end();

  });

  it('should fail when it cannot find a module path', function (done) {

    var walk = new Walk('.', 'i_do_no_exist');
    walk.start().fail(function (err) {
      expect(err).to.equal('err_no_module');
      done();
    }).end();

  });

});
