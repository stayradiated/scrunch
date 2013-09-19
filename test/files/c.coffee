# c.coffee
a = require './a'
b = require './b'

module.exports = ->
  console.log ('hey')

b()
a()
