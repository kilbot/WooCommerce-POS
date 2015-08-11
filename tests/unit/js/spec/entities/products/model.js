describe('entities/products/model.js', function () {

  var Model = require('entities/products/model');
  var _ = require('lodash');
  var dummy = require('../../../data/products.json');

  var dummy_data = {
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
      barcode: 'SKU67890'
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

  describe('barcode match', function () {

    it('should return true for a simple barcode match', function() {
      this.product.set({ type: 'simple' });
      this.product.barcodeMatch('SKU12345').should.be.true;
    });

    it('should return false for a simple barcode mismatch', function() {
      this.product.set({ type: 'simple' });
      this.product.barcodeMatch('FOO12345').should.be.false;
    });

    it('should trigger "match:barcode" for exact barcode match', function() {
      var trigger = stub();
      this.product.set({ type: 'simple' });
      this.product.on('match:barcode', trigger);
      this.product.barcodeMatch('SKU12345');
      trigger.should.have.been.calledWith(this.product);
    });

    //it('should return true for a variable barcode match', function() {
    //  this.product.barcodeMatch('SKU12345').should.be.true;
    //});
    //
    //it('should return true for a variation barcode match', function() {
    //  this.product.barcodeMatch('SKU67890').should.be.true;
    //});
    //
    //it('should trigger "match:barcode" for exact variation match', function() {
    //  var trigger = stub();
    //  this.product.on('match:barcode', trigger);
    //  this.product.barcodeMatch('SKU67890');
    //  trigger.should.have.been.calledWith(dummy_data.variations[0], this.product);
    //});
    //
    //it('should return true for a partial barcode match', function() {
    //  this.product.barcodeMatch('12345').should.be.true;
    //});
    //
    //it('should return true for a partial variation barcode match', function() {
    //  this.product.barcodeMatch('67890').should.be.true;
    //});

  });

  describe('variable products', function () {

    before(function () {
      var variableAttributes = _.findWhere(dummy.products, { id: 40 });
      this.variableProduct = new Model(variableAttributes);
    });

    it('getVariationOptions should return variation options', function() {
      this.variableProduct.should.respondTo('getVariationOptions');
      this.variableProduct.getVariationOptions().should.eql([{
        name: 'Color',
        options: [ 'Black', 'Blue' ]
      }]);
    });

    it('getVariations should return variation collection', function(){
      this.variableProduct.should.respondTo('getVariations');
      var variations = this.variableProduct.getVariations();
      variations.should.be.instanceOf( require('lib/config/obscura') );
      variations.length.should.eql(2);
    });

    // changes to variations to made to parent.variations??
    //
    // it('getVariationOptions should return multiple variation options', function() {
    //  var filteredVariations = this.variableProduct.getVariations();
    //  var variations = filteredVariations.superset();
    //  variations.each(function(variation) {
    //    var variant = variation.get('attributes');
    //    variant.push({name: 'Size', option: 'Small'});
    //    variation.set('attributes', variant);
    //  });
    //
    //  this.variableProduct.getVariationOptions().should.eql([{
    //    name: 'Color',
    //    options: [ 'Black', 'Blue' ]
    //  }, {
    //    name: 'Size',
    //    options: [ 'Small' ]
    //  }]);
    //});

  });

});