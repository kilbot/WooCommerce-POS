var LayoutView = require('lib/config/layout-view');
var App = require('lib/config/application');
var polyglot = require('lib/utilities/polyglot');

var Layout = LayoutView.extend({
  template: function(){
    var title = polyglot.t('titles.system-status');
    return '' +
      '<div class="panel-header status-header">' +
      '<div><h4>' + title + '</h4></div></div>' +
      '<div class="panel-body list status-list"></div>';
  },

  regions: {
    header   : '.status-header',
    status   : '.status-list'
  },

  attributes: {
    'class'  : 'panel status'
  }

});

module.exports = Layout;
App.prototype.set('SupportApp.Views.Layout', Layout);