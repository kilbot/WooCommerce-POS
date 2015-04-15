describe('lib/config/dual-collection.js', function () {

  var localCol = [
    {local_id: 100, id: 1},
    {local_id: 101, id: 2},
    {local_id: 102, id: 3}
  ];

  var remoteCol = {
    test: [ // note WC REST API returns collection name parent
      {id: 2, title: 'Example 1'},
      {id: 4, title: 'Example 2'},
      {id: 6, title: 'Example 2'}
    ]
  };

  var mergedCol = [
    {local_id: 100, id: 1},
    {local_id: 101, id: 2, title: 'Example 1'},
    {local_id: 102, id: 3},
    {local_id: 103, id: 4, title: 'Example 2'},
    {local_id: 104, id: 6, title: 'Example 3'}
  ]

  beforeEach(function () {
    this.idbSync = stub().resolves(localCol);
    this.ajaxSync = stub().resolves(remoteCol);
    var DualCollection = proxyquire('lib/config/dual-collection', {
      './collection': Backbone.Collection.extend({
        sync: this.ajaxSync
      }),
      './idb-collection': Backbone.Collection.extend({
        sync: this.idbSync,
        mergeRecords: stub().resolves(mergedCol)
      })
    });
    this.collection = new DualCollection();
    this.collection.name = 'test';
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

  it('??should turn an array of remote ids to an array of models', function() {
    this.collection.add(remoteCol.test);
    var models = this.collection.getModelsByRemoteIds([2,4,6]);
    models.should.have.length(3);
    models[0].should.be.instanceof(Backbone.Model);
  });

});