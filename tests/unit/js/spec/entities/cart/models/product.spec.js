describe('entities/cart/models/product.js', function () {

  var dummy_products = require('./../../../../data/products.json');
  var Model = require('entities/cart/models/product');
  var Utils = require('lib/utilities/utils');

  var dummy_tax_GB = {
    '': {
      1: {rate: '20.0000', label: 'VAT', shipping: 'yes', compound: 'yes'}
    },
    'reduced-rate': {
      2: {rate: '5.0000', label: 'VAT', shipping: 'yes', compound: 'yes'}
    },
    'zero-rate': {
      3: {rate: '0.0000', label: 'VAT', shipping: 'yes', compound: 'yes'}
    }
  }

  var dummy_tax_US = {
    '': {
      4: {rate: '10.0000', label: 'VAT', shipping: 'yes', compound: 'no'},
      5: {rate: '2.0000', label: 'VAT', shipping: 'yes', compound: 'yes'}
    }
  }

  it('should be in a valid state', function () {
    var model = new Model();
    expect(model).to.be.ok;
    expect(model.type).to.equal('product');
  });

  it('should parse simple product attributes into a cart line item', function(){

    var product = _.find(dummy_products.products, function (product) {
      return product.type === 'simple';
    });

    var model = new Model( product );

    expect(model.id).to.be.undefined;
    expect(model.get('title')).to.be.undefined;
    expect(model.get('name')).to.equal(product.title);

  });

  it('should parse variations into a cart line item with meta', function(){

    var product = _.find(dummy_products.products, function (product) {
      return product.type === 'variable';
    });

    var variation = product.variations[0];
    variation.type = 'variation';

    var model = new Model( variation );

    expect(model.id).to.be.undefined;
    expect(model.get('meta')).to.eql([{
      key: 1,
      label: 'Color',
      value: 'Black'
    }]);

  });

  it('should have a quantity convenience method ', function() {

    var product = dummy_products.products[0];
    var model = new Model( product );

    expect(model.get('quantity')).equals(1);
    model.quantity('increase');
    expect(model.get('quantity')).equals(2);
    model.quantity('decrease');
    expect(model.get('quantity')).equals(1);
  });

  it("should initiate with the correct values (no tax)", function() {

    var product = dummy_products.products[0];
    var model = new Model( _.extend( {}, product, { taxable: false } ) );
    expect(model.get('item_price')).equal( parseFloat( product.price ) );
    expect(model.get('total')).equal( parseFloat( product.price ) );

  });

  it("should re-calculate on quantity change to any floating point number", function() {

    var product = dummy_products.products[0];
    var model = new Model( product );

    var quantity = _.random(10, true);
    model.set( { 'quantity': quantity } );

    expect(model.get('quantity')).equal(quantity);
    expect(model.get('total')).equal( Utils.round( product.price * quantity, 4 ) );

  });

  /**
   * matching tests from https://github.com/woothemes/woocommerce/blob/master/tests/unit-tests/tax/tax.php
   */
  describe('Woo Unit Tests', function () {

    it("should match the Woo unit test for inclusive tax", function() {
      var model = new Model({
        taxable: true,
        tax_class: '',
        price: 9.99
      }, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'yes'
            },
            tax_rates: dummy_tax_GB
          }
        }
      });

      expect(model.get('total')).equal(8.325);
      expect(model.get('total_tax')).equal(1.665);
    });

    it("should match the Woo unit test for exclusive tax", function() {

      var model = new Model({
        taxable: true,
        tax_class: '',
        price: 9.99
      }, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            tax_rates: dummy_tax_GB
          }
        }
      });

      expect(model.get('total')).equal(9.99);
      expect(model.get('total_tax')).equal(1.998);
    });

    it("should match the Woo unit test for compound exclusive tax", function() {

      var model = new Model({
        taxable: true,
        tax_class: '',
        price: 100
      }, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            tax_rates: {
              '': {
                1: {rate: '5.0000', label: 'GST', shipping: 'yes', compound: 'no'},
                2: {rate: '8.5000', label: 'PST', shipping: 'yes', compound: 'yes'}
              }
            }
          }
        }
      });

      expect(model.get('total')).equal(100);
      expect(model.get('total_tax')).equal(13.925);

      // itemized
      //var tax = model.get('tax');
      //expect(tax[1].total).equal(5.0000);
      //expect(tax[2].total).equal(8.925);
    });

    it("should match the Woo unit test for compound inclusive tax", function() {

      var model = new Model({
        taxable: true,
        tax_class: '',
        price: 100
      }, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'yes'
            },
            tax_rates: {
              '': {
                1: {rate: '5.0000', label: 'GST', shipping: 'yes', compound: 'no'},
                2: {rate: '8.5000', label: 'PST', shipping: 'yes', compound: 'yes'}
              }
            }
          }
        }
      });

      expect(model.get('total')).equal(87.777);
      expect(model.get('total_tax')).equal(12.223);

      // itemized
      //var tax = this.model.get('tax');
      //expect(tax[1].total).equal(4.3889);
      //expect(tax[2].total).equal(7.8341);
    });

  });


  describe('entities/cart/models/product using GB dummy tax', function () {

    var product = dummy_products.products[0];

    it("should calculate the correct exclusive tax", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            tax_rates: dummy_tax_GB
          }
        }
      });

      // dummy product id 99, regular price $3, on sale for $2
      model.set({ 'taxable': true, 'tax_class': '' });

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal(3);
      expect(model.get('subtotal_tax')).equal(0.6);
      expect(model.get('total')).equal(2);
      expect(model.get('total_tax')).equal(0.4);

      // itemized
      //var tax = this.model.get('tax');
      //expect(tax[1].total).equal(0.4);
      //expect(tax[1].subtotal).equal(0.6);

    });

    it("should re-calculate exclusive tax on quantity change to any floating point number", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            tax_rates: dummy_tax_GB
          }
        }
      });

      var quantity = _.random(10, true);
      model.set( { 'taxable': true, 'tax_class': '', quantity: quantity } );

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal( Utils.round( 3 * quantity, 4 ) );
      expect(model.get('subtotal_tax')).equal( Utils.round( 0.6 * quantity, 4 ) );
      expect(model.get('total')).equal( Utils.round( 2 * quantity, 4 ) );
      expect(model.get('total_tax')).equal( Utils.round( 0.4 * quantity, 4 ) );

    });

    it("should calculate the correct inclusive tax", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'yes'
            },
            tax_rates: dummy_tax_GB
          }
        }
      });

      // dummy product id 99, regular price $3, on sale for $2
      model.set({ 'taxable': true, 'tax_class': '' });

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal(2.5);
      expect(model.get('subtotal_tax')).equal(0.5);
      expect(model.get('total')).equal(1.6667);
      expect(model.get('total_tax')).equal(0.3333);

      // itemized
      //var tax = this.model.get('tax');
      //expect(tax[1].total).equal(0.3333);
      //expect(tax[1].subtotal).equal(0.5);

    });

    it("should re-calculate inclusive tax on quantity change to any floating point number", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'yes'
            },
            tax_rates: dummy_tax_GB
          }
        }
      });

      var quantity = _.random(10, true);
      model.set( { 'taxable': true, 'tax_class': '', quantity: quantity } );

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal( Utils.round( 2.5 * quantity, 4 ) );
      expect(model.get('subtotal_tax')).equal( Utils.round( 0.5 * quantity, 4 ) );
      expect(model.get('total')).equal( Utils.round( 1.6666666 * quantity, 4 ) );
      expect(model.get('total_tax')).equal( Utils.round( 0.3333333 * quantity, 4 ) );

    });

    it("should recalculate the correct exclusive tax on change to tax_class", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            tax_rates: dummy_tax_GB
          }
        }
      });

      // dummy product id 99, regular price $3, on sale for $2
      model.set({ 'taxable': true, 'tax_class': '' });
      model.set({ 'tax_class': 'reduced-rate' });

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal(3);
      expect(model.get('subtotal_tax')).equal(0.15);
      expect(model.get('total')).equal(2);
      expect(model.get('total_tax')).equal(0.1);

      // itemized
      //var tax = this.model.get('tax');
      //expect(tax[1]).to.be.undefined;
      //expect(tax[2].total).equal(0.1);
      //expect(tax[2].subtotal).equal(0.15);

    });

    it("should recalculate the correct inclusive tax on change to tax_class", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'yes'
            },
            tax_rates: dummy_tax_GB
          }
        }
      });

      // dummy product id 99, regular price $3, on sale for $2
      model.set({ 'taxable': true, 'tax_class': '' });
      model.set({ 'tax_class': 'reduced-rate' });

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal(2.8571);
      expect(model.get('subtotal_tax')).equal(0.1429);
      expect(model.get('total')).equal(1.9048);
      expect(model.get('total_tax')).equal(0.0952);

      // itemized
      //var tax = this.model.get('tax');
      //expect(tax[1]).to.be.undefined;
      //expect(tax[2].total).equal(0.0952);
      //expect(tax[2].subtotal).equal(0.1429);

    });

    it("should recalculate the correct exclusive tax on change to zero rate", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            tax_rates: dummy_tax_GB
          }
        }
      });

      // dummy product id 99, regular price $3, on sale for $2
      model.set({ 'taxable': true, 'tax_class': '' });
      model.set({ 'tax_class': 'zero-rate' });

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal(3);
      expect(model.get('subtotal_tax')).equal(0);
      expect(model.get('total')).equal(2);
      expect(model.get('total_tax')).equal(0);

      // itemized
      //var tax = this.model.get('tax');
      //expect(tax[3].total).equal(0);
      //expect(tax[3].subtotal).equal(0);

    });

    it("should recalculate the correct inclusive tax on change to zero rate", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'yes'
            },
            tax_rates: dummy_tax_GB
          }
        }
      });

      // dummy product id 99, regular price $3, on sale for $2
      model.set({ 'taxable': true, 'tax_class': '' });
      model.set({ 'tax_class': 'zero-rate' });

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal(3);
      expect(model.get('subtotal_tax')).equal(0);
      expect(model.get('total')).equal(2);
      expect(model.get('total_tax')).equal(0);

      // itemized
      //var tax = this.model.get('tax');
      //expect(tax[3].total).equal(0);
      //expect(tax[3].subtotal).equal(0);

    });

  });

  describe('cart/model using US dummy tax', function () {

    var product = dummy_products.products[0];

    it("should calculate the correct compound exclusive tax", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            tax_rates: dummy_tax_US
          }
        }
      });

      // dummy product id 99, regular price $3, on sale for $2
      model.set({ 'taxable': true, 'tax_class': '' });

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal(3);
      expect(model.get('subtotal_tax')).equal(0.366);
      expect(model.get('total')).equal(2);
      expect(model.get('total_tax')).equal(0.244);

      // itemized
      //var tax = this.model.get('tax');
      //expect(tax[4].total).equal(0.2);
      //expect(tax[4].subtotal).equal(0.3);
      //expect(tax[5].total).equal(0.044);
      //expect(tax[5].subtotal).equal(0.066);

    });

    it("should re-calculate exclusive tax on quantity change to any floating point number", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            tax_rates: dummy_tax_US
          }
        }
      });

      var quantity = _.random(10, true);
      model.set( { 'taxable': true, 'tax_class': '', quantity: quantity } );

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal( Utils.round( 3 * quantity, 4 ) );
      expect(model.get('subtotal_tax')).equal( Utils.round( 0.366 * quantity, 4 ) );
      expect(model.get('total')).equal( Utils.round( 2 * quantity, 4 ) );
      expect(model.get('total_tax')).equal( Utils.round( 0.244 * quantity, 4 ) );

    });

    it("should calculate the correct compound inclusive tax", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'yes'
            },
            tax_rates: dummy_tax_US
          }
        }
      });

      // dummy product id 99, regular price $3, on sale for $2
      model.set({ 'taxable': true, 'tax_class': '' });

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal(2.6738);
      expect(model.get('subtotal_tax')).equal(0.3262);
      expect(model.get('total')).equal(1.7825);
      expect(model.get('total_tax')).equal(0.2175);

      // itemized
      //var tax = this.model.get('tax');
      //expect(tax[4].total).equal(0.1783);
      //expect(tax[4].subtotal).equal(0.2674);
      //expect(tax[5].total).equal(0.0392);
      //expect(tax[5].subtotal).equal(0.0588);

    });

    it("should calculate the correct non-compound exclusive tax", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            tax_rates: {
              '': {
                4: {rate: '10.0000', label: 'VAT', shipping: 'yes', compound: 'no'},
                5: {rate: '2.0000', label: 'VAT', shipping: 'yes', compound: 'no'}
              }
            }
          }
        }
      });

      // dummy product id 99, regular price $3, on sale for $2
      model.set({ 'taxable': true, 'tax_class': '' });

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal(3);
      expect(model.get('subtotal_tax')).equal(0.36);
      expect(model.get('total')).equal(2);
      expect(model.get('total_tax')).equal(0.24);

      // itemized
      //var tax = this.model.get('tax');
      //expect(tax[4].total).equal(0.2);
      //expect(tax[4].subtotal).equal(0.3);
      //expect(tax[5].total).equal(0.04);
      //expect(tax[5].subtotal).equal(0.06);

    });

    it("should calculate the correct non-compound inclusive tax", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'yes'
            },
            tax_rates: {
              '': {
                4: {rate: '10.0000', label: 'VAT', shipping: 'yes', compound: 'no'},
                5: {rate: '2.0000', label: 'VAT', shipping: 'yes', compound: 'no'}
              }
            }
          }
        }
      });

      // dummy product id 99, regular price $3, on sale for $2
      model.set({ 'taxable': true, 'tax_class': '' });

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal(2.6786);
      expect(model.get('subtotal_tax')).equal(0.3214);
      expect(model.get('total')).equal(1.7857);
      expect(model.get('total_tax')).equal(0.2143);

      // itemized
      //var tax = this.model.get('tax');
      //expect(tax[4].total).equal(0.1786);
      //expect(tax[4].subtotal).equal(0.2679);
      //expect(tax[5].total).equal(0.0357);
      //expect(tax[5].subtotal).equal(0.0536);

    });

    it("should calculate the correct compound exclusive tax on change to tax_class", function() {

      var model = new Model(product, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            tax_rates: dummy_tax_US
          }
        }
      });

      // dummy product id 99, regular price $3, on sale for $2
      model.set({ 'taxable': true, 'tax_class': '' });
      model.set({ 'tax_class': 'reduced-rate' });

      expect(model.get('item_price')).equal(2);
      expect(model.get('subtotal')).equal(3);
      expect(model.get('subtotal_tax')).equal(0);
      expect(model.get('total')).equal(2);
      expect(model.get('total_tax')).equal(0);

      // itemized
      //var tax = this.model.get('tax');
      //expect(tax).to.be.undefined;

    });

  });

});