var ItemView = require('lib/config/item-view');
var hbs = require('handlebars');
var Tmpl = require('./gateway.hbs');

module.exports = ItemView.extend({

  template: hbs.compile(Tmpl),

  events: {
    'click': function(){
      this.model.set({ active: true });
    }
  },

  templateHelpers: function(){
    return {
      icons: this.model.getIcons()
    };
  }
});