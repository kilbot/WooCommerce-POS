describe('entities/orders/model.js', function () {

  /**
   * TODO: cart & gateway collections  too coupled to order model
   */
  beforeEach(function () {
    var entitiesChannel = Backbone.Radio.channel('entities');
    entitiesChannel.reply('get', function(){
      var Collection = Backbone.Collection.extend({
        url: '?',
        sum: function(){},
        itemizedTax: function(){}
      });
      return new Collection();
    });

    var Model = require('entities/orders/model');
    this.order = new Model();
    this.order.save = stub();

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

  it('should destroy itself when cart is empty', function() {
    this.order.cart.add([
      { title: 'foo' },
      { title: 'bar' }
    ]);
    this.order.destroy = stub();

    // void
    _.invoke( this.order.cart.toArray(), 'destroy');
    expect(this.order.destroy).to.have.been.calledOnce;

    // single remove
    this.order.cart.add([
      { title: 'foo' }
    ]);
    this.order.cart.at(0).destroy();
    expect(this.order.destroy).to.have.been.calledTwice;
  });

  //describe('onSaveSuccess()', function () {
  //  before(function () {
  //    expect(this.order).to.respondTo('onSaveSuccess');
  //  });
  //
  //  beforeEach(function(){
  //    var CartItem = Backbone.Model.extend({
  //      url: '?'
  //    });
  //    this.order.cart = new Backbone.Collection([
  //      new CartItem({ title: 'foo' }),
  //      new CartItem({ title: 'bar' })
  //    ]);
  //  });
  //
  //  it('should set cart.order_id if undefined', function() {
  //    this.order.set({local_id: 1});
  //    this.order.onSaveSuccess();
  //    expect(this.order.cart.order_id).equals(1);
  //  });
  //
  //  it('should update cart items with order_id', function() {
  //    this.order.set({local_id: 1});
  //    this.order.onSaveSuccess();
  //    expect(this.order.cart.where({order: 1})).to.have.length(2);
  //  });
  //
  //});

  describe('calcTotals()', function () {

    beforeEach(function(){
      var Collection = Backbone.Collection.extend({
        sum: function(prop){
          if(prop === 'total') return 10;
          if(prop === 'subtotal') return 12;
        },
        save: stub(),
        itemizedTax: stub()
      });
      this.order.cart = new Collection({ title: 'foo' });
    });

    it('should calculate the cart discount', function() {
      this.order.calcTotals();
      var totals = this.order.save.args[0][0]; // first args on first call
      expect(totals.cart_discount).equals(2);
    });

  });

  afterEach(function(){
    Backbone.Radio.reset();
  });



});