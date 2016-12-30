var Behavior = require('lib/config/behavior');
var _ = require('lodash');
var App = require('lib/config/application');
var Radio = require('backbone.radio');

var Filter = Behavior.extend({

  /**
   * @todo - Filter behavior with Hotkey behavior won't work because of view.keyEvents lookup
   */
  initialize: function(){
    var hotkeys = Radio.request('entities', 'get', {
      type: 'option',
      name: 'hotkeys'
    }) || {};
    this.syncHotkey = _.get(hotkeys, ['sync', 'key']);
    Radio.request('keypress', 'register', this.syncHotkey, this.sync.bind(this));
  },

  ui: {
    searchField : 'input[type=search]',
    clearBtn    : '.clear',
    clear       : '*[data-action="clear"]',
    sync        : '*[data-action="sync"]'
  },

  events: {
    'keyup @ui.searchField' : 'query',
    'click @ui.clear'       : 'clear',
    'click @ui.sync'        : 'sync'
  },

  /**
   *
   */
  query: function(){
    var value = this.ui.searchField.val();
    if( value === '' ){
      return this.clear();
    }

    // special case, filter mode, eg: barcode
    if(this.view._mode){
      value = [{
        type  : 'prefix',
        prefix: this.view._mode,
        query : value
      }];
    }

    this.ui.clearBtn.show();
    this._query(value);
  },

  /**
   *
   */
  _query: _.debounce( function(value){
    this.view.collection
      .setQuery('search', value)
      .fetch();
  }, 149),

  /**
   *
   */
  clear: function(e) {
    if(e) { e.preventDefault(); }
    this.view.collection
      .removeQuery('search')
      .fetch();
    this.ui.searchField.val('');
    this.ui.clearBtn.hide();
  },

  /**
   * why doesn't this work?!
   */
  onRender: function(){
    // if(this.view.collection.hasQuery('search')){
    //  // set ui.searchField
    // }
  },

  sync: function(e){
    if(e) { e.preventDefault(); }
    var icon = this.ui.sync.children('i');
    icon.addClass('icon-spin');

    this.view.collection
      .fullSync()
      .then(function(){
        icon.removeClass('icon-spin');
      });
  },

  syncStart: function(){
    this.ui.sync.children('i').addClass('icon-spin');
  },

  syncEnd: function(){
    this.ui.sync.children('i').removeClass('icon-spin');
  },

  onClear: function(){
    this.clear();
  },

  onDestroy: function(){
    Radio.request('keypress', 'unregister', this.syncHotkey);
  }

});

module.exports = Filter;
App.prototype.set('Behaviors.Filter', Filter);