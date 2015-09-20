var Route = require('lib/config/route');
var App = require('lib/config/application');
var View = require('./view');
var TranslationModal = require('./modal/translation-update');
var Radio = require('backbone.radio');

var Tools = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
  },

  render: function() {
    var view = new View();
    this.listenTo(view, {
      'translation:update': this.openTranslationModal
    });
    this.container.show(view);
  },

  openTranslationModal: function(args){
    var title = args.view
      .$('[data-action="translation"]')
      .data('title');

    var view = new TranslationModal({
      title: title
    });
    Radio.request('modal', 'open', view);
  }

});

module.exports = Tools;
App.prototype.set('SettingsApp.Tools.Route', Tools);