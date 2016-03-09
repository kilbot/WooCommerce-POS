describe('lib/config/model.js', function () {

  var Model = require('lib/config/model.js');

  it('should be in a valid state', function() {
    var model = new Model();
    model.should.be.ok;
  });

  it('should convert attributes to given schema', function() {
    var Product = Model.extend({
      schema: {
        price: 'number',
        stock_quantity: 'number'
      }
    });

    var model = new Product( {
      id: 99, // number
      price: '9.99', // string
      stock_quantity: '', // string or number
      managing_stock: false // boolean
    }, { parse: true } );

    model.get('price').should.eql(9.99);
    model.get('stock_quantity').should.eql(0);
  });

});