describe('lib/config/collection.js', function () {

  var Collection = require('lib/config/collection.js');

  it('should be in a valid state', function() {
    var collection = new Collection();
    collection.should.be.ok;
  });



});