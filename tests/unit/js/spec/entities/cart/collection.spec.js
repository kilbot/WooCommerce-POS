describe('entities/cart/collection.js', function () {

  beforeEach(function () {
    var Collection = require('entities/cart/collection');
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
      { price: arr[0] },
      { price: arr[1] },
      { price: arr[2] }
    ]);
    this.collection.at(0).type = 'type';
    var sum = arr.reduce(function(pv, cv) { return pv + cv; }, 0);
    expect(this.collection.sum('price')).equals(sum);
    expect(this.collection.sum('price', 'type')).equals(arr[0]);

  });

  it('should add new items to the cart', function() {
    var product = new Backbone.Model({ id: 1, title: 'Product 1' });

    // add product as model
    this.collection.add(product);
    expect(this.collection.length).equals(1);

    // add product as attributes
    this.collection.add({ id: 2, title: 'Product 2'});
    expect(this.collection.length).equals(2);
  });

  it('should add shipping to cart', function() {

    this.collection.add({ method_title: 'Shipping' }, { type: 'shipping' });
    expect(this.collection.length).equals(1);

    var model = this.collection.at(0);
    expect(model.type).equals('shipping');
  });

  it('should add a fee to cart', function() {

    this.collection.add({ title: 'Fee' }, { type: 'fee' });
    expect(this.collection.length).equals(1);

    var model = this.collection.at(0);
    expect(model.type).equals('fee');
  });

  it('should increase quantity if exactly one product exists in cart', function(){

    // add product
    this.collection.add({ id: 123, title: 'Product 123' });

    // add same product
    this.collection.add({ id: 123, title: 'Product 123' });

    expect(this.collection.length).equals(1);
    expect(this.collection.at(0).get('quantity')).equals(2);

  });

  it('should allow multiple lines of the same product', function(){

    // add product
    this.collection.add([
      { id: 123, title: 'Product 123' },
      { id: 123, title: 'Product 123' }
    ]);

    expect(this.collection.length).equals(2);

    // add same product
    this.collection.add({ id: 123, title: 'Product 123' });

    expect(this.collection.length).equals(3);

  });

  it('should split products', function(){

    // add product
    this.collection.add({ id: 123, title: 'Product 123', quantity: 3 });
    expect(this.collection.length).equals(1);
    this.collection.split( this.collection.at(0) );
    expect(this.collection.length).equals(3);

  });

  it('should split products with float quantities', function(){

    // add product
    this.collection.add({ id: 123, title: 'Product 123', quantity: 3.25 });
    expect(this.collection.length).equals(1);
    this.collection.split( this.collection.at(0) );
    expect(this.collection.length).equals(4);
    expect(this.collection.at(0).get('quantity')).equals(0.25);

  });

});