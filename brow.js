;
(function e(fileList, exportsCache, initialFiles) {

    function __require(fileId, u) {

        // If we have NOT yet already loaded the file
        if (!exportsCache[fileId]) {

            // If the fileId is not in the fileList
            if (!fileList[fileId]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(fileId, !0);
                if (nodeRequire) return nodeRequire(fileId, !0);
                throw new Error("Cannot find module '" + fileId + "'")
            }

            var f = exportsCache[fileId] = {
                exports: {}
            };
            fileList[fileId][0].call(f.exports, function (e) {
                var exportsCache = fileList[fileId][1][e];
                return __require(exportsCache ? exportsCache : e)
            }, f, f.exports, e, fileList, exportsCache, initialFiles)
        }
        return exportsCache[fileId].exports
    }

    var nodeRequire = typeof require == "function" && require;

    for (var i = 0; i < initialFiles.length; i++) {
      __require(initialFiles[i]);
    }

    return __require
})({
    1: [
        function (require, module, exports) {
            var test2 = require('./test2');
            test2();
            module.exports = 'thing';

        }, {
            "./test2": 2
        }
    ],
    2: [
        function (require, module, exports) {
            module.exports = function () {
                console.log('hello world');
            };

        }, {}
    ]
}, {}, [1]);
