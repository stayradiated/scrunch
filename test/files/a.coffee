# a.coffee

console.log '[a] ...loaded'

console.log '[a] requiring b...'

b = require './b'

console.log '[a] running b...'
b()
