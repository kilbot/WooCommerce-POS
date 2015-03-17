var _ = require('lodash');

function convertKeyValueToFunction(key, value) {
  return function (model) {
    return model.get(key) === value;
  };
}

function convertKeyFunctionToFunction(key, fn) {
  return function (model) {
    return fn(model.get(key));
  };
}

function createFilterObject(filterFunction, keys) {
  if (!_.isArray(keys)) {
    keys = null;
  }
  return {
    fn: filterFunction,
    keys: keys
  };
}

function createFilterFromObject(filterObj) {
  var keys = _.keys(filterObj);
  var filterFunctions = _.map(keys, function (key) {
    var val = filterObj[key];
    if (_.isFunction(val)) {
      return convertKeyFunctionToFunction(key, val);
    }
    return convertKeyValueToFunction(key, val);
  });
  var filterFunction = function (model) {
    for (var i = 0; i < filterFunctions.length; i++) {
      if (!filterFunctions[i](model)) {
        return false;
      }
    }
    return true;
  };
  return createFilterObject(filterFunction, keys);
}

function createFilter(filter, keys) {
  if (_.isFunction(filter)) {
    return createFilterObject(filter, keys);
  }
  if (_.isObject(filter)) {
    return createFilterFromObject(filter);
  }
}

module.exports = createFilter;