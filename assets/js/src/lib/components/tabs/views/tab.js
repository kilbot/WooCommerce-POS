var hbs = require('handlebars');
var ItemView = require('lib/config/item-view');
var Tmpl = require('./tab.hbs');

var View = ItemView.extend({
  tagName: 'li',
  template: hbs.compile(Tmpl),

  className: function () {
    if (this.model.get('active')) {
      return 'active';
    }
  },

  modelEvents: {
    'change:active': 'toggleActive',
    'change:label' : 'render' // why does this not auto render?!
  },

  toggleActive: function(){
    this.$el.toggleClass('active', this.model.get('active'));
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