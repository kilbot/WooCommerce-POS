var _ = require('lodash');

function lookupIterator(value) {
  return _.isFunction(value) ? value : function (obj) {
    return obj[value];
  };
}

function reverseSortedIndex(array, obj, iterator, context) {
  iterator = iterator === null ? _.identity : lookupIterator(iterator);
  var value = iterator.call(context, obj);
  var low = 0, high = array.length;
  while (low < high) {
    var mid = low + high >>> 1;
    iterator.call(context, array[mid]) < value ? high = mid : low = mid + 1;
  }
  return low;
}

module.exports = reverseSortedIndex;