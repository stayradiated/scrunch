'use strict';

var expect, utils;

expect = require('expect.js');
utils = require('../lib/utils');

describe('utils', function () {

  describe('#getExtension', function () {

    it('should get a coffeescript file', function (done) {

      var filepath = __dirname + '/files/a';

      utils.getExtension(filepath).then(function (results) {
        expect(results.found).to.equal(true);
        expect(results.extension).to.equal('coffee')
        expect(results.fullpath).to.match(/scrunch\/test\/files\/a\.coffee$/);
        done();
      });

    });

    it('should get a javascript file', function (done) {

      var filepath = __dirname + '/utils';

      utils.getExtension(filepath).then(function (results) {
        expect(results.found).to.equal(true);
        expect(results.extension).to.equal('js')
        expect(results.fullpath).to.match(/scrunch\/test\/utils.js$/);
        done();
      });

    });

    it('should get a json file', function (done) {

      var filepath = __dirname + '/files/d';

      utils.getExtension(filepath).then(function (results) {
        expect(results.found).to.equal(true);
        expect(results.extension).to.equal('json')
        expect(results.fullpath).to.match(/scrunch\/test\/files\/d.json$/);
        done()
      });

    });

    it('should get a missing file', function (done) {

      var filepath = __dirname + '/i_do_not_exist';

      utils.getExtension(filepath).then(function (results) {
        expect(results.found).to.equal(false);
        expect(results.extension).to.equal(null)
        expect(results.fullpath).to.match(/scrunch\/test\/i_do_not_exist$/);
        done();
      });

    });

  });

});