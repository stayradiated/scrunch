'use strict';

var expect, replace;

expect = require('expect.js');
replace = require('../lib/replace');

describe('replace', function () {

  it('should replace `require` function calls', function () {

    var files = {
      'node_modules/module_1': {
        dependencies: {
          'module_2': 'node_modules/module_2',
          'module_3/test': 'node_modules/module_3/test'
        },
        contents: [
          'var m2 = require("module_2");',
          'console.log(m2());',
          'var m3 = require("module_3/test");',
          'm3();'
        ].join('\n')
      },
      'node_modules/module_3/test': {
        dependencies: {
          '../../[thing]': 'node_modules/module_3/test/thing'
        },
        contents: 'require("../../[thing]");'
      }
    };

    var order = [
      'node_modules/module_1',
      'node_modules/module_2',
      'node_modules/module_3/test',
      'node_modules/module_3/test/thing'
    ];

    replace(files, order);

    expect(files['node_modules/module_1'].contents).to.equal([
      'var m2 = _require(1);',
      'console.log(m2());',
      'var m3 = _require(2);',
      'm3();'
    ].join('\n'));

    expect(files['node_modules/module_3/test'].contents).to.equal(
      '_require(3);'
    );

  });

});