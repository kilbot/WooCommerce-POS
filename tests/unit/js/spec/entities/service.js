describe('entities/service.js', function () {

  beforeEach(function () {

    var Module = proxyquire('entities/service', {
      './products/collection' : Backbone.Collection,
      './orders/collection'   : Backbone.Collection,
      './cart/collection'     : Backbone.Collection,
      './customers/collection': Backbone.Collection,
      './coupons/collection'  : Backbone.Collection,
      './settings'            : Backbone.Collection
    });

    this.module = new Module('entities', {}, {});

  });

  it('should be in a valid state', function() {
    expect(this.module).to.be.ok;
  });

  it('should return a Collection via the "get" method with { type: "collection" }', function() {
    var products = this.module.get({
      type: 'collection',
      name: 'products'
    });
    expect(products).to.be.an.instanceof(Backbone.Collection);
  });

  it('should return a Collection via Radio request "get" with { type: "collection" }', function() {
    var products = this.module.channel.request('get', {
      type: 'collection',
      name: 'products'
    });
    expect(products).to.be.instanceof(Backbone.Collection);
  });


  it('should not break if the "type" or "name" doesn\'t exist', function(){
    var foo = this.module.channel.request('get', {
      type: 'foo',
      name: 'products'
    });
    expect(foo).to.be.undefined;
    var foo = this.module.channel.request('get', {
      type: 'collection',
      name: 'foo'
    });
    expect(foo).to.be.undefined;
  });

  it('should store a reference to the Collection instance', function(){
    expect(this.module.orders).to.be.undefined;
    var orders = this.module.channel.request('get', {
      type: 'collection',
      name: 'orders'
    });
    expect(this.module._orders).to.be.instanceOf(Backbone.Collection);
  });

  it('should return same Collection instance on subsequent requests', function(){
    var orders = this.module.channel.request('get', {
      type: 'collection',
      name: 'orders'
    });
    orders.add( new Backbone.Model({ foo: 'bar'}) );
    var orders = this.module.channel.request('get', {
      type: 'collection',
      name: 'orders'
    });
    expect(orders.length).to.equal(1);
    expect(orders.at(0).get('foo')).to.equal('bar');
  });

  it('should return a FilteredCollection using { type: "filtered" }', function(){
    var filtered = this.module.channel.request('get', {
      type: 'filtered',
      name: 'products'
    });
    var Filtered = require('lib/config/filtered-collection');
    expect(filtered).to.be.instanceof(Filtered);
  });

  it('should return an app option using { type: "option" }', function(){
    this.module.app = new Backbone.Marionette.Application({ foo: 'bar' });
    var foo = this.module.channel.request('get', {
      type: 'option',
      name: 'foo'
    });
    expect(foo).to.equal('bar');
  });

  it('should return a settings Model using { type: "settings" }', function(){
    this.module.app = new Backbone.Marionette.Application({ foo: { user: 'setting' } });
    var foo = this.module.channel.request('get', {
      type: 'settings',
      name: 'foo'
    });
    expect(foo).to.be.instanceof(Backbone.Model);
    expect(foo.get('user')).equals('setting');
  });

  it('should be able to get/set data in localStorage', function() {
    this.module.channel.command('set', {
      type: 'localStorage',
      name: 'test',
      data: {foo: 'bar', bat: 'man'}
    });
    var foo = this.module.channel.request('get', {
      type: 'localStorage',
      name: 'test',
      key: 'foo'
    });
    expect(foo).equals('bar');
    this.module.channel.command('set', {
      type: 'localStorage',
      name: 'test',
      data: {foo: 'baz'}
    });
    var test = this.module.channel.request('get', {
      type: 'localStorage',
      name: 'test'
    });
    expect(test).eql({foo: 'baz', bat: 'man'});
  });

  it('should be able to remove data from localStorage', function() {
    this.module.channel.command('remove', {
      type: 'localStorage',
      name: 'test',
      key: 'bat'
    });
    var test = this.module.channel.request('get', {
      type: 'localStorage',
      name: 'test'
    });
    expect(test).eql({foo: 'baz'});
    this.module.channel.command('remove', {
      type: 'localStorage',
      name: 'test'
    });
    test = this.module.channel.request('get', {
      type: 'localStorage',
      name: 'test'
    });
    expect(test).to.be.undefined;
  });

  afterEach(function () {
    Backbone.Radio.reset();
  });

});