module.exports = {

  app: {

    prefix: "__require = require\n\
require = (name) ->\n\
  if not __source_index[name]? then return __require(name)\n\
  if __source_exports[name]? then return __source_exports[name]\n\
  global.module = exports: {}\n\
  __source_files[__source_index[name]]()\n\
  return __source_exports[name] = module.exports\n\
__source_exports = {}",

    suffix: "\n__source_files['$(path)']()"

  },

  index: {
    prefix: "\n__source_index = {",
    join: function (rel, abs) {
      return "\n  '" + rel + "': '" + abs + "'";
    },
    suffix: "\n}"
  },

  files: {
    prefix:  "\n__source_files = {\n",
    join: function (path) {
        return "\n  '" + path + "': ->";
    },
    suffix:  "\n}"
  }

};
