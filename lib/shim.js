(function () {

    "use strict";

    module.exports = {

        app: {

            prefix: "\
((files) ->\n\
  cache = {}\n\
  req = (id) ->\n\
    if not cache[id]?\n\
      if not files[id]?\n\
        if (require?) then return require(id)\n\
        throw new Error(\"Cannot find module '#{ id }'\")\n\
      file = cache[id] = exports: {}\n\
      files[id][1].call file.exports, ((name) ->\n\
        realId = files[id][0][name]\n\
        return req(if realId? then realId else name)\n\
      ), file, file.exports\n\
    return cache[id].exports\n\
  module.exports = req(0)\n\
)([",

            suffix: "\n])"

        },

        index: {

            prefix: function (fullPath) {
                return "    # " + fullPath + "\n    {\n";
            },

            item: function (path, id) {
                return "      '" + path + "': " + id + "\n";
            },

            suffix: "    },\n"

        },

        files: {

            prefix:  "\n  [\n",

            item:    "    (require, module, exports) ->\n",

            suffix:  "\n  ]"

        }

    };

}());
