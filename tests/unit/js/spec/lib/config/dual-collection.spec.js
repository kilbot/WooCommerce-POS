describe('lib/config/dual-collection.js', function () {

  var DualCollection = require('lib/config/dual-collection');

  beforeEach(function(){
    this.collection = new DualCollection({}, { disableLocalStorage: true });
  });

  it('should be in a valid state', function(){
    expect( this.collection ).to.be.ok;
  });

});