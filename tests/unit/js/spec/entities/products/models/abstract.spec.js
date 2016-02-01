describe('entities/products/models/abstract.js', function () {

  var Model = require('entities/products/models/abstract');

  var dummy_products = require('../../../../data/products.json');

  it('should be in a valid state', function() {
    var product = new Model(dummy_products.products[0]);
    expect(product).to.be.ok;
  });

  it('should return Product attributes (ie: visible no variations)', function(){

    var dummy_product = {
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

    var product = new Model(dummy_product);

    expect( product.getProductAttributes() ).eqls([{
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


  describe('barcode match', function () {

    //it('should return true for a simple barcode match', function() {
    //  this.product.set({ type: 'simple' });
    //  this.product.barcodeMatch('SKU12345').should.be.true;
    //});
    //
    //it('should return false for a simple barcode mismatch', function() {
    //  this.product.set({ type: 'simple' });
    //  this.product.barcodeMatch('FOO12345').should.be.false;
    //});
    //
    //it('should trigger "match:barcode" for exact barcode match', function() {
    //  var trigger = stub();
    //  this.product.set({ type: 'simple' });
    //  this.product.on('match:barcode', trigger);
    //  this.product.barcodeMatch('SKU12345');
    //  trigger.should.have.been.calledWith(this.product);
    //});

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


});