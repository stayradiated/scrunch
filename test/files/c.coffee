# c.coffee

console.log require './d.json'

console.log '[c] ...loaded'

module.exports = ->
  console.log '[c] ...being run'
  console.log '[c] requiring a...'
  require './a'
