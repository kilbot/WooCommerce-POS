describe('entities/variations/collection.js', function () {

  var dummy = require('../../../data/products.json');
  var Collection = require('entities/variations/collection');
  var variations;

  beforeEach(function(){
    var variableProduct = _.findWhere(dummy.products, { id: 40 });
    variations = new Collection( variableProduct.variations );
  });

  it('should be in a valid state', function(){
    variations.should.be.ok;
  });

  it('should return the price range', function(){
    variations.range('price').should.eql([ 30, 35 ]);
  });

  it('should return the regular_price range', function(){
    variations.range('regular_price').should.eql([ 35 ]);
  });

  it('should return the sale_price range', function(){
    variations.range('sale_price').should.eql([ 30 ]);
  });

  it('should return an array of the available variation options', function(){
    variations.getVariationOptions().should.eql([{
      name: 'Color',
      options: [ 'Black', 'Blue' ]
    }]);
  });

  it('should handle WooCommerce \'Any ...\' option', function(){
    var collection = new Collection([
      {
        attributes: [
          { name: 'Size', option: 'Small' },
          { name: 'Color', option: '' }
        ]
      }, {
        attributes: [
          { name: 'Size', option: 'Large' },
          { name: 'Color', option: '' }
        ]
      }
    ], {
      parentAttrs: {
        attributes: [
          { name: 'Size', options: ['Small', 'Medium', 'Large'], variation: true},
          { name: 'Color', options: ['Black', 'Blue'], variation: true }
        ]
      }
    });

    collection.getVariationOptions().should.eql([
      { name: 'Size', options: [ 'Small', 'Large' ] },
      { name: 'Color', options: [ 'Black', 'Blue' ] }
    ]);
  });

});