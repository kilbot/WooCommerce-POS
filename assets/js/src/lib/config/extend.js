/**
 * This is the standard Backbone extend function: http://backbonejs.org/docs/backbone.html#helpers
 * With added logic to allow dynamic inheritance through the 'extends' property
 */
var _ = require('lodash');

module.exports = function(protoProps, staticProps){
  var parent = this;
  var child;
  var extend;

  if (protoProps && _.has(protoProps, 'extends')) {
    extend = _.isString(protoProps.extends) ? [protoProps.extends] : protoProps.extends;
  }

  // russian doll subclasses
  if(extend && _.isArray(extend)){
    _.each(extend, function(key){
      parent = parent._extend(key, parent);
    });
  }

  if (protoProps && _.has(protoProps, 'constructor')) {
    child = protoProps.constructor;
  } else {
    child = function(){ return parent.apply(this, arguments); };
  }

  // Add static properties to the constructor function, if supplied.
  _.extend(child, parent, staticProps);

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function and add the prototype properties.
  child.prototype = _.create(parent.prototype, protoProps);
  child.prototype.constructor = child;

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype;
  return child;
};