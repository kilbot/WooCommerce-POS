var _ = require('lodash');

function proxyEvents(from, eventNames) {
  _.each(eventNames, function (eventName) {
    this.listenTo(from, eventName, function () {
      var args = _.toArray(arguments);
      args.unshift(eventName);
      this.trigger.apply(this, args);
    });
  }, this);
}

module.exports = proxyEvents;