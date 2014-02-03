# Scrunch

Assembles coffee-script files.

It's like browserify, but only for coffee-script and doesn't package npm
dependencies (like `fs` and `http`).

## Command Line Usage

```
$ sudo npm install -g coffee-scrunch
$ scrunch--help

  Usage: scrunch.js [options]

  Options:

    -h, --help        output usage information
    -V, --version     output the version number
    -v, --verbose     Detailed logs
    -i, --in [file]   Input file
    -o, --out [file]  Write to file

```

## API Usage

```javascript
var scrunch = require('coffee-scrunch');

var options = {
    input: 'init.coffee',
    output: 'app.js' // optional
};

scrunch(options).then(function () {
    console.log('finished');
});
```

## Example

```coffeescript
# a.coffee
b = require './b'
console.log('[a] running b...')
b()
```

```coffeescript
# b.coffee
c = require './c'
module.exports = ->
    console.log('[b] running c...')
    c()
```

```coffeescript
# c.coffee
module.exports = ->
    console.log('[c] ...being run')
```

```
$ scrunch -i a.coffee -o app.js
```

```coffeescript
(function() {
  var _require;

  _require = function(index) {
    var exports, module;
    module = _require.cache[index];
    if (!module) {
      exports = {};
      module = _require.cache[index] = {
        id: index,
        exports: exports
      };
      _require.modules[index].call(exports, module, exports);
    }
    return module.exports;
  };

  _require.cache = [];

  _require.modules = [
    function(module, exports) {
      var b;
      b = _require(1);
      console.log('[a] running b...');
      return b();
    }, function(module, exports) {
      var c;
      c = _require(2);
      return module.exports = function() {
        console.log('[b] running c...');
        return c();
      };
    }, function(module, exports) {
      return module.exports = function() {
        return console.log('[c] ...being run');
      };
    }
  ];

  _require(0);

}).call(this);
```

```
$ coffee app.coffee
[a] running b...
[b] running c...
[c] ...being run
```

## Goals

- Have minimal dependencies
- Be fast
- Do less but do it better
- Be mostly jslint compatible

## Things to improve

- Ignore a `require` if the line is commented out
- Use less synchronus IO methods
