describe('entities/variations/collection.js', function () {

  var Collection, variableProduct, variations;
  var dummy = require('../../../data/products.json');

  before(function () {
    Collection = proxyquire('entities/variations/collection',{
      './model': Backbone.Model
    });
    variableProduct = _.findWhere(dummy.products, { id: 40 });
  });

  beforeEach(function(){
    variations = new Collection( variableProduct.variations );
  });

  it('should be in a valid state', function(){
    variations.should.be.ok;
  });

  it('should return the price range', function(){
    variations.range('price').should.eql([ '30.00', '35.00' ]);
  });

  it('should return the regular_price range', function(){
    variations.range('regular_price').should.eql([ '35.00' ]);
  });

  it('should return the sale_price range', function(){
    variations.range('sale_price').should.eql([ '30.00' ]);
  });

});