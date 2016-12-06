describe('Dual Collections', function () {

  var Collection = require('lib/config/collection');
  var Model = require('lib/config/model');

  var DualCollection = Collection.extend({
    extends: ['dual'],
    model: Model.extend({
      extends: ['dual']
    })
  });

  beforeEach(function(){
    this.collection = new DualCollection({});
  });

  it('should be in a valid state', function(){
    expect( this.collection ).to.be.ok;
  });

});