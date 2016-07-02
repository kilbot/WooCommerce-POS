describe('entities/products/models/variable.js', function () {

  var Model = require('entities/products/models/variable');

  var dummy_products = require('../../../../data/products.json');

  var dummy_product = {
    id: 2,
    title: 'Variable Product',
    type: 'variable',
    on_sale: true,
    price: '2.00',
    sale_price: null,
    regular_price: '2.00',
    barcode: 'SKU12345',
    variations: [{
      id: 3,
      on_sale: false,
      price: '6.00',
      sale_price: null,
      regular_price: '6.00',
      barcode: 'SKU67890',
      attributes: [{
        name: 'Color',
        option: 'Black'
      },{
        name: 'Size',
        option: 'S'
      }]
    },{
      id: 4,
      on_sale: true,
      price: '2.50',
      sale_price: '2.50',
      regular_price: '5.00',
      attributes: [{
        name: 'Color',
        option: 'Black'
      },{
        name: 'Size',
        option: 'M'
      }]
    },{
      id: 5,
      on_sale: false,
      price: '5.00',
      sale_price: '2.00',
      regular_price: '5.00',
      attributes: [{
        name: 'Color',
        option: 'Blue'
      },{
        name: 'Size',
        option: 'S'
      }]
    }],
    attributes: [{
      name: 'Ingredients',
      visible: true,
      variation: false,
      options: ['Milk', 'Flour', 'Eggs', 'Butter']
    },{
      name: 'States',
      visible: false,
      variation: false,
      options: ['WA', 'VIC', 'NSW']
    },{
      name: 'OS',
      visible: true,
      variation: false,
      options: ['Mac', 'PC', 'Linux']
    },{
      name: 'Color',
      visible: true,
      variation: true,
      options: ['Black', 'Blue']
    },{
      name: 'Size',
      visible: true,
      variation: true,
      options: ['S', 'M', 'L']
    }]
  };

  it('should be in a valid state', function() {
    var variableProduct = _.find(dummy_products.products, { id: 40 });
    var product = new Model( variableProduct );
    expect(product).to.be.ok;
  });

  it('should attach a collection of variations', function() {
    var variableProduct = _.find(dummy_products.products, { id: 40 });
    var product = new Model( variableProduct, { parse: true } );
    expect(product.variations.length).equals( variableProduct.variations.length );
  });

  it('should return Product variations', function(){
    var product = new Model( dummy_product, { parse: true } );
    expect( product.getVariationOptions() ).eqls([{
      name: 'Color',
      options: ['Black', 'Blue']
    },{
      name: 'Size',
      options: ['S', 'M'] // note: L variation not preset in dummy_product
    }]);
  });

});