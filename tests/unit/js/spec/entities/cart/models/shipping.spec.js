describe('entities/cart/models/shipping.js', function () {

  var Model = require('entities/cart/models/shipping');

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
    expect(model.type).to.equal('shipping');
  });

  it('should init with correct initial values (no tax)', function(){

    var model = new Model();
    expect(model.get('item_price')).equals(0);
    expect(model.get('total')).equals(0);

    var model = new Model({ taxable: false, price: '10' });
    expect(model.get('item_price')).equals(10);
    expect(model.get('total')).equals(10);

  });

  describe('shipping line using GB dummy tax', function () {

    it('should calculate the correct exclusive tax', function() {

      var model = new Model({
        taxable: true,
        price: 10
      }, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            getTaxRates: function(){
              return dummy_tax_GB[''];
            },
            taxRateEnabled: function(){
              return true;
            }
          }
        }
      });

      model.get('item_price').should.eql(10);
      model.get('total').should.eql(10);
      model.get('total_tax').should.eql(2);

    });

    it('should calculate the correct inclusive tax', function() {

      var model = new Model({
        taxable: true,
        price: 10
      }, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'yes'
            },
            getTaxRates: function(){
              return dummy_tax_GB[''];
            },
            taxRateEnabled: function(){
              return true;
            }
          }
        }
      });

      model.get('item_price').should.eql(10);
      model.get('total').should.eql(8.3333);
      model.get('total_tax').should.eql(1.6667);

    });

    it('should honour the shipping=\'no\' setting for exclusive tax', function() {

      var model = new Model({
        taxable: true,
        price: 10
      }, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            getTaxRates: function(){
              return {
                1: {rate: '20.0000', label: 'VAT', shipping: 'no', compound: 'yes'}
              };
            },
            taxRateEnabled: function(){
              return true;
            }
          }
        }
      });

      model.get('item_price').should.eql(10);
      model.get('total').should.eql(10);
      model.get('total_tax').should.eql(0);

    });

    it('should honour the shipping=\'no\' setting for inclusive tax', function() {

      var model = new Model({
        taxable: true,
        price: 10
      }, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'yes'
            },
            getTaxRates: function(){
              return {
                1: {rate: '20.0000', label: 'VAT', shipping: 'no', compound: 'yes'}
              };
            },
            taxRateEnabled: function(){
              return true;
            }
          }
        }
      });

      model.get('item_price').should.eql(10);
      model.get('total').should.eql(10);
      model.get('total_tax').should.eql(0);

    });

  });

  describe('shipping line using US dummy tax', function () {

    it('should calculate the correct exclusive tax', function() {

      var model = new Model({
        taxable: true,
        price: 10
      }, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            getTaxRates: function(){
              return dummy_tax_US[''];
            },
            taxRateEnabled: function(){
              return true;
            }
          }
        }
      });

      model.get('item_price').should.eql(10);
      model.get('total').should.eql(10);
      model.get('total_tax').should.eql(1.22);

    });

    it('should calculate the correct inclusive tax', function() {

      var model = new Model({
        taxable: true,
        price: 10
      }, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'yes'
            },
            getTaxRates: function(){
              return dummy_tax_US[''];
            },
            taxRateEnabled: function(){
              return true;
            }
          }
        }
      });

      model.get('item_price').should.eql(10);
      model.get('total').should.eql(8.9127);
      model.get('total_tax').should.eql(1.0873);

    });

    it('should honour the shipping=\'no\' setting for exclusive tax', function() {

      var model = new Model({
        taxable: true,
        price: 10
      }, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'no'
            },
            getTaxRates: function(){
              return {
                4: {rate: '10.0000', label: 'VAT', shipping: 'yes', compound: 'no'},
                5: {rate: '2.0000', label: 'VAT', shipping: 'no', compound: 'yes'}
              };
            },
            taxRateEnabled: function(){
              return true;
            }
          }
        }
      });

      model.get('item_price').should.eql(10);
      model.get('total').should.eql(10);
      model.get('total_tax').should.eql(1);
    });

    it('should honour the shipping=\'no\' setting for inclusive tax', function() {

      var model = new Model({
        taxable: true,
        price: 10
      }, {
        collection: {
          order : {
            tax: {
              calc_taxes: 'yes',
              prices_include_tax: 'yes'
            },
            getTaxRates: function(){
              return {
                4: {rate: '10.0000', label: 'VAT', shipping: 'no', compound: 'no'},
                5: {rate: '2.0000', label: 'VAT', shipping: 'yes', compound: 'yes'}
              };
            },
            taxRateEnabled: function(){
              return true;
            }
          }
        }
      });

      model.get('item_price').should.eql(10);
      model.get('total').should.eql(9.8039);
      model.get('total_tax').should.eql(0.1961);

    });

  });

});