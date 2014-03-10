/**
 * Replace filenames with numbers
 */

'use strict';

var replace, escape;

escape = function (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

replace = function (contents, path, newPath) {
  var regex;
  path = escape(path);
  regex = new RegExp('\\brequire\\s*\\(?\\s*[\'"](' + path + ')[\'"]\\)?');
  return contents.replace(regex, '_require(' + newPath + ')');
};

module.exports = function (files, order) {
  var filepath, file, dependency, index;

  for (filepath in files) {
    file = files[filepath];

    for (dependency in file.dependencies) {
      index = order.indexOf(file.dependencies[dependency]);
      file.contents = replace(file.contents, dependency, index);
    }
  }
};
