var LayoutView = require('lib/config/layout-view');
var App = require('lib/config/application');
var polyglot = require('lib/utilities/polyglot');

var Layout = LayoutView.extend({
  template: function(){
    var title = polyglot.t('titles.system-status');
    return '' +
      '<div class="list-header"><div><h4>' + title + '</h4></div></div>' +
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
  }

});

module.exports = Layout;
App.prototype.set('SupportApp.Views.Layout', Layout);