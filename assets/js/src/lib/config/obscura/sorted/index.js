
var _ = require('underscore');
var Backbone =require('backbone');
var proxyCollection = require('backbone-collection-proxy');
var sortedIndex = require('./src/sorted-index.js');

function lookupIterator(value) {
  return _.isFunction(value) ? value : function(obj){ return obj.get(value); };
}

function modelInsertIndex(model) {
  if (!this._comparator) {
    return this._superset.indexOf(model);
  } else {
    return sortedIndex(this._collection.models, model, lookupIterator(this._comparator), this._reverse);
  }
}

function onAdd(model) {
  var index = modelInsertIndex.call(this, model);
  this._collection.add(model, { at: index });
}

function onRemove(model) {
  if (this.contains(model)) {
    this._collection.remove(model);
  }
}

function onChange(model) {
  if (this.contains(model) && this._collection.indexOf(model) !== modelInsertIndex.call(this, model)) {
    this._collection.remove(model);
    onAdd.call(this, model);
  }
}

function sort() {
  if (!this._comparator) {
    this._collection.reset(this._superset.toArray());
    return;
  }

  // Evaluate the type of comparator based on http://backbonejs.org/#Collection-comparator
  var newOrder;
  if (_.isString(this._comparator) || this._comparator.length === 1) {
    newOrder = this._superset.sortBy(this._comparator);
  } else {
    newOrder = this._superset.models.sort(this._comparator);
  }
  this._collection.reset(this._reverse ? newOrder.reverse() : newOrder);
}

function Sorted(superset) {
  // Save a reference to the original collection
  this._superset = superset;
  this._reverse = false;
  this._comparator = null;

  // The idea is to keep an internal backbone collection with the paginated
  // set, and expose limited functionality.
  this._collection = new Backbone.Collection(superset.toArray());
  proxyCollection(this._collection, this);

  this.listenTo(this._superset, 'add', onAdd);
  this.listenTo(this._superset, 'remove', onRemove);
  this.listenTo(this._superset, 'change', onChange);
  this.listenTo(this._superset, 'reset', sort);
}

var methods = {

  setSort: function(comparator, direction) {
    this._reverse = direction === 'desc' ? true : false;
    this._comparator = comparator;

    sort.call(this);

    if (!comparator) {
      this.trigger('sorted:remove');
    } else {
      this.trigger('sorted:add');
    }

    return this;
  },

  reverseSort: function() {
    this._reverse = !this._reverse;
    sort.call(this);

    return this;
  },

  removeSort: function() {
    this.setSort();
    return this;
  },

  superset: function() {
    return this._superset;
  },

  destroy: function() {
    this.stopListening();
    this._collection.reset([]);
    this._superset = this._collection;
    this.length = 0;

    this.trigger('sorted:destroy');
  }

};

// Build up the prototype
_.extend(Sorted.prototype, methods, Backbone.Events);

module.exports = Sorted;

