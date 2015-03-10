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

    this.remote = [
      {id: 1},
      {id: 3},
      {id: 4}
    ];
  });

  it('should be in a valid state', function() {
    expect(this.collection).to.be.ok;
  });

  describe('firstSync()', function () {

    it('should fetch records from local IndexedDB', function() {
      var fetch = stub(this.collection, 'fetch');
      this.collection.firstSync();
      expect(fetch).to.have.been.calledOnce;
    });

    it('should start audit after successful local fetch', function() {
      var fetch = stub(this.collection, 'fetch').yieldsTo('success');
      var audit = stub(this.collection, 'auditRecords');
      var event = this.collection.eventNames.LOCAL_SYNC_SUCCESS;
      var func = stub();
      this.collection.on(event, func);

      this.collection.firstSync();

      expect(audit).to.have.been.calledOnce;
      expect(func).to.have.been.calledOnce;
    });

    it('should radio "error" channel on error', function() {
      var fetch = stub(this.collection, 'fetch').yieldsTo('error');
      var radio = stub(Backbone.Radio, 'command');
      var event = this.collection.eventNames.LOCAL_SYNC_FAIL;
      var func = stub();
      this.collection.on(event, func);

      this.collection.firstSync();

      expect(radio).to.have.been.calledWith('error');
      expect(func).to.have.been.calledOnce;
    });

  });

  describe('getRemoteIds()', function () {

    before(function(){
      var dfd = $.Deferred()
      stub($, 'ajax').returns(dfd);
      dfd.resolve('foo');
    });

    it('should get ids from server', function() {
      var dfd = this.collection.getRemoteIds();
      expect($.ajax).to.have.been.calledOnce;
      dfd.done(function(ids){
        expect(ids).equals('foo');
      });
    });

    after(function(){
      $.ajax.restore();
    });

  });

  //describe('auditRecords()', function () {
  //
  //  it('compare the local collection to the server collection', function() {
  //
  //    //var local = [
  //    //  {remoteId: 1},
  //    //  {remoteId: 2},
  //    //  {remoteId: 3}
  //    //];
  //    //
  //    //var remote = [
  //    //  {id: 1},
  //    //  {id: 3},
  //    //  {id: 4}
  //    //]
  //    //
  //    //this.collection.add(local);
  //    //this.collection.auditRecords();
  //    //expect(this.collection.pluck('remoteId')).equals([1,3,4]);
  //
  //  });
  //
  //});

});