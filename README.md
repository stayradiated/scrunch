# Coffee Merge

# 1. Get initial file (e.g. index.coffee)
# 2. Scan file for `/^\s*require\s*\(?\s*['"]\.+['"]\s*\)?\s*$/`
# 3. Loop through all the files we find and scan them
# 4. Get the absolute path of each file, and use it to make sure we don't scan the same file more than once
# 5. Join all the files together with some code
# 6. Save as a file

require = (name) ->
  if not __source_files[name]? then throw "Can't find #{ name }"
  if __source_cache[name]? then return __source_cache[name]
  global.module = exports: {}
  __source_files[name]()
  return __source_cache[name] = module.exports
__source_cache = {}
__source_files = {
  file1: ->
    file3 = require 'file3'
    file2 = require 'file2'
    file2()
    file3()
  file2: ->
    console.log 'fetching file2'
    module.exports = -> console.log('hurrah')
  file3: ->
    console.log 'fetching file3'
    module.exports = -> console.log 'world'
}
__source_files['file1']()
