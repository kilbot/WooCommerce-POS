var Route = require('lib/config/route');
var App = require('lib/config/application');
var View = require('./view');
var TranslationModal = require('./modal/translation-update');
var DataDeleteModal = require('./modal/delete-local-data');
var Radio = require('backbone.radio');

var Tools = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.model = options.model;
  },

  render: function() {
    var view = new View({ model: this.model });
    this.listenTo(view, {
      'translation:update': this.openTranslationModal,
      'data:delete'       : this.openDataDeleteModal
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

    var modal = Radio.request('modal', 'open', view);

    this.listenTo( view, 'update:complete', function(){
      modal.currentView.getRegion('footerRegion').$el.show();
    });
  },

  openDataDeleteModal: function(args){
    var title = args.view
      .$('[data-action="delete-local-data"]')
      .data('title');

    var view = new DataDeleteModal({
      title: title
    });
    Radio.request('modal', 'open', view);
  }

});

module.exports = Tools;
App.prototype.set('SettingsApp.Tools.Route', Tools);