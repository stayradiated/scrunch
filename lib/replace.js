/**
 * Replace filenames with numbers
 */

 'use strict';

 var replace;

replace = function (contents, path, newPath) {
  var regex = new RegExp('\\brequire\\s*\\(?\\s*[\'"](' + path + ')[\'"]\\)?');
  return contents.replace(regex, '_require(' + newPath + ')');
};

module.exports = function (scrunch) {
  var order, filepath, file, dependency, index;

  for (filepath in scrunch.files) {
    file = scrunch.files[filepath];

    for (dependency in file.dependencies) {
      index = scrunch.order.indexOf(file.dependencies[dependency])
      file.contents = replace(file.contents, dependency, index)
    }
  }
};
