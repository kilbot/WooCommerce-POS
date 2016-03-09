describe('entities/orders/collection.js', function () {

  var dummy_orders = require('./../../../data/orders.json');
  var Collection = require('entities/orders/collection');

  it('should be in a valid state', function() {
    var collection = new Collection({}, { disableLocalStorage: true });
    expect(collection).to.be.ok;
  });

  it('should parse orders, with or without \'orders\' node', function() {

    var collection = new Collection({}, { disableLocalStorage: true });

    // { parse: true } runs through both Collection and Model parse
    collection.set( dummy_orders, { parse: true, remote: true } );
    expect(collection.length).to.equal( dummy_orders.orders.length );

    collection.reset( dummy_orders.orders, { parse: true } );
    expect(collection.length).to.equal( dummy_orders.orders.length );

  });

});