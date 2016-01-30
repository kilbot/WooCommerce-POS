describe('entities/cart/models/abstract.js', function () {

  var Model = require('entities/cart/models/abstract');

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
  });

  it('should have sum convenience method ', function() {

    var model = new Model();

    model.set({
      total: 1.23,
      subtotal: 4.56
    });

    var sum = model.sum(['total', 'subtotal']);
    expect(sum).equals(5.79);
  });

  it('should init with a tax_rate collection for calc_taxes = \'yes\'', function(){

    var model = new Model();
    expect( model.taxes ).to.be.undefined;

    var model = new Model( { taxable: true }, {
      collection: {
        order : {
          tax: {
            calc_taxes: 'yes'
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

    expect( model.taxes ).to.be.instanceOf( Backbone.Collection );
    expect( model.taxes ).to.have.length(2);

  });

  it('should reset tax rates on tax_class change', function(){

    var model = new Model( { taxable: true, tax_class: '' }, {
      collection: {
        order : {
          tax: {
            calc_taxes: 'yes'
          },
          getTaxRates: function( tax_class ){
            return dummy_tax_GB[tax_class];
          },
          taxRateEnabled: function(){
            return true;
          }
        }
      }
    });

    expect( model.taxes ).to.have.length(1);
    expect( model.taxes.at(0).get('rate_id') ).equals('1');

    model.set( {  tax_class: 'reduced-rate' } );

    expect( model.taxes ).to.have.length(1);
    expect( model.taxes.at(0).get('rate_id') ).equals('2');

  });

  it('should reset tax rates on taxable change', function(){

    var model = new Model( { taxable: false }, {
      collection: {
        order : {
          tax: {
            calc_taxes: 'yes'
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

    expect( model.taxes ).to.have.length(0);
    model.set( { taxable: true } );
    expect( model.taxes ).to.have.length(2);
    model.set( { taxable: false } );
    expect( model.taxes ).to.have.length(0);

  });


});