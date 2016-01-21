describe('entities/cart/models/fee.js', function () {

  var Model = require('entities/cart/models/fee');

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
    expect(model.type).to.equal('fee');
  });

  it('should init with correct initial values (no tax)', function(){

    var model = new Model();

    expect(model.get('item_price')).equals(0);
    expect(model.get('total')).equals(0);

    var model = new Model({ taxable: false, price: '5' });
    expect(model.get('item_price')).equals(5);
    expect(model.get('total')).equals(5);

  });

  describe('entities/cart/models/fee using GB dummy tax', function () {

    it("should init with the correct exclusive tax", function() {

      var model = new Model({
        taxable: true,
        tax_class: '',
        price: 10
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

      expect( model.get('item_price') ).equals( 10 );
      expect( model.get('total') ).equals( 10 );
      expect( model.get('total_tax') ).equals( 2 );

    });

    it("should init with the correct inclusive tax", function() {

      var model = new Model({
        taxable: true,
        tax_class: '',
        price: 10
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

      expect( model.get('item_price') ).equals( 10 );
      expect( model.get('total') ).equals( 8.3333 );
      expect( model.get('total_tax') ).equals( 1.6667 );

    });

  });

  it('should return the total on model.get(\'subtotal\')', function(){

    var model = new Model({
      taxable: true,
      tax_class: '',
      price: 10
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
    expect(model.get('subtotal')).equals(model.get('total'));

  });

  it('should return the total_tax on model.get(\'subtotal_tax\')', function(){

    var model = new Model({
      taxable: true,
      tax_class: '',
      price: 10
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
    expect(model.get('subtotal_tax')).equals(model.get('total_tax'));

  });

});