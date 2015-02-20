describe('entities/cart/collection.js', function () {

  beforeEach(function () {

    var Collection = proxyquire('entities/cart/collection',{
      'lib/config/collection': Backbone.Collection,
      './model': Backbone.Model,
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
  });

});