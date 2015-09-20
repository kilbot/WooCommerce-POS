var Behavior = require('lib/config/behavior');
var Radio = require('backbone.radio');
var _ = require('lodash');
var debug = require('debug')('hotkey');
var App = require('lib/config/application');
var Combokeys = require('combokeys');

var HotKeys = Behavior.extend({
  keys: [],

  initialize: function(options) {
    options = options || {};
    this.element = options.el;
    this.hotkeys = Radio.request('entities', 'get', {
      type: 'option',
      name: 'hotkeys'
    }) || {};
  },

  // todo: this.element => this.view.el
  // todo: refactor!
  onRender: function(){
    var element = this.element || document.documentElement,
        _view = this.view;

    this.combokeys = new Combokeys(element);

    _.each( _view.keyEvents, function(callback, id) {
      var trigger = this.hotkeys[id];

      if (!_.isFunction(callback)) { callback = _view[callback]; }

      if(!trigger || !callback){
        return debug('hotkey not found: ' + id, this.view.keyEvents);
      }

      this.combokeys.bind(trigger.key, function(e, combo){
        callback.call(_view, e, combo);
      });

      this.keys.push(trigger.key);

    }, this);
  },

  onDestroy: function(){
    _.each( this.keys, function( key ) {
      this.combokeys.unbind(key);
    }, this);
  }

});

module.exports = HotKeys;
App.prototype.set('Behaviors.HotKeys', HotKeys);