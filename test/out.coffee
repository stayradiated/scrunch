# require = (name) ->
#   if not __source_index[name]? then return __require(name)
#   if __source_exports[name]? then return __source_exports[name]
#   global.module = exports: {}
#   __source_files[__source_index[name]]()
#   return __source_exports[name] = module.exports
# __source_exports = {}
# __source_index = {
#   './test2': '/Volumes/USB/crush/test/test2.coffee'
# }

((files) ->
  console.log(files)
)([
  [
    '/Volumes/USB/crush/test/test.coffee'
    (require, module, exports) ->
      fs = require 'fs'
      console.log(fs)
      test2 = require './test2'
      test2()
  ],
  [
    '/Volumes/USB/crush/test/test2.coffee'
    (require, module, exports) ->
      module.exports = ->
        console.log 'hello world!'
      
  ]
])
