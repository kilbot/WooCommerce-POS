describe('apps/pos/cart/route.js', function () {

  beforeEach(function () {

    var Route = proxyquire('apps/pos/cart/route', {
      './views/layout': stub(),
      './views/items': stub(),
      './views/totals': stub(),
      './views/notes': stub(),
      'lib/components/buttons/view': stub(),
      'lib/components/customer-select/view': stub()
    });
    Route.prototype.initialize = stub();

    this.route = new Route();
  });

  it('should be in a valid state', function() {
    expect(this.route).to.be.ok;
  });

  describe('onFetch', function () {

    beforeEach(function(){

      // Order models have id = remoteId, local_id = idAttribute
      var Collection = Backbone.Collection.extend({
        model: Backbone.Model.extend({
          idAttribute: 'local_id'
        })
      });

      this.route.collection = new Collection([
        { local_id: 1 },
        { local_id: 2 },
        { local_id: 3 }
      ]);

    });

    it('should attach the correct order if id given', function() {
      this.route.onFetch(2);
      var active = this.route.collection.active;
      expect(active).to.be.instanceof(Backbone.Model);
      expect(active.get('local_id')).equals(2);
    });

    it('should attach the first order if id not given', function() {
      this.route.onFetch();
      var active = this.route.collection.active;
      expect(active).to.be.instanceof(Backbone.Model);
      expect(active.get('local_id')).equals(1);
    });

  });

});