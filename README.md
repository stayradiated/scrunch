# Scrunch

Assembles coffee-script files.

It's like browserify, but only for coffee-script and doesn't package npm
dependencies (like `fs` and `http`).

## Example

```coffeescript
# a.coffee
b = require './b'
console.log('running file b')
b()
```

```coffeescript
# b.coffee
c = require './c'
module.exports = ->
    console.log('running file c')
    c()
```

```coffeescript
# c.coffee
module.exports = ->
    console.log('this is file c')
```

```
$ scrunch a.coffee --out app.coffee
```

```coffeescript
# app.coffee
((files) ->
  cache = {}
  req = (id) ->
    if not cache[id]?
      if not files[id]?
        if (require?) then return require(id)
        throw new Error("Cannot find module '#{ id }'")
      file = cache[id] = exports: {}
      files[id][1].call file.exports, ((name) ->
        realId = files[id][0][name]
        return req(if realId? then realId else name)
      ), file, file.exports
    return cache[id].exports
  module.exports = req(0)
)([
  [
    # /home/admin/project/a.coffee
    {
      './b': 1
    },
    (require, module, exports) ->
      b = require './b'
      console.log('running file b')
      b()
      
  ]
  [
    # /home/admin/project/b.coffee
    {
      './c': 2
    },
    (require, module, exports) ->
      c = require './c'
      module.exports = ->
        console.log('running file c')
        c()
  ]
  [
    # /home/admin/project/c.coffee
    {
    },
    (require, module, exports) ->
      module.exports = ->
        console.log('this is file c')

  ]
])
```

```
$ coffee app.coffee
running file b
running file c
this is file c
```

```
$ scrunch a.coffee --minify --out app.min.js
```

```javascript
// app.min.js
!function(){!function(n){var r,e;return r={},e=function(o){var
t;if(null==r[o]){if(null==n[o]){if("undefined"!=typeof
require&&null!==require)return require(o);throw new Error("Cannot find module
'"+o+"'")}t=r[o]={exports:{}},n[o][1].call(t.exports,function(r){var t;return
t=n[o][0][r],e(null!=t?t:r)},t,t.exports)}return
r[o].exports},module.exports=e(0)}([[{"./b":1},function(n){var r;return
r=n("./b"),console.log("running file b"),r()}],[{"./c":2},function(n,r){var
e;return e=n("./c"),r.exports=function(){return console.log("running file
c"),e()}}],[{},function(n,r){return r.exports=function(){return
console.log("this is file c")}}]])}.call(this);
```
