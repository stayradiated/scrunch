'use strict';

var expect, npm;

expect = require('expect.js');
npm = require('../lib/npm');

describe('npm', function () {

  it('should resolve npm module', function (done) {

    var source = __dirname + '/npm.js';

    npm(source, 'expect.js').then(function (results) {
      expect(results.found).to.equal(true);
      expect(results.name).to.equal('expect.js');
      expect(results.type).to.equal('npm');
      expect(results.source).to.equal(source);
      expect(results.path).to.match(/scrunch\/node_modules\/expect\.js\/expect\.js$/);
      done();
    }).done();

  });

  it('should resolve a more complex npm module', function (done) {

    var source = __dirname + '/files/c.coffee';

    npm(source, 'lodash').then(function (results) {
      expect(results.found).to.equal(true);
      expect(results.name).to.equal('lodash');
      expect(results.type).to.equal('npm');
      expect(results.source).to.equal(source);
      expect(results.path).to.match(/scrunch\/node_modules\/lodash\/dist\/lodash\.js$/);
      done();
    }).done();

  });

  it('should resolve custom file in npm module', function (done) {

    var source = __dirname + '/npm.js';

    npm(source, 'lodash/lodash').then(function (results) {
      expect(results.found).to.equal(true);
      expect(results.name).to.equal('lodash/lodash');
      expect(results.type).to.equal('npm');
      expect(results.source).to.equal(source);
      expect(results.path).to.match(/scrunch\/node_modules\/lodash\/lodash\.js$/);
      done();
    }).done();

  });

  it('should not fail when resolving a missing npm module', function (done) {

    var source = __dirname + '/npm.js';

    npm(source, 'gummy_bears').then(function (results) {
      expect(results.found).to.equal(false);
      expect(results.name).to.equal('gummy_bears');
      expect(results.type).to.equal('npm');
      expect(results.source).to.equal(source);
      expect(results.path).to.equal(undefined);
      done();
    }).done();

  });

  it('should resolve file', function (done) {

    var source = __dirname + '/npm.js';

    npm(source, './files/a.coffee').then(function (results) {
      expect(results.found).to.equal(true);
      expect(results.name).to.equal('./files/a.coffee');
      expect(results.type).to.equal('path');
      expect(results.source).to.equal(source);
      expect(results.path).to.match(/scrunch\/test\/files\/a\.coffee$/);
      done();
    }).done();

  });

  it('should not fail when trying to resolve a missing file', function (done) {

    var source = __dirname + '/npm.js';

    npm(source, './missing').then(function(results) {
      expect(results.found).to.equal(false);
      expect(results.name).to.equal('./missing');
      expect(results.type).to.equal('path');
      expect(results.source).to.equal(source);
      expect(results.path).to.match(/scrunch\/test\/missing$/);
      done();
    }).done();
  });

});
