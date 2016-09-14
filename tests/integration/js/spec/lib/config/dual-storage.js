describe('POS.DualCollection', function () {

  beforeEach(function () {
    this.server = sinon.fakeServer.create();
    this.server.autoRespond = true;
    this.server.autoRespondAfter = 400;
  });

  it('should be in a valid state', function () {
    var collection = new POS.DualCollection();
    expect(collection).to.be.ok;
  });

  it('should create to local IndexedDB', function (done) {
    var collection = new POS.DualCollection();

    collection.create({foo: 'bar'}, {
      wait   : true,
      special: true,
      error  : done,
      success: function (model, response, options) {
        expect(model.isNew()).to.be.false;
        expect(model.id).to.equal(response.local_id);
        expect(model.get('_state')).to.equal(collection.states.create);
        expect(response.foo).to.equal('bar');
        expect(options.special).to.be.true;
        done();
      }
    });

  });

  it('should update to local IndexedDB', function (done) {
    var collection = new POS.DualCollection();

    collection.create({foo: 'bar'}, {
      //wait: true,
      success: function (model, response, options) {
        model.save({foo: 'baz'}, {
          special: true,
          error  : done,
          success: function (model, response, options) {
            expect(model.get('_state')).to.equal(collection.states.create);
            expect(model.get('foo')).to.equal('baz');
            expect(response.foo).to.equal('baz');
            expect(options.special).to.be.true;
            done();
          }
        });
      }
    });

  });

  it('should create to local and remote with \'remote: true\' option', function (done) {

    // mock server response
    var response = JSON.stringify({id: 1, foo: 'bar'});
    this.server.respondWith('POST', '/test', [200, {"Content-Type": "application/json"},
      response
    ]);

    var collection = new POS.DualCollection();
    collection.url = '/test';

    collection.create({foo: 'bar'}, {
      wait   : true,
      remote : true,
      special: true,
      error  : done,
      success: function (model, response, options) {
        expect(collection).to.have.length(1);
        expect(model.isNew()).to.be.false;
        expect(model.get('id')).to.equal(1);
        expect(model.get('_state')).to.be.undefined;
        // note!
        response._state = undefined;
        expect(response).eqls(model.attributes);
        expect(options.special).to.be.true;

        collection.db.count(function (count) {
            expect(count).equals(1);
          })
          .then(function () {
            return collection.db.get(model.id);
          })
          .then(function (response) {
            // note!
            response._state = undefined;
            expect(response).eqls(model.attributes);
            done();
          });
      }
    });

  });

  it('should update to local and remote with \'remote: true\' option', function (done) {

    // mock server response
    var response = JSON.stringify({id: 2, foo: 'baz'});
    this.server.respondWith('PUT', '/test/2/', [200, {"Content-Type": "application/json"},
      response
    ]);

    var collection = new POS.DualCollection();
    collection.url = '/test';

    collection.create({id: 2, foo: 'bar'}, {
      wait   : true,
      error  : done,
      success: function (model, response, options) {
        expect(model.isNew()).to.be.false;
        expect(model.get('_state')).to.equal(collection.states.update);

        model.save({foo: 'baz'}, {
          remote : true,
          wait   : true,
          special: true,
          error  : done,
          success: function (model, response, options) {
            expect(collection).to.have.length(1);
            expect(model.get('_state')).to.be.undefined;
            expect(model.get('foo')).to.equal('baz');

            // note!
            response._state = undefined;
            expect(response).to.eql(model.attributes);
            expect(options.special).to.be.true;

            collection.db.count(function (count) {
                expect(count).equals(1);
              })
              .then(function () {
                return collection.db.get(model.id);
              })
              .then(function (response) {
                // note!
                response._state = undefined;
                expect(response).to.eql(model.attributes);
                done();
              })
              .catch(done);
          }
        });
      }
    });

  });

  it('model should be compatible with nested APIs', function (done) {

    // mock server response
    var response = JSON.stringify({test: {id: 1, foo: 'bar'}});
    var server = this.server;
    server.respondWith('POST', '/test', [200, {"Content-Type": "application/json"},
      response
    ]);

    var collection = new POS.DualCollection();
    collection.url = '/test';

    var model = collection.add({foo: 'bar'});
    model.name = 'test';
    model.save({}, {
      remote : true,
      special: true,
      error  : done,
      success: function (m, response, options) {
        expect(m).eqls(model);
        expect(m.get('id')).to.equal(1);

        //
        var request = server.requests[0];
        var postData = JSON.parse(request.requestBody);
        expect(postData).eqls({test: {foo: 'bar'}});

        // note: response is coming from idb not ajax
        // expect( response ).eqls( ajaxResponse );

        expect(options.special).to.be.true;
        done();
      }
    });

  });

  it('should fetch and merge a remote collection', function (done) {

    // mock server response
    var response = JSON.stringify({
      nested: [
        {id: 1, foo: 'bar'},
        {id: 3, foo: 'baz'},
        {id: 4, foo: 'boo'}
      ]
    });
    this.server.respondWith('GET', /^(\/test)(\/?\?{0}|\/?\?{1}.*)$/, [200, {"Content-Type": "application/json"},
      response
    ]);

    var collection = new POS.DualCollection();
    collection.url = '/test';
    collection.name = 'nested';

    collection.save([
        {id: 1, foo: 'bar'},
        {id: 2, foo: 'baz'},
        {id: 3, foo: 'boo'}
      ])
      .then(function () {
        expect(collection).to.have.length(3);
        return collection.fetch({
          remote : true,
          remove : false,
          special: true,
          error  : done,
          success: function (collection, response, options) {
            expect(response).to.have.length(3);
            expect(collection).to.have.length(4);
            expect(collection.map('local_id')).to.not.be.empty;
            expect(collection.map('foo')).eqls(['bar', 'baz', 'baz', 'boo']);
            expect(options.special).to.be.true;
            done();
          }
        });
      })
      .catch(done);

  });

  it('should fetch all remote ids', function (done) {

    // mock server response
    var response = JSON.stringify({nested: [{id: 1}, {id: 2}, {id: 3}]});
    this.server.respondWith('GET', /^\/test\/ids\?.*$/, [200, {"Content-Type": "application/json"},
      response
    ]);

    var collection = new POS.DualCollection();
    collection.url = '/test';
    collection.name = 'nested';

    collection.fetchRemoteIds()
      .then(function (response) {
        expect(response).to.have.length(3);
        expect(collection).to.have.length(0);

        var read = collection.states.read;
        _.each(response, function (model) {
          expect(model.local_id).not.to.be.undefined;
          expect(model._state).eqls(read);
        });

        done();
      })
      .catch(done);

  });

  it('should fetch and merge all remote ids', function (done) {

    // mock server response
    var response = JSON.stringify({nested: [{id: 1}, {id: 2}, {id: 3}]});
    this.server.respondWith('GET', /^\/test\/ids\?.*$/, [200, {"Content-Type": "application/json"},
      response
    ]);

    var collection = new POS.DualCollection();
    collection.url = '/test';
    collection.name = 'nested';

    collection.save([
        {id: 1, foo: 'bar'},
        {id: 2}
      ])
      .then(function () {
        return collection.fetchRemoteIds();
      })
      .then(function (response) {
        expect(response).to.have.length(3);

        var read = collection.states.read;
        expect(_.map(response, '_state')).eqls([undefined, undefined, read]);

        var model = _.find(response, {id: 1});
        expect(model.foo).equals('bar');

        done();
      })
      .catch(done);

  });

  it('should fetch updated ids from the server', function (done) {

    // mock server response
    var response = JSON.stringify({
      nested: [
        {id: 2, updated_at: '2016-01-14T13:15:04Z'},
        {id: 4, updated_at: '2016-01-12T13:15:04Z'}
      ]
    });
    this.server.respondWith('GET', /^\/test\/ids\?.*$/, [200, {"Content-Type": "application/json"},
      response
    ]);

    var collection = new POS.DualCollection();
    collection.url = '/test';
    collection.name = 'nested';

    collection.save([
      {id: 1, updated_at: '2016-01-04T13:15:04Z', foo: 'bar'},
      {id: 2, updated_at: '2016-01-11T13:15:04Z'},
      {id: 3, updated_at: '2015-01-04T13:15:04Z'}
    ])
    .then(function (response) {
      expect(response).to.have.length(3);
      return collection.fetchUpdatedIds();
    })
    .then(function (response) {
      expect(response).to.have.length(2);
      expect(collection).to.have.length(3);

      var read = collection.states.read;
      expect(_.map(response, '_state')).eqls([read, read]);

      done();
    })
    .catch(done);

  });

  it('should fetch read delayed models', function(done){

    // mock server response
    var response = JSON.stringify({
      nested: [
        {id: 2, foo: 'bam'},
        {id: 3, foo: 'bap'}
      ]
    });
    this.server.respondWith('GET', /^\/test\?.*$/, [200, {"Content-Type": "application/json"},
      response
    ]);

    // tools for checking the url query params
    var server = this.server;
    var parse = function(url){
      var parser = /([^=?&]+)=([^&]*)/g
        , result = {}
        , part;

      for (;
        part = parser.exec(url);
        result[decodeURIComponent(part[1])] = decodeURIComponent(part[2])
      );

      return result;
    };

    var collection = new POS.DualCollection();
    collection.url = '/test';
    collection.name = 'nested';

    collection.save([
      {id: 1, foo: 'bar'},
      {id: 2, foo: 'baz', _state: 'READ_FAILED'},
      {id: 3, foo: 'boo', _state: 'READ_FAILED'}
    ], { set: false })
    .then(function (response) {
      expect(response).to.have.length(3);
      collection.fetch({
        special: true,
        success: function(collection, response, options){
          var query = parse( server.requests[0].url );
          expect(query['filter[in]']).eqls('2,3');

          expect(response).to.have.length(3);
          expect(collection).to.have.length(3);
          expect(collection.map('foo')).eqls(['bar', 'bam', 'bap']);
          expect(collection.map('_state')).eqls([undefined, undefined, undefined]);
          expect(options.special).to.be.true;

          done();
        }
      });
    })
    .catch(done);

  });

  it('should return the total number of records for local fetch', function(done){

    var collection = new POS.DualCollection();

    collection.save([
      {id: 1, foo: 'bar'},
      {id: 2, foo: 'baz'},
      {id: 3, foo: 'boo'}
    ], { set: false })
    .then(function (response) {
      expect(response).to.have.length(3);
      collection.fetch({
        special: true,
        error: done,
        success: function(collection, response, options){
          expect(_.get(options, ['idb', 'total'])).eqls(3);
          done();
        }
      });
    })
    .catch(done);
  });

  it('should patch a model to the remote server', function(done){

    // mock server response
    var response = JSON.stringify({ nest: { id: 1, foo: 'baz', boo: 'bat' } });
    var server = this.server;
    server.respondWith('PUT', '/test/1/', [200, {"Content-Type": "application/json"},
      response
    ]);

    var Model = POS.DualModel.extend({
      name: 'nest'
    });

    //
    var collection = new POS.DualCollection();
    collection.url = '/test';
    collection.model = Model;

    collection.create({id: 1, foo: 'bar', boo: 'bat'}, {
      wait: true,
      error: done,
      success: function(model, response, options){
        model.save({ foo: 'baz' }, {
          remote: true,
          patch: true,
          special: true,
          error: done,
          success: function(model, response, options){
            var request = server.requests[0];
            var postData = JSON.parse(request.requestBody);
            expect(postData).eqls({ nest: {foo: 'baz'} });

            expect(model.get('foo')).eqls('baz');
            expect(model.get('_state')).to.be.undefined;
            expect(options.special).to.be.true;

            done();
          }
        })
        .catch(done);
      }
    });

  });

  //
  //it('should remove garbage', function( done ){
  //
  //  // mock server response
  //  var response = JSON.stringify({ nested: [ { id: 1 }, { id: 4 } ] });
  //  this.server.respondWith( 'GET', /^\/test\/ids\?.*$/, [200, {"Content-Type": "application/json"},
  //    response
  //  ]);
  //
  //  var collection = new POS.DualCollection();
  //  collection.url = '/test';
  //  collection.name = 'nested';
  //
  //  collection.saveBatch([
  //    { id: 1 },
  //    { id: 2, _state: 'UPDATE_FAILED' },
  //    { id: 3 },
  //    { }
  //  ]).then(function(){
  //    expect( collection ).to.have.length(4);
  //
  //    collection.fetchRemoteIds(null, {
  //      remove: true,
  //      error: done,
  //      success: function(){
  //        expect( collection ).to.have.length( 3 );
  //        var create = collection.states.create;
  //        var read = collection.states.read;
  //        expect( collection.map('_state') ).eqls([ undefined, create, read ]);
  //        done();
  //      }
  //    });
  //
  //  });
  //
  //});

  /**
   * Clear test database
   */
  afterEach(function (done) {
    this.server.restore();
    var collection = new POS.DualCollection();
    collection.destroy().then(done);
  });

  /**
   * Delete test database
   */
  after(function () {
    var collection = new POS.DualCollection();
    window.indexedDB.deleteDatabase(collection.db.opts.dbName);
  });

});