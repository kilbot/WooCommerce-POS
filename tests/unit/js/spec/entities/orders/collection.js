describe('entities/orders/collection.js', function () {

  beforeEach(function () {

    var Collection = proxyquire('entities/orders/collection',{
      './model': Backbone.Model,
      'lib/config/dual-collection': Backbone.Collection,
      'lib/config/indexeddb': stub()
    });
    this.collection = new Collection();

  });

  it('should be in a valid state', function() {
    expect(this.collection).to.be.ok;
  });

});