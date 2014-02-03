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
      console.log('[a] ...loaded');
      console.log('[a] requiring b...');
      b = _require(1);
      console.log('[a] running b...');
      return b();
    }, function(module, exports) {
      var c;
      console.log('[b] ...loaded');
      console.log('[b] requiring c...');
      c = _require(2);
      return module.exports = function() {
        console.log('[b] ...being run');
        console.log('[b] running c...');
        return c();
      };
    }, function(module, exports) {
      console.log(_require(3));
      console.log('[c] ...loaded');
      return module.exports = function() {
        console.log('[c] ...being run');
        console.log('[c] requiring a...');
        return _require(0);
      };
    }, function(module, exports) {
      return module.exports = {
        "string": "this is an example json file",
        "array": [0, 1, 2, 3],
        "number": 10,
        "object": {
          "hello": "world"
        }
      };
    }
  ];

  _require(0);

}).call(this);
