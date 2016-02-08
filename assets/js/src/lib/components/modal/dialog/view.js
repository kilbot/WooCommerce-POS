var ItemView = require('lib/config/item-view');
var hbs = require('handlebars');

module.exports = ItemView.extend({

  template: hbs.compile('<p>{{{message}}}</p>'),

  initialize: function(options){
    this.mergeOptions( options, ['message'] );
  },

  templateHelpers: function(){
    return {
      message: this.message
    };
  }

});