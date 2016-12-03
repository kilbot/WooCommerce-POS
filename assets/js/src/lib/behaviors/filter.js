var Behavior = require('lib/config/behavior');
var _ = require('lodash');
var App = require('lib/config/application');
var Combokeys = require('combokeys');
var Radio = require('backbone.radio');

var Filter = Behavior.extend({

  initialize: function(){
    this.hotkeys = Radio.request('entities', 'get', {
      type: 'option',
      name: 'hotkeys'
    }) || {};

    this.combokeys = new Combokeys(document.documentElement);
    this.combokeys.bind(this.hotkeys.sync.key, this.sync.bind(this));
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
   *
   */
  onRender: function(){
    //if(this.view.collection.hasFilter('search')){
    //  var queryStr = this.view.collection._filtered._query;
    //  if(queryStr){
    //    this.ui.searchField.val(queryStr).trigger('keyup');
    //  }
    //}
  },

  sync: function(e){
    if(e) { e.preventDefault(); }
    this.view.collection.fullSync();
  },

  syncStart: function(){
    this.ui.sync.children('i').addClass('icon-spin');
  },

  syncEnd: function(){
    this.ui.sync.children('i').removeClass('icon-spin');
  },

  onDestroy: function(){
    this.combokeys.unbind(this.hotkeys.sync.key);
  },

  onClear: function(){
    this.clear();
  }

});

module.exports = Filter;
App.prototype.set('Behaviors.Filter', Filter);