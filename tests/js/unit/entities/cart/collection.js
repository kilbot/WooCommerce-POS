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

  describe('sum() method', function () {

    it('should sum a given model attribute', function() {
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

  });

});