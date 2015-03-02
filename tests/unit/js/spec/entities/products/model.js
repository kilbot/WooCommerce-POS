describe('entities/products/model.js', function () {

  var dummy_data = {
    id: 2,
    title: 'Variable Product',
    on_sale: true,
    price: '2.00',
    sale_price: null,
    regular_price: '2.00',
    variations: [{
      id: 3,
      on_sale: false,
      price: '6.00',
      sale_price: null,
      regular_price: '6.00'
    },{
      id: 4,
      on_sale: true,
      price: '2.50',
      sale_price: '2.50',
      regular_price: '5.00'
    },{
      id: 5,
      on_sale: false,
      price: '5.00',
      sale_price: '2.00',
      regular_price: '5.00'
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

  beforeEach(function () {
    var Model = require('entities/products/model');
    this.product = new Model(dummy_data);
  });

  it('should be in a valid state', function() {
    expect(this.product).to.be.ok;
  });

  describe('variation price ranges', function () {

    it('should return the price range', function() {
      expect(this.product.range('price')).eql(['2.50', '6.00']);
    });

    it('should return the regular price range', function() {
      expect(this.product.range('regular_price')).eql(['5.00', '6.00']);
    });

    it('should return the sale price range', function() {
      expect(this.product.range('sale_price')).eql(['2.50', '6.00']);
    });

  });

  describe('product attributes', function () {

    it('should return the visible product attributes (without variations)', function() {
      expect(this.product.productAttributes()).eql([{
        name: 'Ingredients',
        visible: true,
        variation: false,
        options: ['Milk', 'Flour', 'Eggs', 'Butter']
      },{
        name: 'OS',
        visible: true,
        variation: false,
        options: ['Mac', 'PC', 'Linux']
      }]);
    });

    it('should return the product variations', function() {
      expect(this.product.productVariations()).eql([{
        name: 'Color',
        visible: true,
        variation: true,
        options: ['Black', 'Blue']
      },{
        name: 'Size',
        visible: true,
        variation: true,
        options: ['S', 'M', 'L']
      }]);
    });

  });

});