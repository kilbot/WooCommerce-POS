describe('entities/products/models/simple.js', function () {

  var Model = require('entities/products/models/simple');
  var dummy_products = require('../../../../data/products.json');

  it('should be in a valid state', function() {
    var product = new Model( dummy_products.products[0] );
    expect(product).to.be.ok;
  });

});