# Coffee Merge

1. Get initial file (e.g. index.coffee)
2. Scan file for `require './some_file'`
3. Loop through all the files we find and scan them
4. Get the absolute path of each file, and use it to make sure we don't scan the same file more than once
5. Join all the files together with some code
6. Save as a file
