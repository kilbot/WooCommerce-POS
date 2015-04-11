var ItemView = require('lib/config/item-view');
var $ = require('jquery');
var Tmpl = require('./status.hbs');
var hbs = require('handlebars');

module.exports = ItemView.extend({
  tagName: 'ul',
  template: hbs.compile(Tmpl),

  ui: {
    toggle: '.toggle',
    btn   : '.btn'
  },

  events: {
    'click @ui.toggle': 'toggleReport',
    'click @ui.btn'   : 'buttonClick'
  },

  onRender: function(){
    this.$el.prepend( $('#tmpl-pos-status').html() );
  },

  templateHelpers: function(){
    var data = this.collection.toJSON();
    return { tests: data };
  },

  toggleReport: function(e){
    e.preventDefault();
    $(e.currentTarget).next('textarea').toggle();
  },

  buttonClick: function(e){
    var action = $(e.target).data('action').split('-'),
        key = action.shift();

    if(key){
      e.preventDefault();
      this.trigger('action:' + key, action[0]);
    }
  }

});