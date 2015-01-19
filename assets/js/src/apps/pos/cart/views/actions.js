var ItemView = require('lib/config/item-view');
var $ = require('jquery');
var hbs = require('handlebars');

module.exports = ItemView.extend({

  initialize: function(){
    this.template = hbs.compile( $('#tmpl-cart-actions').html() );
  },

  events: {
    'click a': 'onButtonClicked'
  },

  onButtonClicked: function(e){
    e.preventDefault();
    var args = {
      action: $(e.target).data('action'),
      title: $(e.target).data('title')
    }
    this.trigger('button:clicked', args);
  }

});