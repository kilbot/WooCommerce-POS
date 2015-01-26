var ItemView = require('lib/config/item-view');
var $ = require('jquery');
var hbs = require('handlebars');

module.exports = ItemView.extend({

  initialize: function(){
    this.template = hbs.compile( $('#tmpl-cart-actions').html() );
  },

  ui: {
    btn: 'a[data-action!=""]'
  },

  events: {
    'click @ui.btn': 'onButtonClick'
  },

  onButtonClick: function(e){
    e.preventDefault();
    var action = $(e.target).data('action');
    var title = $(e.target).data('title');
    this.trigger(action, title);
  }

});