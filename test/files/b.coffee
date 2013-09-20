# b.coffee

console.log '[b] ...loaded'

console.log '[b] requiring c...'
c = require './c'

module.exports = ->
  console.log '[b] ...being run'
  console.log '[b] running c...'
  c()

