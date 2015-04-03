describe('lib/config/dual-collection.js', function () {

  beforeEach(function () {
    var DualCollection = proxyquire('lib/config/dual-collection', {
      './idb-collection': Backbone.Collection
    });
    this.collection = new DualCollection();
    this.collection.name = 'test';

    this['local'] = [
      {remoteId: 1},
      {remoteId: 2},
      {remoteId: 3}
    ];

    this.remote = {
      test: [ // note WC REST API returns collection name parent
        {id: 2, title: 'Example 1'},
        {id: 4, title: 'Example 2'},
        {id: 6, title: 'Example 2'}
      ]
    };
  });

  it('should be in a valid state', function() {
    this.collection.should.be.ok;
  });

  it('should enqueue ids', function() {
    this.collection.enqueue([1,2,3]);
    this.collection.enqueue(4);
    this.collection.enqueue([2,6]);
    this.collection.queue.should.eql([1,2,3,4,6]);
  });

  it('should dequeue ids', function() {
    this.collection.enqueue([1,2,3,4]);
    this.collection.dequeue(2);
    this.collection.dequeue([1,2,3]);
    this.collection.queue.should.eql([4]);
  });

  it('should turn an array of remote ids to an array of models', function() {
    this.collection.add(this.remote.test);
    var models = this.collection.getModelsByRemoteIds([2,4,6]);
    models.should.have.length(3);
    models[0].should.be.instanceof(Backbone.Model);
  });



});