var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var Filter = require('lib/components/filter/behavior');
var HotKeys = require('lib/components/hotkeys/behavior');
var hbs = require('handlebars');
var $ = require('jquery');

var Actions = ItemView.extend({

  initialize: function(){
    this.template = hbs.compile( $('#tmpl-products-filter').html() );
  },

  behaviors: {
    Filter: {
      behaviorClass: Filter
    },
    HotKeys: {
      behaviorClass: HotKeys
    }
  },

  ui: {
    sync: '*[data-action="sync"]'
  },

  triggers: {
    'click @ui.sync': 'sync:products'
  },

  keyEvents: {
    'sync': function(){
      this.trigger('sync:products');
    }
  }

});

module.exports = Actions;
POS.attach('POSApp.Products.Actions', Actions);