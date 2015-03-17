var ItemView = require('./item-view');
var POS = require('lib/utilities/global');
var Filter = require('lib/components/filter/behavior');
var HotKeys = require('lib/components/hotkeys/behavior');
var _ = require('lodash');

module.exports = POS.FilterView = ItemView.extend({

  constructor: function(options) {
    options = options || {};

    this.listenTo(options.collection.superset(), {
      'fullSync:start': this.syncStart,
      'fullSync:end': this.syncEnd
    });

    // extend behaviours
    _.extend(this.behaviors, {
      Filter  : { behaviorClass: Filter },
      HotKeys : { behaviorClass: HotKeys }
    });

    // extend ui
    _.extend(this.ui, {
      sync: '*[data-action="sync"]'
    });

    // extend events
    _.extend(this.events, {
      'click @ui.sync': 'sync'
    });

    // extend keyEvents
    _.extend(this.keyEvents, {
      'sync': this.sync
    });

    return ItemView.prototype.constructor.apply(this, arguments);
  },

  behaviors : {},
  ui        : {},
  events    : {},
  keyEvents : {},

  sync: function(e){
    if(e) { e.preventDefault(); }
    this.collection.superset().fullSync();
  },

  syncStart: function(){
    this.ui.sync.children('.icon').addClass('icon-spin');
  },

  syncEnd: function(){
    this.ui.sync.children('.icon').removeClass('icon-spin');
  }

});