var ItemView = require('lib/config/item-view');
var $ = require('jquery');
var EmulateHTTP = require('lib/behaviors/emulateHTTP');
var Tmpl = require('./storage.hbs');
var hbs = require('handlebars');

module.exports = ItemView.extend({
  tagName: 'ul',
  template: 'support.status',

  ui: {
    toggle      : '.toggle',
    btn         : '.btn',
    subHeading  : '.sub-heading'
  },

  events: {
    'click @ui.toggle': 'toggleReport',
    'click @ui.btn'   : 'buttonClick'
  },

  behaviors: {
    EmulateHTTP: {
      behaviorClass: EmulateHTTP
    }
  },

  onRender: function(){
    var storage = hbs.compile(Tmpl)({ storage: this.options.storage });
    this.ui.subHeading.after(storage);
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