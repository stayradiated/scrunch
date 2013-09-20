var exec = require('child_process').exec;
var coffee = require('coffee-script');
var Scrunch = require('../lib/scrunch');

describe('scrunch', function () {

    var scrunch, output;
    var input = __dirname + '/files/a.coffee';
  
    it('should create a new instance', function() {

        scrunch = new Scrunch(input);

    });


    it('should compile the files', function() {
        output = scrunch.compile();

    });

    it('should run the output', function() {
        coffee.eval(output);
    });

});
