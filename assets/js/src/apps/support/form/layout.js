var LayoutView = require('lib/config/layout-view');
var App = require('lib/config/application');
var polyglot = require('lib/utilities/polyglot');

var Layout = LayoutView.extend({
  template: function(){
    var title = polyglot.t('titles.support-form');
    return '' +
      '<div class="list-header support-header">' +
      '<div><h4>' + title + '</h4></div></div>' +
      '<div class="panel-body list support-list"></div>' +
      '<div class="list-actions support-actions"></div>';
  },

  regions: {
    header   : '.support-header',
    form     : '.support-list',
    actions  : '.support-actions'
  },

  attributes: {
    'class'  : 'panel support'
  }

});

module.exports = Layout;
App.prototype.set('SupportApp.Views.Layout', Layout);