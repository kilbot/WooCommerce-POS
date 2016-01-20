describe('entities/orders/collection.js', function () {

  var dummy_orders = require('./../../../data/orders.json');

  beforeEach(function () {

    // @todo idb-wrapper throws an error
    //var Collection = require('entities/orders/collection');

    var Collection = proxyquire('entities/orders/collection',{
      'lib/config/dual-collection': require('lib/config/collection')
    });
    this.collection = new Collection();
  });

  it('should be in a valid state', function() {
    expect(this.collection).to.be.ok;
  });

  it('should parse orders, with or without \'orders\' node', function() {

    // { parse: true } runs through both Collection and Model parse
    this.collection.set( dummy_orders, { parse: true } );
    expect(this.collection.length).to.equal( dummy_orders.orders.length );

    this.collection.set( dummy_orders.orders, { parse: true } );
    expect(this.collection.length).to.equal( dummy_orders.orders.length );

  });

});