describe('entities/orders/model.js', function () {

  beforeEach(function () {
    var Model = require('entities/orders/model');
    this.order = new Model();
  });

  it('should be in a valid state', function() {
    expect(this.order).to.be.ok;
  });

  it('should have sum convenience method', function() {
    var arr = [];
    while(arr.length < 3){
      arr.push( Math.random() );
    }
    this.order.set({
      foo: arr[0],
      bar: arr[1],
      baz: arr[2]
    });
    var sum = arr.reduce(function(pv, cv) { return pv + cv; }, 0);
    expect(this.order.sum(['foo', 'bar', 'baz'])).equals(sum);
  });

  it('should attach a cart if hasRemoteId() is false', function() {
    expect(this.order.cart).to.be.instanceof(Backbone.Collection);
  });

  it('should destroy itself when cart is empty', function() {
    this.order.cart.add([
      { title: 'foo' },
      { title: 'bar' }
    ]);
    this.order.destroy = stub();
    _.invoke( this.order.cart.toArray(), 'destroy');
    expect(this.order.destroy).to.have.been.calledOnce;
  });

  describe('onSaveSuccess()', function () {
    before(function () {
      expect(this.order).to.respondTo('onSaveSuccess');
    });

    beforeEach(function(){
      var CartItem = Backbone.Model.extend({
        url: '?'
      });
      this.order.cart = new Backbone.Collection([
        new CartItem({ title: 'foo' }),
        new CartItem({ title: 'bar' })
      ]);
    });

    it('should set cart.order_id if undefined', function() {
      this.order.set({local_id: 1});
      this.order.onSaveSuccess();
      expect(this.order.cart.order_id).equals(1);
    });

    it('should update cart items with order_id', function() {
      this.order.set({local_id: 1});
      this.order.onSaveSuccess();
      expect(this.order.cart.where({order: 1})).to.have.length(2);
    });
  });

});