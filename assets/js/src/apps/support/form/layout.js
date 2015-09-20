var LayoutView = require('lib/config/layout-view');
var App = require('lib/config/application');
var polyglot = require('lib/utilities/polyglot');

var Layout = LayoutView.extend({
  template: function(){
    var title = polyglot.t('titles.support-form');
    return '' +
      '<div class="list-header"><div><h4>' + title + '</h4></div></div>' +
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
  }

});

module.exports = Layout;
App.prototype.set('SupportApp.Views.Layout', Layout);