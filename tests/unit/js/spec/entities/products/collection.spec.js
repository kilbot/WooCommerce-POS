describe('entities/products/collection.js', function () {

  // @todo idb-wrapper throws an error
  var Collection = proxyquire('entities/products/collection',{
    'lib/config/dual-collection': require('lib/config/collection')
  });

  var dummy_products = require('../../../data/products.json');

  it('should be in a valid state', function() {
    var collection = new Collection();
    expect(collection).to.be.ok;
  });

  it('should parse products, with or without \'products\' node', function() {

    // with node
    var collection = new Collection();
    collection.set( dummy_products, { parse: true } );
    expect(collection.length).to.equal( dummy_products.products.length );

    // without node
    var collection = new Collection();
    collection.set( dummy_products.products, { parse: true } );
    expect(collection.length).to.equal( dummy_products.products.length );

  });

});