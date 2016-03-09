describe('entities/products/collection.js', function () {

  var Collection = require('entities/products/collection');
  var dummy_products = require('../../../data/products.json');

  it('should be in a valid state', function() {
    var collection = new Collection({}, { disableLocalStorage: true });
    expect(collection).to.be.ok;
  });

  it('should parse products, with or without \'products\' node', function() {

    // with node
    var collection = new Collection({}, { disableLocalStorage: true });

    collection.set( dummy_products, { parse: true, remote: true } );
    expect(collection.length).to.equal( dummy_products.products.length );

    // without node
    collection.reset( dummy_products.products, { parse: true } );
    expect(collection.length).to.equal( dummy_products.products.length );

  });

});