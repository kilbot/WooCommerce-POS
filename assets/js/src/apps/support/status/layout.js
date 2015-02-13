var LayoutView = require('lib/config/layout-view');
var POS = require('lib/utilities/global');

var Layout = LayoutView.extend({
  template: function(){
    return '' +
      '<div class="list-header"><h4></h4></div>' +
      '<div class="list"></div>' +
      '<div class="list-footer"></div>';
  },

  tagName: 'section',

  regions: {
    header   : '.list-header',
    status   : '.list',
    footer   : '.list-footer'
  },

  attributes: {
    'class'  : 'module status-module'
  },

  onRender: function(){
    var title = $('#tmpl-pos-status').data('title');
    this.$('.list-header h4').text(title);
  }

});

module.exports = Layout;
POS.attach('SupportApp.Views.Layout', Layout);