var scrunch = require('../index');

describe('scrunch', function () {

  var options;

  options = {
    input: __dirname + '/files/a.coffee'
    // output: optional file path
  };

  it('should scrunch', function (done) {
    scrunch(options).then(function (results) {
      console.log(results);
      done();
    }).end();
  });

  // it('should concat files', function() {
  //   scrunch(options).then(function (result) {
  //     // result = { code, map, options }
  //     console.log(result);
  //   });
  // });

});
