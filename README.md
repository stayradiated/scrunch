# Scrunch

Assembles coffee-script files.

It's like browserify, but only for coffee-script and doesn't package npm
dependencies (like `fs` and `http`).

## Usage

```
$ sudo npm install -g coffee-scrunch
$ scrunch
Usage: scrunch file [--log] [--compile] [[--watch] --out file]]
```

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

## Goals

- Have minimal dependencies
- Be fast
- Do less but do it better
- Be mostly jslint compatible

## Things to improve

- Ignore a `require` if the line is commented out
- Use less synchronus IO methods
