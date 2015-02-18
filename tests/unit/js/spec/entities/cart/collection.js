describe('entities/cart/collection.js', function () {

  beforeEach(function () {

    var Collection = proxyquire('entities/cart/collection',{
      'lib/config/collection': Backbone.Collection,
      './model': Backbone.Model.extend({
        quantity: stub()
      }),
      'lib/config/indexeddb': stub()
    });
    this.collection = new Collection();

  });

  it('should be in a valid state', function() {
    expect(this.collection).to.be.ok;
  });

  it('should have sum convenience method', function() {
    var arr = [];
    while(arr.length < 3){
      arr.push( Math.random() );
    }
    this.collection.add([
      { random: arr[0] },
      { random: arr[1] },
      { random: arr[2] }
    ]);
    var sum = arr.reduce(function(pv, cv) { return pv + cv; }, 0);
    expect(this.collection.sum('random')).equals(sum);
  });

  it('should add new items to the cart', function() {
    var product = new Backbone.Model({ id: 1, title: 'Product 1'});

    // add product as model
    this.collection.addToCart(product);
    expect(this.collection.length).equals(1);

    // add product as attributes
    this.collection.addToCart({ id: 2, title: 'Product 2'});
    expect(this.collection.length).equals(2);

    // increase qty
    //this.collection.addToCart({ id: 1, title: 'Product 1'});
    //expect(model.quantity).to.have.been.calledWith('increase');
  });

  it('should update the order totals on cart change', function() {
    this.collection.add([
      { total: 1 },
      { total: 2 }
    ]);
    var trigger = stub();
    this.collection.on('update:totals', trigger);
    this.collection.add({ total: 3 });
    console.log(this.collection);
    expect(trigger).to.have.been.calledWith({
      cart_discount: 0,
      subtotal: 0,
      subtotal_tax: 0,
      total: 6,
      total_tax: 0
    });
  });

});