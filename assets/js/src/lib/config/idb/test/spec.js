describe('IndexedDB Collection', function () {

  it('should be in a valid state', function () {
    var collection = new Backbone.IDBCollection();
    collection.should.be.ok;
    collection.db.store.should.be.instanceOf(window.IDBStore);
  });

  describe('Working with a Backbone Model', function () {

    before(function () {
      this.collection = new Backbone.IDBCollection([
        {
          firstname: 'John',
          lastname: 'Doe',
          age: 52,
          email: 'johndoe@example.com'
        }
      ]);
    });

    it('should save/create a Backbone Model', function (done) {
      var model = this.collection.at(0);
      var onSuccess = function(m, resp){
        // note: returns all attributes w/ id on create
        m.should.eql(model);
        m.isNew().should.be.false;
        resp.should.have.property('age', 52);
        done();
      };
      return model.save({}, {success: onSuccess});
    });

    it('should save/update an existing Backbone Model', function (done) {
      var model = this.collection.at(0);
      var onSuccess = function(m, resp){
        resp.should.have.property('age', 54);
        done();
      };
      model.save({age: 54}, {success: onSuccess});
    });

    it('should fetch/get an existing Backbone Model', function (done) {
      var model = this.collection.at(0);

      // change age in idb
      this.collection.db.store.put({ id: model.id, age: 53 });

      var onSuccess = function(m, resp){
        m.get('age').should.eql(53);
        done();
      };
      model.fetch({success: onSuccess});
    });

    it('should destroy/delete a model from the store', function (done) {
      var model = this.collection.at(0);
      var self = this;
      var onSuccess = function(m){
        m.should.eql(model);
        self.collection.db.store.count(function(count){
          count.should.eql(0);
          done();
        });
      };
      model.destroy({success: onSuccess});
    });

    after(function(done) {
      this.collection.db.store.clear(done);
    });

  });

  describe('Working with a Backbone Collection', function () {

    before(function () {
      this.collection = new Backbone.IDBCollection();
    });

    it('should create a new Backbone Model', function (done) {
      var onSuccess = function(){
        done();
      };
      this.collection.create({
        firstname: 'Jane',
        lastname: 'Smith',
        age: 35,
        email: 'janesmith@example.com'
      }, { success: onSuccess });
    });

    it('should batch save the collection', function (done) {
      this.collection.add([
        {
          firstname: 'John',
          lastname: 'Doe',
          age: 52,
          email: 'johndoe@example.com'
        }, {
          firstname: 'Joe',
          lastname: 'Bloggs',
          age: 28,
          email: 'joebloggs@example.com'
        }
      ]);
      this.collection.db.saveAll()
        .then(function(){
          done();
        });
    });

    it('should fetch the collection', function (done) {
      this.collection.reset();
      this.collection.length.should.eql(0);
      this.collection.fetch()
        .then(function(col){
          col.length.should.eql(3);
          done();
        });
    });

    after(function() {
      window.indexedDB.deleteDatabase('IDBWrapper-Store');
    });

  });

  describe('Working with a Dual Collection', function () {

    before(function () {
      var Model = Backbone.Model.extend({
        idAttribute: 'local_id',
        remoteIdAttribute: 'id'
      });
      var Collection = Backbone.IDBCollection.extend({
        model: Model,
        keyPath: 'local_id',
        mergeKeyPath: 'id'
      });
      this.collection = new Collection([], {
        keyPath: 'local_id',
        storeName: 'Dual',
        indexes: [
          {name: 'local_id', keyPath: 'local_id', unique: true},
          {name: 'id', keyPath: 'id', unique: true}
        ]
      });
    });

    it('should be in a valid state', function (done) {
      var onSuccess = function(model){
        model.isNew().should.be.false;
        model.id.should.be.a('number');
        done();
      };
      this.collection.create({
        id: 4,
        firstname: 'John',
        lastname: 'Doe',
        age: 52,
        email: 'johndoe@example.com'
      }, {
        success: onSuccess,
        // important to wait for local_id
        wait: true
      });
    });

    it('should merge model attributes', function (done) {
      var self = this;

      this.collection.db.getByAttribute({ id: 4 })
        .then(function(array){
          var obj = _.first(array);
          return self.collection.merge({
            id: 4,
            local_id: obj.local_id,
            firstname: 'John',
            lastname: 'Doe',
            age: 53,
            email: 'johndoe@example.com'
          });
        })
        .then(function(model){
          model.length.should.eql(1);
          model[0].get('age').should.eql(53);
          self.collection.length.should.eql(1);
          model[0].should.eql(self.collection.at(0));
          done();
        });

    });

    it('should merge model attributes on an arbitrary attribute', function (done) {
      var self = this;

      this.collection.merge(
        {
          id: 4,
          firstname: 'John',
          lastname: 'Doe',
          age: 54,
          email: 'johndoe@example.com'
        }
      )
        .then(function(model){
          model.length.should.eql(1);
          model[0].get('age').should.eql(54);
          self.collection.length.should.eql(1);
          model[0].should.eql(self.collection.at(0));
          done();
        });

    });

    it('should merge an array of model attributes on an arbitrary attribute', function (done) {
      var self = this;

      this.collection.merge(
        [{
          id: 4,
          firstname: 'John',
          lastname: 'Doe',
          age: 56,
          email: 'johndoe@example.com'
        },{
          id: 2,
          firstname: 'Jane',
          lastname: 'Smith',
          age: 35,
          email: 'janesmith@example.com'
        }]
      )
        .then(function(model){
          model.length.should.eql(2);
          self.collection.length.should.eql(2);
          var m = self.collection.findWhere({ id: 4 });
          m.get('age').should.eql(56);
          done();
        });

    });

    after(function() {
      window.indexedDB.deleteDatabase('IDBWrapper-Dual');
      //this.collection.db.store.clear(done);
    });

    describe('Handling errors', function () {

      before(function () {
        var Model = Backbone.Model.extend({
          idAttribute: 'local_id',
          remoteIdAttribute: 'id'
        });
        var Collection = Backbone.IDBCollection.extend({
          model: Model,
          keyPath: 'local_id',
          mergeKeyPath: 'id'
        });
        this.collection = new Collection([], {
          keyPath: 'local_id',
          storeName: 'Error',
          indexes: [
            {name: 'local_id', keyPath: 'local_id', unique: true},
            {name: 'id', keyPath: 'id', unique: true},
            {name: 'email', keyPath: 'email', unique: true}
          ]
        });
      });

      it('produce an error if there is a keyPath clash', function (done) {
        var col = this.collection;
        col.create({
          firstname: 'John',
          lastname: 'Doe',
          age: 52,
          email: 'johndoe@example.com'
        }, {
          success: function(){
            col.create({
              firstname: 'John',
              lastname: 'Schmo',
              email: 'johndoe@example.com'
            }, {
              success: function(model){
                done(model);
              },
              error: function(){
                done();
              }
            });
          }
        });

      });

      after(function() {
        window.indexedDB.deleteDatabase('IDBWrapper-Error');
        //this.collection.db.store.clear(done);
      });

    });

  });

});