var hbs = require('handlebars');
var ItemView = require('lib/config/item-view');
var Tmpl = require('./tab.hbs');

var View = ItemView.extend({

  tagName: 'li',

  template: hbs.compile(Tmpl),

  activeClassName: 'active',

  initialize: function( options ){
    this.mergeOptions( options, ['activeClassName'] );

    // add active className
    if( this.model.get('active') ){
      this.$el.addClass( this.activeClassName );
    }
  },

  modelEvents: {
    'change:active': 'toggleActive',
    'change:label' : 'render' // why does this not auto render?!
  },

  toggleActive: function(){
    this.$el.toggleClass(this.activeClassName, this.model.get('active'));
  },

  triggers: {
    'click': 'tab:clicked',
    'click *[data-action="remove"]': 'remove:tab'
  },

  onTabClicked: function () {
    this.model.set({active: true});
  },

  onRemoveTab: function(){
    this.model.collection.remove(this.model);
  }

});

module.exports = View;