# Scrunch

Assembles coffee-script files.

It's like browserify, but only for coffee-script and doesn't package npm
dependencies (like `fs` and `http`).

## Example

```coffeescript
# a.coffee
a = require './a'
a()
```

```coffeescript
# b.coffee
c = require './c'
module.exports = ->
    console.log('hello world')
    c()
```

```coffeescript
# c.coffee
module.exports = ->
    console.log('this is file c')
```
