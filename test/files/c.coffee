# c.coffee

console.log '[c] ...loaded'

module.exports = ->
  console.log '[c] ...being run'
  console.log '[c] requring a...'
  require './a'
