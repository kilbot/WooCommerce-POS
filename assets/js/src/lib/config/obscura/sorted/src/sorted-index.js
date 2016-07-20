
var _ = require('underscore');

// Underscore provides a .sortedIndex function that works
// when sorting ascending based on a function or a key, but there's no
// way to do the same thing when sorting descending. This is a slight
// modification of the underscore / backbone code to do the same thing
// but descending.

function comparatorAdapter(fieldExtractor, reverse) {
  return function(left, right) {
    var l = fieldExtractor(left);
    var r = fieldExtractor(right);

    if(l === r) return 0;

    return reverse ? (l < r ? 1 : -1) : (l < r ? -1 : 1);
  };
}

function lookupIterator(value, reverse) {
  return value.length === 2 ? value : comparatorAdapter(value, reverse);
}

function sortedIndex(array, obj, iterator, reverse) {
  iterator = iterator === null ? _.identity : lookupIterator(iterator, reverse);

  var low = 0, high = array.length;
  while (low < high) {
      var mid = (low + high) >>> 1;
    if(iterator(array[mid], obj) < 0) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

module.exports = sortedIndex;
