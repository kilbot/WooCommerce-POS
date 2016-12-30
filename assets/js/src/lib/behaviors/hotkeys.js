var Behavior = require('lib/config/behavior');
var Radio = require('backbone.radio');
var _ = require('lodash');
var debug = require('debug')('hotkey');
var App = require('lib/config/application');

var HotKeys = Behavior.extend({

  initialize: function() {
    this.keys = [];

    this.hotkeys = Radio.request('entities', 'get', {
      type: 'option',
      name: 'hotkeys'
    }) || {};
  },

  /**
   *
   */
  onRender: function(){
    var self = this, view = this.view;

    _.each( view.keyEvents, function(callback, id) {
      var hotkey = _.get(self.hotkeys, id);
      callback = _.isFunction(callback) ? callback : view[callback];

      if(!hotkey || !callback){
        return debug('hotkey not found: ' + id, view.keyEvents);
      }

      Radio.request('keypress', 'register', hotkey.key, callback.bind(view));
      self.keys.push(hotkey.key);
    });
  },

  onDestroy: function(){
    Radio.request('keypress', 'unregister', this.keys);
  }

});

module.exports = HotKeys;
App.prototype.set('Behaviors.HotKeys', HotKeys);