var LayoutView = require('lib/config/layout-view');
var POS = require('lib/utilities/global');
var $ = require('jquery');

var Layout = LayoutView.extend({
  template: function(){
    return '' +
      '<div class="list-header"><div><h4></h4></div></div>' +
      '<div class="list"></div>' +
      '<div class="list-actions"></div>' +
      '<div class="list-footer"></div>';
  },

  tagName: 'section',

  regions: {
    header   : '.list-header',
    form     : '.list',
    actions  : '.list-actions',
    footer   : '.list-footer'
  },

  attributes: {
    'class'  : 'module support-module'
  },

  onRender: function(){
    var title = $('#tmpl-support-form').data('title');
    this.$('.list-header h4').text(title);
  }

});

module.exports = Layout;
POS.attach('SupportApp.Views.Layout', Layout);