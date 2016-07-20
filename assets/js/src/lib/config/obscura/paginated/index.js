var _ = require('underscore');
var Backbone = require('backbone');
var proxyCollection = require('backbone-collection-proxy');

function getPageLimits() {
  if(this._infinite){
    var start = 0;
    var end = this._collection.length;
  } else {
    var start = this.getPage() * this.getPerPage();
    var end = start + this.getPerPage();
  }
  return [start, end];
}

function updatePagination() {
  var pages = getPageLimits.call(this);
  return this._collection.reset(this.superset().slice(pages[0], pages[1]));
}

function infintePagination() {
  var start = 0;
  var end = this._collection.length + this.getPerPage();
  return this._collection.add(this.superset().slice(start, end));
}

function calcPages() {
  var perPage = this.getPerPage();
  var length = this.superset().length - this._collection.length;

  var totalPages = length % perPage === 0 ?
    (length / perPage) : Math.floor(length / perPage) + 1;

  return totalPages + 1;
}

function updateNumPages() {
  var length = this.superset().length;
  var perPage = this.getPerPage();

  // If the # of objects can be exactly divided by the number
  // of pages, it would leave an empty last page if we took
  // the floor.
  var totalPages = length % perPage === 0 ?
    (length / perPage) : Math.floor(length / perPage) + 1;

  var numPagesChanged = this._totalPages !== totalPages;
  this._totalPages = totalPages;

  if (numPagesChanged) {
    this.trigger('paginated:change:numPages', { numPages: totalPages });
  }

  // Test to see if we are past the last page, and if so,
  // move back. Return true so that we can test to see if
  // this happened.
  if (this.getPage() >= totalPages) {
    this.setPage(totalPages - 1);
    return true;
  }
}

function recalculatePagination() {
  // reset infinite page
  this._infinite = false;

  if (updateNumPages.call(this)) { return; }
  updatePagination.call(this);
}

// Given two arrays of backbone models, with at most one model added
// and one model removed from each, return the model in arrayA that
// is not in arrayB or undefined.
function difference(arrayA, arrayB) {
  var maxLength = _.max([ arrayA.length, arrayB.length ]);

  for (var i = 0, j = 0; i < maxLength; i += 1, j += 1) {
    if (arrayA[i] !== arrayB[j]) {
      if (arrayB[i-1] === arrayA[i]) {
        j -= 1;
      } else if (arrayB[i+1] === arrayA[i]) {
        j += 1;
      } else {
        return arrayA[i];
      }
    }
  }
}

function onAddRemove(model, collection, options) {
  if (updateNumPages.call(this)) { return; }

  var pages = getPageLimits.call(this);
  var start = pages[0], end = pages[1];

  // We are only adding and removing at most one model at a time,
  // so we can find just those two models. We could probably rewrite
  // `collectionDifference` to only make on pass instead of two. This
  // is a bottleneck on the total size of collections. I was getting
  // slow unit tests around 30,000 models / page in Firefox.
  var toAdd = difference(this.superset().slice(start, end), this._collection.toArray());

  var infinite = this._infinite && options.add;
  var toRemove;

  if(!infinite){
    toRemove = difference(this._collection.toArray(), this.superset().slice(start, end));
  }

  if (toRemove) {
    this._collection.remove(toRemove);
  }

  if (toAdd) {
    this._collection.add(toAdd, {
      at: this.superset().indexOf(toAdd) - start
    });
  }
};

function Paginated(superset, options) {
  // Save a reference to the original collection
  this._superset = superset;

  // The idea is to keep an internal backbone collection with the paginated
  // set, and expose limited functionality.
  this._collection = new Backbone.Collection(superset.toArray());
  this._page = 0;
  this.setPerPage((options && options.perPage) ? options.perPage : null);

  proxyCollection(this._collection, this);

  this.listenTo(this._superset, 'add remove', onAddRemove);
  this.listenTo(this._superset, 'reset sort', recalculatePagination);
}

var methods = {

  removePagination: function() {
    this._infinite = false;
    this.setPerPage(null);
    return this;
  },

  setPerPage: function(perPage) {
    this._perPage = perPage;
    recalculatePagination.call(this);
    this.setPage(0);

    this.trigger('paginated:change:perPage', {
      perPage: perPage,
      numPages: this.getNumPages()
    });

    return this;
  },

  setPage: function(page) {

    // reset infinite page
    this._infinite = false;

    // The lowest page we could set
    var lowerLimit = 0;
    // The highest page we could set
    var upperLimit = this.getNumPages() - 1;

    // If the page is higher or lower than these limits,
    // set it to the limit.
    page = page > lowerLimit ? page : lowerLimit;
    page = page < upperLimit ? page : upperLimit;
    page = page < 0 ? 0 : page;

    this._page = page;
    updatePagination.call(this);

    this.trigger('paginated:change:page', { page: page });
    return this;
  },

  getPerPage: function() {
    return this._perPage || this.superset().length || 1;
  },

  getNumPages: function() {
    if(this._infinite){
      return calcPages.call(this);
    } else {
      return this._totalPages;
    }
  },

  getPage: function() {
    return this._page;
  },

  hasNextPage: function() {
    return this.getPage() < this.getNumPages() - 1;
  },

  hasPrevPage: function() {
    return this.getPage() > 0;
  },

  nextPage: function() {
    this.movePage(1);
    return this;
  },

  prevPage: function() {
    this.movePage(-1);
    return this;
  },

  firstPage: function() {
    this.setPage(0);
  },

  lastPage: function() {
    this.setPage(this.getNumPages() - 1);
  },

  movePage: function(delta) {
    this.setPage(this.getPage() + delta);
    return this;
  },

  superset: function() {
    return this._superset;
  },

  destroy: function() {
    this.stopListening();
    this._collection.reset([]);
    this._superset = this._collection;
    this._page = 0;
    this._totalPages = 0;
    this.length = 0;
    this._infinite = false;

    this.trigger('paginated:destroy');
  },

  // infinite scroll
  appendNextPage: function(){
    this._infinite = true;
    infintePagination.call(this);
    this.trigger('paginated:change:page', { page: 0 });
    return this;
  }

};

// Build up the prototype
_.extend(Paginated.prototype, methods, Backbone.Events);

module.exports =  Paginated;