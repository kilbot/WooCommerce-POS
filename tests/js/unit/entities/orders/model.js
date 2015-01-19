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

  it('should have a void method which clears the cart collection', function() {
    this.order.cart = new Backbone.Collection([
      { title: 'foo' },
      { title: 'bar' }
    ]);
    expect(this.order.cart.length).equals(2);
    this.order.voidOrder();
    expect(this.order.cart.length).equals(0);
  });

});