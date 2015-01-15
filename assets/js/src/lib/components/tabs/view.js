var ItemView = require('lib/config/item-view');
var CollectionView = require('lib/config/collection-view');
var Handlebars = require('handlebars');
var Collection = require('./entities');
var POS = require('lib/utilities/global');

var Tab = ItemView.extend({
  tagName: 'li',

  initialize: function () {
    this.template = Handlebars.compile('' +
      '{{#unless fixed}}' +
      '<a href="#">' +
        '<i class="icon icon-times-circle action-remove"></i>' +
      '</a>' +
      '{{/unless}}' +
      '{{{ label }}}'
    );
  },

  className: function () {
    if (this.model.get('active')) {
      return 'active';
    }
  },

  triggers: {
    'click': 'tab:clicked',
    'click .action-remove': 'tab:removed'
  },

  onTabClicked: function () {
    if (!this.model.get('active')) {
      this.model.set({active: true});
    }
  }

});

var Tabs = CollectionView.extend({
  tagName: 'ul',
  childView: Tab,
  // className: 'nav nav-tabs',
  attributes: {
    'role' : 'tablist'
  },

  collectionEvents: {
    'change:active change:label' : 'render'
  },

  initialize: function(options) {
    this.collection = new Collection( options.collection );

    this.on( 'childview:tab:removed', function( childview, args ) {
      this.collection.remove( args.model );
    });
  }

});

module.exports = Tabs;
POS.attach('Components.Tabs.View', Tabs);