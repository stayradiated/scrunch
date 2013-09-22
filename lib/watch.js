(function () {

    "use strict";

    var fs, watch, pending, watching;

    fs = require('fs');

    watching = {};
    pending = false;

    watch = function (path, fn) {
        var listener;
        if (watching[path]) { return; }
        watching[path] = true;
        listener = fs.watch(path, function () {
            listener.close();
            watching[path] = false;
            if (!pending) {
                setTimeout(function () {
                    pending = false;
                    console.log('[watch]', path);
                    fn(path);
                    watch(path, fn);
                }, 300);
            }
            pending = true;
        });
    };

    module.exports = watch;

}());
