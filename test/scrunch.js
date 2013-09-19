
var exec = require('child_process').exec;
var scrunch = require('../lib/scrunch');

describe('scrunch', function () {
  
    it('should work', function() {

      var data = scrunch(__dirname + '/files/a.coffee');
      console.log(data);

    });


});
