describe('lib/config/model.js', function () {

  var Model = require('lib/config/model.js');

  // WC REST API outputs nested json, mixed data types
  var wc_rest_api_output = {
    'product': {
      id: 99, // number
      price: '9.99', // string
      stock_quantity: '', // string or number
      managing_stock: false // boolean
    }
  };

  it('should be in a valid state', function() {
    var model = new Model();
    model.should.be.ok;
  });

  it('should parse WC REST API data', function() {
    var Product = Model.extend({
      name: 'product'
    });
    var model = new Product( wc_rest_api_output, { parse: true } );
    model.id.should.eql(99);
  });

  it('should convert attributes to given schema', function() {
    var Product = Model.extend({
      name: 'product',
      schema: {
        price: 'number',
        stock_quantity: 'number'
      }
    });
    var model = new Product( wc_rest_api_output, { parse: true } );
    model.get('price').should.eql(9.99);
    model.get('stock_quantity').should.eql(0);
  });

});