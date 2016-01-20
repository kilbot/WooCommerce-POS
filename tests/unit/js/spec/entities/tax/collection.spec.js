describe('entities/tax/collection.js', function () {

  var Collection = require('entities/tax/collection');

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

  it('should be in a valid state', function() {
    var collection = new Collection();
    expect(collection).to.be.ok;
  });

  it('should parse tax rates from POS params', function(){
    var collection = new Collection( dummy_tax_US[''], { parse: true } );
    expect(collection).to.have.length(2);
    expect(collection.pluck('rate_id')).to.eql(['4', '5']);
  });

  it('update rate collection on tax_class change', function(){
    var collection = new Collection( dummy_tax_US[''], { parse: true } );
    expect(collection).to.have.length(2);
    expect(collection.pluck('rate_id')).to.eql(['4', '5']);
  });

});