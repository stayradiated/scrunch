'use strict';

module.exports = {

  app: {

    prefix: [
      '_require = (index) ->',
      '  module = _require.cache[index]',
      '  unless module',
      '    exports = {}',
      '    module = _require.cache[index] =',
      '      id: index',
      '      exports: exports',
      '    _require.modules[index].call(exports, module, exports)',
      '  module.exports',
      '_require.cache = []',
      '_require.modules = [\n'
    ].join('\n'),

    suffix: [
      ']',
      '_require 0'
    ].join('\n')

  },

  files: {

    prefix:  '\n',

    item: '  (module, exports) ->\n',

    pad: '    ',

    suffix:  '\n'

  },

  json: {
    prefix: '    module.exports =',
    pad: '    '
  }

};

