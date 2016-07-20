var assert = chai.assert;

var mockData = [
  { a: 1, b: 2, c:'a' },
  { a: 1, b: 3, c:'b' },
  { a: 1, b: 3, c:'c' },
  { a: 2, b: 2, c:'20' },
  { a: 2, b: 2, c:'3' }
];

var resetData = [
  { a: 1, b: 2, c:'a' },
  { a: 1, b: 3, c:'b' },
  { a: 1, b: 3, c:'c' },
  { a: 2, b: 2, c:'3' }
];

var sorted, superset;

describe('sorted collection', function() {

  beforeEach(function() {
    superset = new Backbone.Collection(mockData);
    sorted = new SortedCollection(superset);
  });

  describe('unsorted', function() {

    it('should add things to the correct index', function() {
      var model = new Backbone.Model({ a: 1, b: 2, c: 'z' });

      superset.add(model, { at: 3 });
      assert(sorted.at(3) === model);
    });

  });

  describe('getting access to the original superset', function() {

    it('should return the original superset', function() {
      assert(sorted.superset() === superset);
    });

  });

  describe('sorting by key', function() {

    beforeEach(function() {
      sorted.setSort('b');
    });

    it('should be ordered', function() {
      assert(sorted.at(0).get('b') === 2);
      assert(sorted.at(1).get('b') === 2);
      assert(sorted.at(2).get('b') === 2);
      assert(sorted.at(3).get('b') === 3);
      assert(sorted.at(4).get('b') === 3);
    });

    it('should be able to be reversed', function() {
      sorted.reverseSort();
      assert(sorted.at(0).get('b') === 3);
      assert(sorted.at(1).get('b') === 3);
      assert(sorted.at(2).get('b') === 2);
      assert(sorted.at(3).get('b') === 2);
      assert(sorted.at(4).get('b') === 2);
    });

    it('should update to a new key', function() {
      sorted.setSort('c');
      assert(sorted.at(0).get('c') === '20');
      assert(sorted.at(1).get('c') === '3');
      assert(sorted.at(2).get('c') === 'a');
      assert(sorted.at(3).get('c') === 'b');
      assert(sorted.at(4).get('c') === 'c');

      sorted.reverseSort();
      assert(sorted.at(0).get('c') === 'c');
      assert(sorted.at(1).get('c') === 'b');
      assert(sorted.at(2).get('c') === 'a');
      assert(sorted.at(3).get('c') === '3');
      assert(sorted.at(4).get('c') === '20');
    });

    it('should revert to normal when called with no args', function() {
      sorted.setSort();
      assert(sorted.at(0) === superset.at(0));
      assert(sorted.at(1) === superset.at(1));
      assert(sorted.at(2) === superset.at(2));
      assert(sorted.at(3) === superset.at(3));
      assert(sorted.at(4) === superset.at(4));
    });

    it('should maintain the sorting when rest', function() {
      sorted.setSort('c');
      superset.reset(resetData);
      assert(sorted.at(0) === superset.at(3));
      assert(sorted.at(1) === superset.at(0));
      assert(sorted.at(2) === superset.at(1));
      assert(sorted.at(3) === superset.at(2));
    });

  });

  describe('sorting by key desc', function() {

    beforeEach(function() {
      sorted.setSort('b', 'desc');
    });

    it('should be ordered', function() {
      assert(sorted.at(0).get('b') === 3);
      assert(sorted.at(1).get('b') === 3);
      assert(sorted.at(2).get('b') === 2);
      assert(sorted.at(3).get('b') === 2);
      assert(sorted.at(4).get('b') === 2);
    });

    it('should be able to be reversed', function() {
      sorted.reverseSort();
      assert(sorted.at(0).get('b') === 2);
      assert(sorted.at(1).get('b') === 2);
      assert(sorted.at(2).get('b') === 2);
      assert(sorted.at(3).get('b') === 3);
      assert(sorted.at(4).get('b') === 3);
    });

    it('should update to a new key', function() {
      sorted.setSort('c', 'desc');
      assert(sorted.at(4).get('c') === '20');
      assert(sorted.at(3).get('c') === '3');
      assert(sorted.at(2).get('c') === 'a');
      assert(sorted.at(1).get('c') === 'b');
      assert(sorted.at(0).get('c') === 'c');

      sorted.reverseSort();
      assert(sorted.at(4).get('c') === 'c');
      assert(sorted.at(3).get('c') === 'b');
      assert(sorted.at(2).get('c') === 'a');
      assert(sorted.at(1).get('c') === '3');
      assert(sorted.at(0).get('c') === '20');
    });

    it('should revert to normal when called with no args', function() {
      sorted.setSort();
      assert(sorted.at(0) === superset.at(0));
      assert(sorted.at(1) === superset.at(1));
      assert(sorted.at(2) === superset.at(2));
      assert(sorted.at(3) === superset.at(3));
      assert(sorted.at(4) === superset.at(4));
    });

    it('should maintain the sorting when rest', function() {
      sorted.setSort('c', 'desc');
      superset.reset(resetData);
      assert(sorted.at(3) === superset.at(3));
      assert(sorted.at(2) === superset.at(0));
      assert(sorted.at(1) === superset.at(1));
      assert(sorted.at(0) === superset.at(2));
    });

  });

  describe('sorting by function (Underscore.js sortBy sort, arity is 1)', function() {

    beforeEach(function() {
      sorted.setSort(function(model) {
        return model.get('b');
      });
    });

    it('should be ordered', function() {
      assert(sorted.at(0).get('b') === 2);
      assert(sorted.at(1).get('b') === 2);
      assert(sorted.at(2).get('b') === 2);
      assert(sorted.at(3).get('b') === 3);
      assert(sorted.at(4).get('b') === 3);
    });

    it('should be able to be reversed', function() {
      sorted.reverseSort();
      assert(sorted.at(0).get('b') === 3);
      assert(sorted.at(1).get('b') === 3);
      assert(sorted.at(2).get('b') === 2);
      assert(sorted.at(3).get('b') === 2);
      assert(sorted.at(4).get('b') === 2);
    });

    it('should update to a new key', function() {
      sorted.setSort(function(model) {
        return model.get('c');
      });
      assert(sorted.at(0).get('c') === '20');
      assert(sorted.at(1).get('c') === '3');
      assert(sorted.at(2).get('c') === 'a');
      assert(sorted.at(3).get('c') === 'b');
      assert(sorted.at(4).get('c') === 'c');

      sorted.reverseSort();
      assert(sorted.at(0).get('c') === 'c');
      assert(sorted.at(1).get('c') === 'b');
      assert(sorted.at(2).get('c') === 'a');
      assert(sorted.at(3).get('c') === '3');
      assert(sorted.at(4).get('c') === '20');
    });

    it('should revert to normal when called with no args', function() {
      sorted.setSort();
      assert(sorted.at(0) === superset.at(0));
      assert(sorted.at(1) === superset.at(1));
      assert(sorted.at(2) === superset.at(2));
      assert(sorted.at(3) === superset.at(3));
      assert(sorted.at(4) === superset.at(4));
    });

    it('should maintain the sorting when rest', function() {
      sorted.setSort(function(model) {
        return model.get('c');
      });
      superset.reset(resetData);
      assert(sorted.at(0) === superset.at(3));
      assert(sorted.at(1) === superset.at(0));
      assert(sorted.at(2) === superset.at(1));
      assert(sorted.at(3) === superset.at(2));
    });

  });

  describe('sorting by function (classic JS Array sort, arity is 2)', function() {

    beforeEach(function() {
      sorted.setSort(function(a,b) {
        return a.get('b') > b.get('b') ? 1 : -1;
      });
    });

    it('should be ordered', function() {
      assert(sorted.at(0).get('b') === 2);
      assert(sorted.at(1).get('b') === 2);
      assert(sorted.at(2).get('b') === 2);
      assert(sorted.at(3).get('b') === 3);
      assert(sorted.at(4).get('b') === 3);
    });

    it('should be able to be reversed', function() {
      sorted.reverseSort();
      assert(sorted.at(0).get('b') === 3);
      assert(sorted.at(1).get('b') === 3);
      assert(sorted.at(2).get('b') === 2);
      assert(sorted.at(3).get('b') === 2);
      assert(sorted.at(4).get('b') === 2);
    });

    it('should update to a new key', function() {
      sorted.setSort(function(model) {
        return model.get('c');
      });
      assert(sorted.at(0).get('c') === '20');
      assert(sorted.at(1).get('c') === '3');
      assert(sorted.at(2).get('c') === 'a');
      assert(sorted.at(3).get('c') === 'b');
      assert(sorted.at(4).get('c') === 'c');

      sorted.reverseSort();
      assert(sorted.at(0).get('c') === 'c');
      assert(sorted.at(1).get('c') === 'b');
      assert(sorted.at(2).get('c') === 'a');
      assert(sorted.at(3).get('c') === '3');
      assert(sorted.at(4).get('c') === '20');
    });

    it('should revert to normal when called with no args', function() {
      sorted.setSort();
      assert(sorted.at(0) === superset.at(0));
      assert(sorted.at(1) === superset.at(1));
      assert(sorted.at(2) === superset.at(2));
      assert(sorted.at(3) === superset.at(3));
      assert(sorted.at(4) === superset.at(4));
    });

    it('should maintain the sorting when rest', function() {
      sorted.setSort(function(model) {
        return model.get('c');
      });
      superset.reset(resetData);
      assert(sorted.at(0) === superset.at(3));
      assert(sorted.at(1) === superset.at(0));
      assert(sorted.at(2) === superset.at(1));
      assert(sorted.at(3) === superset.at(2));
    });

  });


  describe('sorting by function desc', function() {

    beforeEach(function() {
      sorted.setSort(function(model) {
        return model.get('b');
      }, 'desc');
    });

    it('should be ordered', function() {
      assert(sorted.at(0).get('b') === 3);
      assert(sorted.at(1).get('b') === 3);
      assert(sorted.at(2).get('b') === 2);
      assert(sorted.at(3).get('b') === 2);
      assert(sorted.at(4).get('b') === 2);
    });

    it('should be able to be reversed', function() {
      sorted.reverseSort();
      assert(sorted.at(0).get('b') === 2);
      assert(sorted.at(1).get('b') === 2);
      assert(sorted.at(2).get('b') === 2);
      assert(sorted.at(3).get('b') === 3);
      assert(sorted.at(4).get('b') === 3);
    });

    it('should update to a new key', function() {
      sorted.setSort(function(model) {
        return model.get('c');
      }, 'desc');
      assert(sorted.at(4).get('c') === '20');
      assert(sorted.at(3).get('c') === '3');
      assert(sorted.at(2).get('c') === 'a');
      assert(sorted.at(1).get('c') === 'b');
      assert(sorted.at(0).get('c') === 'c');

      sorted.reverseSort();
      assert(sorted.at(4).get('c') === 'c');
      assert(sorted.at(3).get('c') === 'b');
      assert(sorted.at(2).get('c') === 'a');
      assert(sorted.at(1).get('c') === '3');
      assert(sorted.at(0).get('c') === '20');
    });

    it('should revert to normal when called with no args', function() {
      sorted.setSort();
      assert(sorted.at(0) === superset.at(0));
      assert(sorted.at(1) === superset.at(1));
      assert(sorted.at(2) === superset.at(2));
      assert(sorted.at(3) === superset.at(3));
      assert(sorted.at(4) === superset.at(4));
    });

    it('should revert to normal when removeSort is called', function() {
      sorted.removeSort();
      assert(sorted.at(0) === superset.at(0));
      assert(sorted.at(1) === superset.at(1));
      assert(sorted.at(2) === superset.at(2));
      assert(sorted.at(3) === superset.at(3));
      assert(sorted.at(4) === superset.at(4));
    });

    it('should maintain the sorting when rest', function() {
      sorted.setSort(function(model) {
        return model.get('c');
      }, 'desc');
      superset.reset(resetData);
      assert(sorted.at(3) === superset.at(3));
      assert(sorted.at(2) === superset.at(0));
      assert(sorted.at(1) === superset.at(1));
      assert(sorted.at(0) === superset.at(2));
    });

  });

  describe('changing a model in the superset', function() {

    it('should update the location based on the sort', function() {
      sorted.setSort('b');

      var firstModel = sorted.first();
      assert(firstModel.get('b') === 2);

      firstModel.set({ b: 100 });

      assert(sorted.contains(firstModel));
      assert(firstModel !== sorted.first());
      assert(firstModel === sorted.last());
    });

    it('should not remove and add it back when the location doesnt change', function() {
      sorted.removeSort();

      var added = false;
      var removed = false;

      sorted.on('remove', function(eventName) {
        removed = true;
      });

      sorted.on('add', function(eventName) {
        added = true;
      });

      var firstModel = sorted.first();

      firstModel.set({ b: 100 });

      assert(added === false);
      assert(removed === false);
    });

    it('should not remove and add it back when the location doesnt change', function() {
      var added = false;
      var removed = false;

      sorted.on('remove', function(eventName) {
        removed = true;
      });

      sorted.on('add', function(eventName) {
        added = true;
      });

      var firstModel = sorted.first();

      firstModel.set({ foo: 100 });

      assert(added === false);
      assert(removed === false);
    });

  });

  describe('removing a model in the superset', function() {

    it('should be removed from the sorted set', function() {
      sorted.setSort('b');

      var firstModel = superset.first();
      superset.remove(firstModel);

      assert(!sorted.contains(firstModel));
    });

  });

  describe('adding a model to the superset', function() {

    it('should be added at the correct spot', function() {
      //sorted.setSort('b');
      sorted.setSort(function(a,b) {
        return a.get('b') > b.get('b') ? 1 : -1;
      });


      var model = new Backbone.Model({ a: 1, b: 2.5, c:'100' });
      superset.add(model);


      assert(sorted.at(3) === model);
    });

    it('should be added at the correct spot when desc', function() {
      var model = new Backbone.Model({ a: 1, b: 1.5, c:'100' });
      var model2 = new Backbone.Model({ a: 1.5, b: 2, c: '9001' });

      sorted.setSort('b', 'desc');
      superset.add(model);
      assert(sorted.at(5) === model);

      sorted.setSort('a', 'desc');
      superset.add(model2);
      assert(sorted.at(2) === model2);
    });

  });

  describe('Pipe events from the subset to the container', function() {

    it('add event', function() {
      var model = new Backbone.Model({ a: 2 });

      var called = false;
      sorted.on('add', function(m, collection) {
        assert(m === model);
        assert(collection === sorted);
        called = true;
      });

      superset.add(model);

      assert(called);
    });

    it('remove event', function() {
      var model = superset.first();

      var called = false;
      sorted.on('remove', function(m, collection) {
        assert(m === model);
        assert(collection === sorted);
        called = true;
      });

      superset.remove(model);

      assert(called);
    });

    it('reset event', function() {
      var called = false;
      sorted.on('reset', function(collection) {
        assert(collection === sorted);
        called = true;
      });

      superset.reset(resetData);

      assert(called);
    });

    it('model change event', function() {
      var model = superset.first();

      var called = false;
      sorted.on('change', function(m) {
        assert(m === model);
        called = true;
      });

      model.set({ a: 100 });

      assert(called);
    });

    it('model change event: specify key', function() {
      var model = superset.first();

      var called = false;
      sorted.on('change:a', function(m) {
        assert(m === model);
        called = true;
      });

      model.set({ a: 100 });

      assert(called);
    });

  });

  describe('sort-specific events', function() {

    it('sorted:add should fire when adding a sort', function() {
      var called = false;

      sorted.on('sorted:add', function() {
        called = true;
      });

      sorted.setSort('c');
      assert(called);
    });

    it('sorted:remove should fire when removing a sort', function() {
      var called = false;

      sorted.on('sorted:remove', function() {
        called = true;
      });

      sorted.setSort('c');
      sorted.removeSort();

      assert(called);
    });

  });

  describe('destroying the proxy', function() {

    it('should fire an event on destruction', function() {
      var called = false;
      sorted.on('sorted:destroy', function() {
        called = true;
      });

      sorted.destroy();
      assert(called);
    });

    it('should fire no other events on destruction', function() {
      var called = false;
      sorted.on('all', function(e) {
        if (e !== 'sorted:destroy') {
          called = true;
        }
      });

      sorted.destroy();
      assert(!called);
    });

    it('should have 0 length afterward', function() {
      sorted.destroy();
      assert(sorted.length === 0);
    });

    it('should not repond to changes in the superset', function() {
      sorted.destroy();
      superset.add({ n: 9000 });

      assert(sorted.length === 0);
    });

    it('should emit no events after', function() {
      sorted.destroy();

      var called = false;
      sorted.on('all', function(e) {
        called = true;
      });

      superset.add({ n: 9000 });
      superset.remove(superset.first());
      superset.reset([{ n: 1 }]);

      assert(!called);
    });

  });

});
