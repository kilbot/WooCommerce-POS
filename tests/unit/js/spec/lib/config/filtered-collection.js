describe('lib/config/filtered-collection.js', function () {

  beforeEach(function () {
    var dummy = require('./../../../data/products.json');
    var superset = new Backbone.Collection(dummy.products);
    var Collection = require('lib/config/filtered-collection');
    this.collection = new Collection(superset);
  });

  describe('var filtered = new FilteredCollection();', function () {
    it('should be in a valid state', function() {
      expect(this.collection).to.be.ok;
    });
  });

  //describe('filtered.query()', function () {
  //
  //  it('should have a query method', function() {
  //    expect(this.collection).to.have.property('query');
  //  });
  //
  //  it('should filter a freetext query', function() {
  //    this.collection.query('woo');
  //    expect(this.collection.length).equal(12);
  //    this.collection.query('ninja');
  //    expect(this.collection.length).equal(9);
  //  });
  //
  //  it('should filter a cat: query', function() {
  //    this.collection.query('cat:Music');
  //    expect(this.collection.length).equal(6);
  //  });
  //
  //  it('should filter an id: query', function() {
  //    this.collection.query('id:99');
  //    expect(this.collection.length).equal(1);
  //  });
  //
  //  it('should filter a piped id: query', function() {
  //    this.collection.query('id:99|96');
  //    expect(this.collection.length).equal(2);
  //  });
  //
  //
  //});

});

// sub modules
require('./filtered-collection/parser');
require('./filtered-collection/query');