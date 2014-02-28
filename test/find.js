'use strict';

var expect, find;

expect = require('expect.js');
find = require('../lib/find');

describe('find', function () {

  it('should get a coffeescript file', function (done) {

    var filepath = __dirname + '/files/a';

    find(filepath).then(function (results) {
      expect(results.found).to.equal(true);
      expect(results.extension).to.equal('coffee');
      expect(results.fullpath).to.match(/scrunch\/test\/files\/a\.coffee$/);
      done();
    }).done();

  });

  it('should get a javascript file', function (done) {

    var filepath = __dirname + '/find';

    find(filepath).then(function (results) {
      expect(results.found).to.equal(true);
      expect(results.extension).to.equal('js');
      expect(results.fullpath).to.match(/scrunch\/test\/find.js$/);
      done();
    }).done();

  });

  it('should get a json file', function (done) {

    var filepath = __dirname + '/files/d';

    find(filepath).then(function (results) {
      expect(results.found).to.equal(true);
      expect(results.extension).to.equal('json');
      expect(results.fullpath).to.match(/scrunch\/test\/files\/d.json$/);
      done();
    }).done();

  });

  it('should get a missing file', function (done) {

    var filepath = __dirname + '/i_do_not_exist';

    find(filepath).then(function (results) {
      expect(results.found).to.equal(false);
      expect(results.extension).to.equal(null);
      expect(results.fullpath).to.match(/scrunch\/test\/i_do_not_exist$/);
      done();
    }).done();

  });

});
