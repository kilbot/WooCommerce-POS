/* jshint -W101, -W071, -W074 */
var _ = require('lodash');
var Backbone = require('backbone');
var proxyCollection = require('./proxy-collection');

function getPageLimits() {
  var start = this.getPage() * this.getPerPage();
  var end = start + this.getPerPage();
  return [
    start,
    end
  ];
}

function updatePagination(options) {
  options = options || {};
  var pages = getPageLimits.call(this);
  if(options.add){
    return this._collection.add(this.superset().slice(pages[0], pages[1]));
  }
  return this._collection.reset(this.superset().slice(pages[0], pages[1]));
}

function updateNumPages() {
  //var currentNumPages = this._totalPages;
  var length = this.superset().length;
  var perPage = this.getPerPage();
  var totalPages = length % perPage === 0 ? length / perPage : Math.floor(length / perPage) + 1;
  var numPagesChanged = this._totalPages !== totalPages;
  this._totalPages = totalPages;
  if (numPagesChanged) {
    this.trigger('paginated:change:numPages', { numPages: totalPages });
  }
  if (this.getPage() >= totalPages) {
    this.setPage(totalPages - 1);
    return true;
  }
}

function recalculatePagination() {
  if (updateNumPages.call(this)) {
    return;
  }
  updatePagination.call(this);
}

function difference(arrayA, arrayB) {
  var maxLength = _.max([
    arrayA.length,
    arrayB.length
  ]);
  for (var i = 0, j = 0; i < maxLength; i += 1, j += 1) {
    if (arrayA[i] !== arrayB[j]) {
      if (arrayB[i - 1] === arrayA[i]) {
        j -= 1;
      } else if (arrayB[i + 1] === arrayA[i]) {
        j += 1;
      } else {
        return arrayA[i];
      }
    }
  }
}

function onAddRemove() {
  if (updateNumPages.call(this)) {
    return;
  }
  var pages = getPageLimits.call(this);
  var start = pages[0], end = pages[1];
  var toAdd = difference(this.superset().slice(start, end), this._collection.toArray());
  var toRemove = difference(this._collection.toArray(), this.superset().slice(start, end));
  if (toRemove) {
    this._collection.remove(toRemove);
  }
  if (toAdd) {
    this._collection.add(toAdd, { at: this.superset().indexOf(toAdd) - start });
  }
}

function Paginated(superset, options) {
  this._superset = superset;
  this._collection = new Backbone.Collection(superset.toArray());
  this._page = 0;
  this.setPerPage(options && options.perPage ? options.perPage : null);
  proxyCollection(this._collection, this);
  this.listenTo(this._superset, 'add remove', onAddRemove);
  this.listenTo(this._superset, 'reset sort', recalculatePagination);
}

var methods = {
  removePagination: function () {
    this.setPerPage(null);
    return this;
  },
  setPerPage: function (perPage) {
    this._perPage = perPage;
    recalculatePagination.call(this);
    this.setPage(0);
    this.trigger('paginated:change:perPage', {
      perPage: perPage,
      numPages: this.getNumPages()
    });
    return this;
  },
  setPage: function (page, options) {
    var lowerLimit = 0;
    var upperLimit = this.getNumPages() - 1;
    page = page > lowerLimit ? page : lowerLimit;
    page = page < upperLimit ? page : upperLimit;
    page = page < 0 ? 0 : page;
    this._page = page;
    updatePagination.call(this, options);
    this.trigger('paginated:change:page', { page: page });
    return this;
  },
  getPerPage: function () {
    return this._perPage || this.superset().length || 1;
  },
  getNumPages: function () {
    return this._totalPages;
  },
  getPage: function () {
    return this._page;
  },
  hasNextPage: function () {
    return this.getPage() < this.getNumPages() - 1;
  },
  hasPrevPage: function () {
    return this.getPage() > 0;
  },
  nextPage: function () {
    this.movePage(1);
    return this;
  },
  prevPage: function () {
    this.movePage(-1);
    return this;
  },
  firstPage: function () {
    this.setPage(0);
  },
  lastPage: function () {
    this.setPage(this.getNumPages() - 1);
  },
  movePage: function (delta) {
    this.setPage(this.getPage() + delta);
    return this;
  },
  superset: function () {
    return this._superset;
  },
  destroy: function () {
    this.stopListening();
    this._collection.reset([]);
    this._superset = this._collection;
    this._page = 0;
    this._totalPages = 0;
    this.length = 0;
    this.trigger('paginated:destroy');
  },

  // infinite scroll
  appendNextPage: function(){
    this.setPage(this.getPage() + 1, {add:true});
    return this;
  }
};

_.extend(Paginated.prototype, methods, Backbone.Events);

module.exports = Paginated;
/* jshint +W101, +W071, +W074 */