describe('entities/variations/model.js', function () {

  var dummy_products = require('../../../data/products.json');

  var Model = require('entities/variations/model');

  it('should be in a valid state', function(){
    var variable = _.find( dummy_products.products, { id: 40 } );
    var model = new Model( variable.variations[0] );
    model.should.be.ok;
  });

  it('should init with type = variation', function(){
    var variable = _.find( dummy_products.products, { id: 40 } );
    var model = new Model( variable.variations[0] );
    model.get('type').should.equal('variation');
  });

  it('should init with parent title (passed via options)', function(){
    var variable = _.find( dummy_products.products, { id: 40 } );
    var model = new Model( variable.variations[0], { parentAttrs: variable } );
    model.get('title').should.equal(variable.title);
  });

});