var assert = chai.assert;
chai.should();

describe('PaginatedCollection', function() {

  var superset, paginated;
  var mockData = _.map(_.range(100), function(i) { return { n: i }; });

  describe('empty superset', function() {

    beforeEach(function() {
      superset = new Backbone.Collection([]);
      paginated = new PaginatedCollection(superset);
    });

    it('should have 0 pages', function() {
      assert(paginated.getNumPages() === 0);
    });

    it('should have 0 length', function() {
      assert(paginated.length === 0);
    });

    it('should not have a next or previous page', function() {
      assert(!paginated.hasNextPage());
      assert(!paginated.hasPrevPage());
    });

  });

  describe('empty superset with perPage', function() {

    beforeEach(function() {
      superset = new Backbone.Collection([]);
      paginated = new PaginatedCollection(superset, { perPage: 10 });
    });

    it('should be on the 0th page', function() {
      assert(paginated.getPage() === 0);
    });

    it('should have 0 pages', function() {
      assert(paginated.getNumPages() === 0);
    });

    it('should have 0 length', function() {
      assert(paginated.length === 0);
    });

    it('should not have a next or previous page', function() {
      assert(!paginated.hasNextPage());
      assert(!paginated.hasPrevPage());
    });

    it("changing the page doesn't change the page", function() {
      paginated.nextPage();
      assert(paginated.getPage() === 0);

      paginated.prevPage();
      assert(paginated.getPage() === 0);

      paginated.movePage(2);
      assert(paginated.getPage() === 0);

      paginated.movePage(-2);
      assert(paginated.getPage() === 0);

      paginated.firstPage();
      assert(paginated.getPage() === 0);

      paginated.lastPage();
      assert(paginated.getPage() === 0);
    });

    it('adding a model should increase the length', function() {
      assert(paginated.length === 0);

      superset.add({ n: 1 });
      assert(paginated.length === 1);

      superset.add({ n: 2 });
      assert(paginated.length === 2);
    });

  });

  describe('With no options', function() {

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset);
    });

    it('perPage should be the length of the superset', function() {
      assert(paginated.getPerPage() === superset.length);
    });

    it('should have the same length as the original set by default', function() {
      assert(paginated.length === superset.length);
    });

    it('and maintain that length as models are added / removed', function() {
      var lotsaData = _.map(_.range(10000), function(i) { return { n: i }; });

      superset.reset(lotsaData);
      assert(paginated.length === superset.length);
      assert(paginated.getPerPage() === superset.length);

      superset.add(new Backbone.Model({ n: 10000000 }));
      assert(paginated.length === superset.length);
      assert(paginated.getPerPage() === superset.length);

      superset.remove(superset.last());
      assert(paginated.length === superset.length);
      assert(paginated.getPerPage() === superset.length);
    });

    it('should be on page 0', function() {
      assert(paginated.getPage() === 0);
    });

    it('should have 1 pages', function() {
      assert(paginated.getNumPages() === 1);
    });

    it("shouldn't have a next or prev page", function() {
      assert(!paginated.hasNextPage());
      assert(!paginated.hasPrevPage());
    });

    it('should update when the original collection is sorted', function() {
      var newData = _.map(_.range(100, 0, -1), function(i) { return { n: i }; });

      // Reset the superset
      superset.reset(newData);

      // The paginated collection should hold the new data
      assert(_.isEqual(paginated.toJSON(), newData));

      // Let's reverse the sort
      superset.comparator = 'n';
      superset.sort();

      assert(_.isEqual(paginated.pluck('n'), _.range(1, 101)));
    });

  });

  describe('With perPage', function() {

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });
    });

    it('perPage should be 15', function() {
      assert(paginated.length === 15);
      assert(paginated.getPerPage() === 15);
    });

    it('should be on page 0', function() {
      assert(paginated.getPage() === 0);
    });

    it('should have 7 pages', function() {
      assert(paginated.getNumPages() === 7);
    });

    it('first page should have items 0-14', function() {
      var pageValues = paginated.pluck('n');
      assert(_.isEqual(pageValues, _.range(15)));
    });

    it('last page should have items 90-99', function() {
      paginated.setPage(6);
      var pageValues = paginated.pluck('n');
      assert(_.isEqual(pageValues, _.range(90, 100)));
    });

    it('page count should be correct when divided evenly', function() {
      // 100 / 10 = 10 -> 10 pages
      paginated.setPerPage(10);
      assert(paginated.getNumPages() === 10);

      // 100 / 4  = 25 -> 25 pages
      paginated.setPerPage(4);
      assert(paginated.getNumPages() === 25);
    });

    it('page count should be correct when divided un-evenly', function() {
      assert(paginated.getNumPages() === 7);

      // N.B. We are treating 0 as a page so we must round down.
      // 100 / 11 + 1 = 10.090909090909092 -> 10 pages
      paginated.setPerPage(11);
      assert(paginated.getNumPages() === 10);

      // 100 / 3 + 1 = 33.333333333333336 + 1 -> 34 pages
      paginated.setPerPage(3);
      assert(paginated.getNumPages() === 34);
    });

    it('should not have a page prior to the first', function() {
      paginated.setPage(0);
      assert(!paginated.hasPrevPage());
      assert(paginated.hasNextPage());

      // Trying to go back should have no effect
      paginated.prevPage();
      assert(!paginated.hasPrevPage());
      assert(paginated.getPage() === 0);
    });

    it('should not have another page after page 6', function() {
      paginated.setPage(6);
      assert(!paginated.hasNextPage());
      assert(paginated.hasPrevPage());

      // Going to the next page should have no effect since there
      // is no next page.
      paginated.nextPage();
      assert(paginated.getPage() === 6);
      assert(!paginated.hasNextPage());
    });

    it('should be able to go back and forth between pages', function() {
      paginated.setPage(0);
      assert(paginated.getPage() === 0);

      paginated.nextPage();
      assert(paginated.getPage() === 1);

      paginated.prevPage();
      assert(paginated.getPage() === 0);
    });

    it('should be able to use movePage', function() {
      paginated.setPage(0);
      assert(paginated.getPage() === 0);

      paginated.movePage(2);
      assert(paginated.getPage() === 2);

      paginated.movePage(-2);
      assert(paginated.getPage() === 0);
    });

    it('moving beyond the bounds with movePage puts you at the end', function() {
      paginated.setPage(0);
      assert(paginated.getPage() === 0);

      paginated.movePage(100);
      assert(paginated.getPage() === 6);

      paginated.movePage(-100);
      assert(paginated.getPage() === 0);
    });

    it('should be able to jump to the first page', function() {
      paginated.setPage(3);

      paginated.firstPage();

      assert(paginated.getPage() === 0);
      assert(paginated.hasNextPage());
      assert(!paginated.hasPrevPage());
    });

    it('should be able to jump to the last page', function() {
      paginated.setPage(3);

      paginated.lastPage();

      assert(paginated.getPage() === 6);
      assert(!paginated.hasNextPage());
      assert(paginated.hasPrevPage());
    });

    it('`removePagination` should remove all pagination settings', function() {
      paginated.removePagination();

      assert(paginated.getPerPage() === superset.length);
      assert(paginated.getPage() === 0);
      assert(paginated.getNumPages() === 1);
      assert(paginated.length === superset.length);
    });


    it('should update when the original collection is sorted', function() {
      var newData = _.map(_.range(100, 0, -1), function(i) { return { n: i }; });

      // Reset the superset
      superset.reset(newData);

      // The paginated collection should have models 100 - 86
      assert(_.isEqual(paginated.pluck('n'), _.range(100, 85, -1)));

      // Let's reverse the sort
      superset.comparator = 'n';
      superset.sort();

      // The paginated collection should have models 1 - 15
      assert(_.isEqual(paginated.pluck('n'), _.range(1, 16)));
    });

  });

  describe('changing perPage', function() {

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });
    });

    it('should reset the current page to 0', function() {
      assert(paginated.getNumPages() === 7);
      assert(paginated.getPage() === 0);

      paginated.setPage(6);
      assert(paginated.getPage() === 6);

      paginated.setPerPage(5);
      assert(paginated.getPage() === 0);
    });

  });

  describe('removing a model in the superset', function() {

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });
    });

    it('should update the current page if the model was there', function() {
      // The first page should include models 0 - 14
      var current = paginated.pluck('n');
      assert(_.isEqual(current, _.range(15)));
      assert(paginated.length === 15);

      var firstModel = superset.first();
      assert(firstModel.get('n') === 0);
      superset.remove(firstModel);

      // We should still have 7 pages
      assert(paginated.getNumPages() === 7);

      // The first page should now include models 1 - 15
      var updated = paginated.pluck('n');
      assert(_.isEqual(updated, _.range(1, 16)));
      assert(paginated.length === 15);
    });

    it('should affect which pages other models fall on', function() {
      paginated.setPage(6);

      // The last page should include models 90 - 99
      var current = paginated.pluck('n');
      assert(paginated.length === 10);
      assert(_.isEqual(current, _.range(90, 100)));

      var firstModel = superset.first();
      assert(firstModel.get('n') === 0);
      superset.remove(firstModel);

      // We should still have 7 pages
      assert(paginated.getNumPages() === 7);

      // The last page should now include models 91 - 99
      var updated = paginated.pluck('n');
      assert(paginated.length === 9);
      assert(_.isEqual(updated, _.range(91, 100)));
    });

    it('should change the number of pages when necessary', function() {
      // We can evenly divide the number of pages with 10 models on each
      paginated.setPerPage(10);

      assert(paginated.getNumPages() === 10);

      // The last page has 10 models, so removing 9 should keep us
      // with 10 pages
      for (var i = 0; i < 9; i++) {
        superset.remove(superset.last());
        assert(paginated.getNumPages() === 10);
      }

      // Now removing one more should update us to only 9 pages
      superset.remove(superset.last());
      assert(paginated.getNumPages() === 9);
    });

  });

  describe('adding a model in the superset', function() {

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });
    });

    it('should update the current page if the model was there', function() {
      // The first page should include models 0 - 14
      var current = paginated.pluck('n');
      assert(_.isEqual(current, _.range(15)));
      assert(paginated.length === 15);

      var model = new Backbone.Model({ n: -1 });
      superset.unshift(model);

      // We should still have 7 pages
      assert(paginated.getNumPages() === 7);

      // The first page should now include models -1 - 13
      var updated = paginated.pluck('n');
      assert(_.isEqual(updated, _.range(-1, 14)));
      assert(paginated.length === 15);
    });

    it('should affect which pages other models fall on', function() {
      paginated.setPage(6);

      // The last page should include models 90 - 99
      var current = paginated.pluck('n');
      assert(paginated.length === 10);
      assert(_.isEqual(current, _.range(90, 100)));

      var model = new Backbone.Model({ n: -1 });
      superset.unshift(model);

      // We should still have 7 pages
      assert(paginated.getNumPages() === 7);

      // The last page should now include models 89 - 99
      var updated = paginated.pluck('n');
      assert(paginated.length === 11);
      assert(_.isEqual(updated, _.range(89, 100)));
    });

    it('should change the number of pages when necessary', function() {
      // We can evenly divide the number of pages with 10 models on each
      paginated.setPerPage(10);

      assert(paginated.getNumPages() === 10);

      // The last page has 10 models, so adding one should move us
      // to 11 pages
      superset.add({ n: 100 });
      assert(paginated.getNumPages() === 11);

      // Adding another 9 models should not change the number of pages
      for (var i = 0; i < 9; i++) {
        superset.add({ n: i });
        assert(paginated.getNumPages() === 11);
      }

      // And adding one more should get us to 12
      superset.add({ n: 100 });
      assert(paginated.getNumPages() === 12);
    });

  });

  describe('destroying a model in the superset', function() {

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });
    });

    it('should update the current page if the model was there', function() {
      // The first page should include models 0 - 14
      var current = paginated.pluck('n');
      assert(_.isEqual(current, _.range(15)));
      assert(paginated.length === 15);

      var firstModel = superset.first();
      assert(firstModel.get('n') === 0);

      // Now we *destroy it!*
      firstModel.destroy();

      // We should still have 7 pages
      assert(paginated.getNumPages() === 7);

      // The first page should now include models 1 - 15
      var updated = paginated.pluck('n');
      assert(_.isEqual(updated, _.range(1, 16)));
      assert(paginated.length === 15);
    });

    it('should affect which pages other models fall on', function() {
      paginated.setPage(6);

      // The last page should include models 90 - 99
      var current = paginated.pluck('n');
      assert(paginated.length === 10);
      assert(_.isEqual(current, _.range(90, 100)));

      var firstModel = superset.first();
      assert(firstModel.get('n') === 0);

      // Now we *destroy it!*
      firstModel.destroy();

      // We should still have 7 pages
      assert(paginated.getNumPages() === 7);

      // The last page should now include models 91 - 99
      var updated = paginated.pluck('n');
      assert(paginated.length === 9);
      assert(_.isEqual(updated, _.range(91, 100)));
    });

    it('should change the number of pages when necessary', function() {
      // We can evenly divide the number of pages with 10 models on each
      paginated.setPerPage(10);

      assert(paginated.getNumPages() === 10);

      // The last page has 10 models, so removing 9 should keep us
      // with 10 pages
      for (var i = 0; i < 9; i++) {
        superset.last().destroy();
        assert(paginated.getNumPages() === 10);
      }

      // Now removing one more should update us to only 9 pages
      superset.last().destroy();
      assert(paginated.getNumPages() === 9);
    });

  });

  describe('reseting the superset', function() {
    var newData = _.map(_.range(100, 150), function(i) { return { n: i }; });

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });
    });

    it('should update everything', function() {
      superset.reset(newData);

      assert(paginated.getPage() === 0);
      assert(paginated.getNumPages() === 4);
      assert(paginated.length === 15);

      paginated.setPage(3);

      assert(paginated.getPage() === 3);
      assert(paginated.getNumPages() === 4);
      assert(paginated.length === 5);

      paginated.setPerPage(5);
      assert(paginated.getPage() === 0);
      assert(paginated.getNumPages() === 10);
      assert(paginated.length === 5);
    });

  });

  // This describes the case in which a model is removed or the superset is reset
  // such that the current page no longer makes exists. This only happens when the
  // new collection is smaller than the old one (adding models will never cause
  // this problem). Following the principle of least surprise leads us to making
  // sure we're always on the last existing page when the current page disappears.
  describe("when the page we're on no longer exists", function() {
    var newData = _.map(_.range(100, 150), function(i) { return { n: i }; });

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });
    });

    it('removing a model', function() {
      // We can evenly divide the number of pages with 10 models on each
      paginated.setPerPage(10);

      // Go to the last page
      paginated.setPage(9);

      assert(paginated.getNumPages() === 10);
      assert(paginated.getPage() === 9);

      // The last page has 10 models, so removing 9 should keep us
      // with 10 pages
      for (var i = 0; i < 9; i++) {
        superset.remove(superset.last());
        assert(paginated.getPage() === 9);
      }

      // Now removing one more should update us to only 9 pages
      superset.remove(superset.last());
      // And we should now be on the last page, page 8
      assert(paginated.getPage() === 8);
    });

    it('resetting the superset', function() {
      // We can evenly divide the number of pages with 10 models on each
      paginated.setPerPage(10);

      // Set the current page to something that won't exist after the reset
      paginated.setPage(7);

      // Reset the superset with 50 models. There will only be 5 pages
      superset.reset(newData);

      // We should now be on the last page since page 7 no longer exists
      assert(paginated.getNumPages() === 5);
      assert(paginated.getPage() === 4);
    });

  });

  describe('pipe events from the subset to the container', function() {
    var newData = _.map(_.range(100, 150), function(i) { return { n: i }; });

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });
    });

    it('add event on add', function() {
      var model = new Backbone.Model({ n: 200 });

      var add = sinon.stub();
      paginated.on('add', add);

      superset.unshift(model);

      add.should.be.calledWith(model, paginated);
    });

    it('add and remove event when adding a model on a previous page', function() {
      var model = new Backbone.Model({ n: 200 });

      // Set page to 2, we should have models 30-44
      paginated.setPage(2);
      assert(_.isEqual(paginated.pluck('n'), _.range(30, 45)));

      var addEvent = false;
      var removeEvent = false;
      var resetEvent = false;

      paginated.on('add',    function() { addEvent    = true; });
      paginated.on('remove', function() { removeEvent = true; });
      paginated.on('reset',  function() { resetEvent  = true; });

      // Add the model in the 4th index. This will be on the first page.
      superset.add(model, { at: 3 });

      // The new set should be 29-43
      assert(_.isEqual(paginated.pluck('n'), _.range(29, 44)));

      assert(!resetEvent);
      assert(addEvent);
      assert(removeEvent);
    });

    it('no events when adding a model on a later page', function() {
      var model = new Backbone.Model({ n: 200 });

      // Set page to 2, we should have models 30-44
      paginated.setPage(2);
      assert(_.isEqual(paginated.pluck('n'), _.range(30, 45)));

      var addEvent = false;
      var removeEvent = false;
      var resetEvent = false;

      paginated.on('add',    function() { addEvent    = true; });
      paginated.on('remove', function() { removeEvent = true; });
      paginated.on('reset',  function() { resetEvent  = true; });

      // Add the model in the 91st index. This will be on a later page
      superset.add(model, { at: 90 });

      // The set should still be 30-44
      assert(_.isEqual(paginated.pluck('n'), _.range(30, 45)));

      assert(!resetEvent);
      assert(!addEvent);
      assert(!removeEvent);
    });

    it('add and remove event when removing a model on a previous page', function() {
      // Set page to 2, we should have models 30-44
      paginated.setPage(2);
      assert(_.isEqual(paginated.pluck('n'), _.range(30, 45)));

      var addEvent = false;
      var removeEvent = false;
      var resetEvent = false;

      paginated.on('add',    function() { addEvent    = true; });
      paginated.on('remove', function() { removeEvent = true; });
      paginated.on('reset',  function() { resetEvent  = true; });

      // remove the first model from the superset
      superset.remove(superset.first());

      // The new set should be 31-45
      assert(_.isEqual(paginated.pluck('n'), _.range(31, 46)));

      assert(!resetEvent);
      assert(addEvent);
      assert(removeEvent);
    });

    it('no events when removing a model on a later page', function() {
      // Set page to 2, we should have models 30-44
      paginated.setPage(2);
      assert(_.isEqual(paginated.pluck('n'), _.range(30, 45)));

      var addEvent = false;
      var removeEvent = false;
      var resetEvent = false;

      paginated.on('add',    function() { addEvent    = true; });
      paginated.on('remove', function() { removeEvent = true; });
      paginated.on('reset',  function() { resetEvent  = true; });

      // remove the first model from the superset
      superset.remove(superset.last());

      // The set should still be 30-44
      assert(_.isEqual(paginated.pluck('n'), _.range(30, 45)));

      assert(!resetEvent);
      assert(!addEvent);
      assert(!removeEvent);
    });

    it("no add event when adding a model not on the current page", function() {
      var model = new Backbone.Model({ n: 200 });

      var called = false;
      paginated.on('add', function(m, collection) {
        called = true;
      });

      superset.add(model);

      assert(!called);
    });

    it('remove event on remove', function() {
      var model = superset.first();

      var called = false;
      paginated.on('remove', function(m, collection) {
        assert(m === model);
        assert(collection === paginated);
        called = true;
      });

      superset.remove(model);

      assert(called);
    });

    it("no remove event when removing a model not on the current page", function() {
      var model = superset.last();

      var called = false;
      paginated.on('remove', function(collection) {
        called = true;
      });

      superset.remove(model);

      assert(!called);
    });

    it('reset event', function() {
      var called = false;
      paginated.on('reset', function(collection) {
        assert(collection === paginated);
        called = true;
      });

      superset.reset(newData);

      assert(called);
    });

    it('model change event', function() {
      var model = superset.first();

      var called = false;
      paginated.on('change', function(m) {
        assert(m === model);
        called = true;
      });

      model.set({ n: 100 });

      assert(called);
    });

    it("no model change event when model isn't on the current page", function() {
      var model = superset.last();

      var called = false;
      paginated.on('change', function(m) {
        called = true;
      });

      model.set({ n: 100 });

      assert(!called);
    });

    it('model change event: specific key', function() {
      var model = superset.first();

      var called = false;
      paginated.on('change:n', function(m) {
        assert(m === model);
        called = true;
      });

      model.set({ n: 100 });

      assert(called);
    });

    it("no change: key event when model isn't on the current page", function() {
      var model = superset.last();

      var called = false;
      paginated.on('change:n', function(m) {
        called = true;
      });

      model.set({ n: 100 });

      assert(!called);
    });

  });

  describe('pagination-specific events', function() {

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });
    });

    it('paginated:change:perPage', function() {
      var called = false;
      var perPage, numPages;

      paginated.on('paginated:change:perPage', function(details) {
        perPage = details.perPage;
        numPages = details.numPages;
        called = true;
      });

      paginated.setPerPage(10);
      assert(called);
      assert(perPage === 10);
      assert(numPages === 10);

      called = false;

      paginated.setPerPage(20);
      assert(called);
      assert(perPage === 20);
      assert(numPages === 5);
    });

    it('paginated:change:page', function() {
      var called = false;
      var page;

      paginated.on('paginated:change:page', function(details) {
        page = details.page;
        called = true;
      });

      assert(!called);

      paginated.nextPage();
      assert(called);
      assert(page === 1);
      assert(page === paginated.getPage());
      called = false;

      paginated.prevPage();
      assert(called);
      assert(page === 0);
      assert(page === paginated.getPage());
      called = false;

      paginated.setPage(6);
      assert(called);
      assert(page === 6);
      assert(page === paginated.getPage());
      called = false;

      paginated.movePage(-1);
      assert(called);
      assert(page === 5);
      assert(page === paginated.getPage());
      called = false;

      paginated.setPerPage(10);
      assert(called);
      assert(page === 0);
      assert(page === paginated.getPage());
      called = false;
    });

    it('paginated:change:numPages', function() {
      var called = false;
      var numPages;

      paginated.on('paginated:change:numPages', function(details) {
        numPages = details.numPages;
        called = true;
      });

      assert(!called);

      // The last page has 10 models, so if we get rid of them the number
      // of pages will change

      // remove the first 9, nothing happens
      for (var i = 0; i < 9; i += 1) {
        superset.remove(superset.last());
      }

      assert(!called);

      // remove the last model on the last page, and the event should fire
      superset.remove(superset.last());

      assert(called);
      assert(numPages === 6);

      // Now let's add another model to make sure we fire the event again
      called = false;
      numPages = null;
      superset.add({ n: 1000 });
      assert(called);
      assert(numPages === 7);
    });

  });

  describe('destroying the proxy', function() {

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });
    });

    it('should fire an event on destruction', function() {
      var called = false;
      paginated.on('paginated:destroy', function() {
        called = true;
      });

      paginated.destroy();
      assert(called);
    });

    it('should fire no other events on destruction', function() {
      var called = false;
      paginated.on('all', function(e) {
        if (e !== 'paginated:destroy') {
          called = true;
        }
      });

      paginated.destroy();
      assert(!called);
    });

    it('should have 0 length and 0 pages afterward', function() {
      paginated.destroy();
      assert(paginated.length === 0);
      assert(paginated.getNumPages() === 0);
    });

    it('should not repond to changes in the superset', function() {
      paginated.destroy();
      superset.add({ n: 9000 });

      assert(paginated.length === 0);
      assert(paginated.getNumPages() === 0);
    });

    it('should emit no events after', function() {
      paginated.destroy();

      var called = false;
      paginated.on('all', function(e) {
        called = true;
      });

      superset.add({ n: 9000 });
      superset.remove(superset.first());
      superset.reset([{ n: 1 }]);

      assert(!called);
    });

  });

  describe('infinite scroll', function() {

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });

      // append a page
      paginated.appendNextPage();
    });

    it('should append the next page of data', function(){

      paginated.length.should.eql(30);
      paginated.getPage().should.eql(0);
      paginated.getNumPages().should.eql(6);

      // keep appending pages
      paginated.appendNextPage();
      paginated.appendNextPage();
      paginated.appendNextPage();
      paginated.appendNextPage();
      paginated.length.should.eql(90);
      paginated.getPage().should.eql(0);
      paginated.getNumPages().should.eql(2);

      // append last page
      paginated.appendNextPage();
      paginated.length.should.eql(100);
      paginated.getPage().should.eql(0);
      paginated.getNumPages().should.eql(1);

    });

    it('should update the current page if the model was there', function() {
      // The first page should include models 0 - 29
      var current = paginated.pluck('n');
      current.should.eql(_.range(30));
      paginated.length.should.eql(30);

      var model = new Backbone.Model({ n: -1 });
      superset.unshift(model);

      // We should still have 6 pages
      paginated.getNumPages().should.eql(6);

      // The first page should now include models -1 - 29
      var updated = paginated.pluck('n');
      updated.should.eql(_.range(-1, 30));
      paginated.length.should.eql(31);
    });

    it('should remove a model from the infinite page', function() {
      var current = paginated.pluck('n');
      current.should.eql(_.range(30));
      paginated.length.should.eql(30);

      var firstModel = superset.first();
      firstModel.get('n').should.eql(0);
      superset.remove(firstModel);

      // We should still have 6 pages
      paginated.getNumPages().should.eql(6);

      // The first page should now include models 1 - 29
      var updated = paginated.pluck('n');
      updated.should.eql(_.range(1, 31));
      paginated.length.should.eql(30);
    });

    it('should change the number of pages on remove', function() {

      // 100 in collection
      // 30 on infinite page
      // = 1 infinite page + 4 full pages + 10 on last page = 6 pages
      for (var i = 0; i < 9; i++) {
        superset.remove(superset.last());
        assert(paginated.getNumPages() === 6);
      }

      // Now removing one more should update us to only 5 pages
      superset.remove(superset.last());
      assert(paginated.getNumPages() === 5);
    });

    it('should change the number of pages on add', function() {

      // 100 in collection
      // 30 on infinite page
      // = 1 infinite page + 4 full pages + 10 on last page = 6 pages
      for (var i = 0; i < 5; i++) {
        superset.add({ n: i });
        assert(paginated.getNumPages() === 6);
      }

      // And adding one more should get us to 7
      superset.add({ n: 100 });
      assert(paginated.getNumPages() === 7);
    });

    it('reseting the superset should update everything', function() {
      var newData = _.map(_.range(100, 150), function(i) { return { n: i }; });

      superset.reset(newData);

      paginated.getPage().should.eql(0);
      paginated.getNumPages().should.eql(4);
      paginated.length.should.eql(15);

      paginated.appendNextPage();

      paginated.getPage().should.eql(0);
      paginated.getNumPages().should.eql(3);
      paginated.length.should.eql(30);

    });

    it('add event on add', function() {
      var model = new Backbone.Model({ n: 200 });

      var add = sinon.stub();
      paginated.on('add', add);

      superset.unshift(model);

      add.should.be.calledWith(model, paginated);
    });

    it('only add event when adding a model on a "previous" page', function() {
      var model = new Backbone.Model({ n: 200 });

      paginated.appendNextPage();

      // we should have models 0-44
      var current = paginated.pluck('n');
      current.should.eql(_.range(45));

      var addEvent = sinon.stub();
      var removeEvent = sinon.stub();
      var resetEvent = sinon.stub();

      paginated.on('add',    addEvent);
      paginated.on('remove', removeEvent);
      paginated.on('reset',  resetEvent);

      // Add the model in the 4th index. This will be on the first page.
      superset.add(model, { at: 3 });

      // The new set should be 0,1,2,200,...,44
      var updated = _.range(45);
      updated.splice(3, 0, 200);
      paginated.pluck('n').should.eql(updated);

      addEvent.should.be.calledWith(model, paginated);
      removeEvent.should.not.be.called;
      resetEvent.should.not.be.called;
    });

    it('no events when removing a model on a later page', function() {

      paginated.appendNextPage();

      // we should have models 0-44
      var current = paginated.pluck('n');
      current.should.eql(_.range(45));

      var addEvent = sinon.stub();
      var removeEvent = sinon.stub();
      var resetEvent = sinon.stub();

      paginated.on('add',    addEvent);
      paginated.on('remove', removeEvent);
      paginated.on('reset',  resetEvent);

      // remove the first model from the superset
      superset.remove(superset.last());

      // The set should still be 30-44
      var updated = paginated.pluck('n');
      updated.should.eql(_.range(45));

      addEvent.should.not.be.called;
      removeEvent.should.not.be.called;
      resetEvent.should.not.be.called;
    });

    it('remove event on remove', function() {
      var model = superset.first();
      var remove = sinon.stub();
      paginated.on('remove', remove);
      superset.remove(model);
      remove.should.be.calledWith(model, paginated);
    });

    it("no remove event when removing a model not on the current page", function() {
      var model = superset.last();
      var remove = sinon.stub();
      paginated.on('remove', remove);
      superset.remove(model);
      remove.should.not.be.called;
    });

    it('reset event', function() {
      var newData = _.map(_.range(100, 150), function(i) { return { n: i }; });
      var reset = sinon.stub();
      paginated.on('reset', reset);
      superset.reset(newData);
      reset.should.be.calledWith(paginated);
    });

    it('`removePagination` should remove all pagination settings', function() {
      paginated.removePagination();

      paginated.getPerPage().should.eql(superset.length);
      paginated.getPage().should.eql(0);
      paginated.getNumPages().should.eql(1);
      paginated.length.should.eql(superset.length);
    });

    it('should update when the original collection is sorted', function() {
      var newData = _.map(_.range(100, 0, -1), function(i) { return { n: i }; });

      // Reset the superset
      superset.reset(newData);

      // The paginated collection should hold the new data
      paginated.toJSON().should.eql(newData.splice(0, 15));

      // Let's reverse the sort
      superset.comparator = 'n';
      superset.sort();

      paginated.pluck('n').should.eql(_.range(1, 16));
    });

  });

  describe('large collections: 100,000', function(){

    var size = 100000;
    var perPage = 15;
    var largeData = _.map(_.range(size), function(i) { return { n: i }; });

    beforeEach(function() {
      superset = new Backbone.Collection(largeData);
      paginated = new PaginatedCollection(superset, { perPage: perPage });

      // append a page
      paginated.appendNextPage();
    });

    it('should append the next page of data', function(){

      paginated.length.should.eql(30);
      paginated.getPage().should.eql(0);
      paginated.getNumPages().should.eql( Math.floor(size/perPage) );

      // keep appending pages
      paginated.appendNextPage(); //-1
      paginated.appendNextPage(); //-1
      paginated.appendNextPage(); //-1
      paginated.appendNextPage(); //-1
      paginated.length.should.eql(90);
      paginated.getPage().should.eql(0);
      paginated.getNumPages().should.eql( Math.floor(size/perPage) - 4 );

    });

    it('should update the current page if the model was there', function() {
      // The first page should include models 0 - 29
      var current = paginated.pluck('n');
      current.should.eql( _.range(30) );
      paginated.length.should.eql(30);

      var model = new Backbone.Model({ n: -1 });
      superset.unshift(model);

      // We should have same number of pages
      paginated.getNumPages().should.eql( Math.floor(size/perPage) );

      // The first page should now include models -1 - 29
      var updated = paginated.pluck('n');
      updated.should.eql(_.range(-1, 30));
      paginated.length.should.eql(31);
    });

    it('should remove a model from the infinite page', function() {
      var current = paginated.pluck('n');
      current.should.eql(_.range(30));
      paginated.length.should.eql(30);

      var firstModel = superset.first();
      firstModel.get('n').should.eql(0);
      superset.remove(firstModel);

      // We should still have 6 pages
      paginated.getNumPages().should.eql( Math.floor(size/perPage) );

      // The first page should now include models 1 - 29
      var updated = paginated.pluck('n');
      updated.should.eql(_.range(1, 31));
      paginated.length.should.eql(30);
    });

    it('should change the number of pages on remove', function() {

      for (var i = 0; i < 9; i++) {
        superset.remove(superset.last());
        paginated.getNumPages().should.eql( Math.floor(size/perPage) );
      }

      superset.remove(superset.last());
      paginated.getNumPages().should.eql( Math.floor(size/perPage) - 1 );
    });

    it('should change the number of pages on add', function() {

      for (var i = 0; i < 5; i++) {
        superset.add({ n: i });
        paginated.getNumPages().should.eql( Math.floor(size/perPage) );
      }

      superset.add({ n: 1000000 });
      paginated.getNumPages().should.eql( Math.floor(size/perPage) + 1 );
    });

    it('reseting the superset should update everything', function() {
      var newData = _.map(_.range(size, size + size/2), function(i) { return { n: i }; });

      superset.reset(newData);

      paginated.getPage().should.eql(0);
      paginated.getNumPages().should.eql( Math.floor(size/(perPage*2)) + 1 );
      paginated.length.should.eql( 15 );

      paginated.appendNextPage();

      paginated.getPage().should.eql(0);
      paginated.getNumPages().should.eql( Math.floor(size/(perPage*2)) );
      paginated.length.should.eql(30);

    });

  });


});