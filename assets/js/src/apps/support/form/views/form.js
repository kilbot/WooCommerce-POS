var ItemView = require('lib/config/item-view');
var $ = require('jquery');

module.exports = ItemView.extend({
  tagName: 'ul',
  template: '#tmpl-support-form',

  ui: {
    toggle : '.toggle',
    status : '#pos_status'
  },

  events: {
    'click @ui.toggle': 'toggleReport'
  },

  onRender: function(){
    this.ui.status.append('\n*** Browser Info ***\n\n' +
    navigator.userAgent + '; ' + $('html').attr('class') + '\n\n');
  },

  toggleReport: function(e){
    e.preventDefault();
    $(e.currentTarget).next('textarea').toggle();
  }

});