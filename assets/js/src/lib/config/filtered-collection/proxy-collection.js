var _ = require('lodash');
var Backbone = require('backbone');

var blacklistedMethods = [
  '_onModelEvent',
  '_prepareModel',
  '_removeReference',
  '_reset',
  'add',
  'initialize',
  'sync',
  'remove',
  'reset',
  'set',
  'push',
  'pop',
  'unshift',
  'shift',
  'sort',
  'parse',
  'fetch',
  'create',
  'model',
  'off',
  'on',
  'listenTo',
  'listenToOnce',
  'bind',
  'trigger',
  'once',
  'stopListening'
];

var eventWhiteList = [
  'add',
  'remove',
  'reset',
  'sort',
  'destroy',
  'sync',
  'request',
  'error'
];

function proxyCollection(from, target) {
  function updateLength() {
    target.length = from.length;
  }
  function pipeEvents(eventName) {
    var args = _.toArray(arguments);
    var isChangeEvent = eventName === 'change' || eventName.slice(0, 7) === 'change:';
    if (eventName === 'reset') {
      target.models = from.models;
    }
    if (_.contains(eventWhiteList, eventName)) {
      if (_.contains([
          'add',
          'remove',
          'destroy'
        ], eventName)) {
        args[2] = target;
      } else if (_.contains([
          'reset',
          'sort'
        ], eventName)) {
        args[1] = target;
      }
      target.trigger.apply(this, args);
    } else if (isChangeEvent) {
      if (target.contains(args[1])) {
        target.trigger.apply(this, args);
      }
    }
  }
  var methods = {};
  _.each(_.functions(Backbone.Collection.prototype), function (method) {
    if (!_.contains(blacklistedMethods, method)) {
      methods[method] = function () {
        return from[method].apply(from, arguments);
      };
    }
  });
  _.extend(target, Backbone.Events, methods);
  target.listenTo(from, 'all', updateLength);
  target.listenTo(from, 'all', pipeEvents);
  target.models = from.models;
  updateLength();
  return target;
}

module.exports = proxyCollection;