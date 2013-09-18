
var exec = require('child_process').exec;
var scrunch = require('../lib/scrunch');

describe('scrunch', function () {
  
    it('should work', function(done) {

      scrunch(__dirname + '/test.coffee', __dirname + '/out.coffee', function() {

        exec('coffee test/out.coffee', function(stderr, stdout) {
          if (stderr) {
            console.log(stderr);
          }
          console.log(stdout);
          done();
        });

      });

    });


});
