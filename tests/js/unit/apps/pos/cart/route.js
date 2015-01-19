describe('apps/pos/cart/route.js', function () {

  beforeEach(function () {

    var Route = proxyquire('apps/pos/cart/route', {
      './views/layout': stub(),
      './views/items': stub(),
      './views/totals': stub(),
      './views/actions': stub(),
      './views/notes': stub(),
      'lib/components/customer-select/view': stub()
    });
    this.route = new Route();

  });

  it('should be in a valid state', function() {
    expect(this.route).to.be.ok;
  });

  describe('onBeforeRender', function () {

    beforeEach(function(){

      this.route.collection = new Backbone.Collection([
        { local_id: 1 },
        { local_id: 2 },
        { local_id: 3 }
      ]);

    });

    it('should attach the correct order if order_id given', function() {
      this.route.order_id = 2;
      this.route.onBeforeRender();
      expect(this.route.order).to.be.instanceof(Backbone.Model);
      expect(this.route.order.get('local_id')).equals(2);
    });

    it('should attach the first order if order_id not given', function() {
      this.route.onBeforeRender();
      expect(this.route.order).to.be.instanceof(Backbone.Model);
      expect(this.route.order.get('local_id')).equals(1);
    });

    //it('should create a new order if no orders present', function() {
    //  this.route.collection = new Backbone.Collection([]);
    //  this.route.onBeforeRender();
    //  expect(this.route.order).to.be.instanceof(Backbone.Model);
    //});

  });

});