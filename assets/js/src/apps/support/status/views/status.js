var ItemView = require('lib/config/item-view');
var $ = require('jquery');
var Tmpl = require('./status.hbs');
var hbs = require('handlebars');
var polyglot = require('lib/utilities/polyglot');

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

  templateHelpers: function(){
    return {
      'sub-heading': polyglot.t('titles.local-storage'),
      tests: this.options.tests,
      storage: this.options.storage
    };
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