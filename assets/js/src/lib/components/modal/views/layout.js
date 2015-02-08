var LayoutView = require('lib/config/layout-view');
var Header = require('./header');
var Buttons = require('lib/components/buttons/view');
var _ = require('lodash');
var $ = require('jquery');
var Radio = require('backbone.radio');
var debug = require('debug')('modalLayout');
require('bootstrap-sass/assets/javascripts/bootstrap/modal');
require('bootstrap-sass/assets/javascripts/bootstrap/transition');

module.exports = LayoutView.extend({
  template: function(){
    return '<div class="modal-dialog">' +
      '<div class="modal-content">' +
        '<div class="modal-header"></div>' +
        '<div class="modal-body"></div>' +
        '<div class="modal-footer"></div>' +
      '</div>' +
    '</div>';
  },
  className: 'modal',
  attributes: {
    'tabindex' : -1,
    'role' : 'dialog'
  },

  regions: {
    header  : '.modal-header',
    content : '.modal-body',
    footer  : '.modal-footer'
  },

  initialize: function () {
    this.$el.modal({ show: false, backdrop: 'static' });
  },

  events: {
    'click [data-action="close"]' : function(e){
      e.preventDefault();
      Radio.request('modal', 'close');
    }
  },

  triggers: {
    'show.bs.modal'   : { preventDefault: false, event: 'before:open' },
    'shown.bs.modal'  : { preventDefault: false, event: 'open' },
    'hide.bs.modal'   : { preventDefault: false, event: 'before:close' },
    'hidden.bs.modal' : { preventDefault: false, event: 'close' }
  },

  open: function(view){
    var deferred = $.Deferred();
    this.once('open', deferred.resolve);
    this.setup(view);
    this.content.show(view);
    this.$el.modal('show');
    return deferred;
  },

  close: function() {
    var deferred = $.Deferred();
    this.once('close', function() {
      this.content.empty();
      this.footer.empty();
      deferred.resolve();
    });
    this.$el.modal('hide');
    return deferred;
  },

  setup: function(view){
    var attributes = view.modal || {};

    _.defaults(attributes, {
      header: {},
      footer: {}
    });

    _.each(attributes, function(attr, key){
      var method = $.camelCase('modal-' + key);
      if(this[method]){
        this[method](attr);
      } else {
        debug('no method matching ' + method);
      }
    }, this);
  },

  update: function(options){
    options = options || {};
    _.each(options, function(attr, key){
      this[key].currentView.triggerMethod('Update', attr);
    }, this);
  },

  modalHeader: function(options){
    var view = new Header(options);
    this.header.show(view);
  },

  modalFooter: function(options){
    var view = new Buttons(options);

    this.listenTo(view, 'action:save', function(){
      this.content.currentView.trigger('action:save');
    });

    this.footer.show(view);
  },

  modalTitle: function(title){
    title = title || this.$('.modal-header h1').data('title');
    this.$('.modal-header h1').html(title);
  },

  modalSize: function(size){
    var className = {
      small: 'modal-sm',
      large: 'modal-lg'
    };
    if(className[size]){
      this.$('.modal-dialog').addClass(className[size]);
    }
  }

  //
  //openModal: function (options) {
  //  options = options || {};
  //  this.once('after:show', options.callback); // 'after:show' = 'show' ??
  //  this.setupModal(options);
  //  this.$el.modal('show');
  //},
  //
  //destroyModal: function (options) {
  //  options = options || {};
  //  this.once('hide', options.callback);
  //  this.once('hide', this.teardownModal);
  //  this.$el.modal('hide');
  //},
  //
  //setupModal: function (options) {
  //  options = options || {};
  //  if (this.isShown) {
  //    this.teardownModal();
  //  }
  //
  //  // pass on attributes
  //  if( options.attributes ){
  //
  //    // modal class
  //    if( options.attributes.className ){
  //      this.$('.modal-dialog').addClass( options.attributes.className );
  //    }
  //
  //    // modal title
  //    if( options.attributes.title ) {
  //      this.$('.modal-header h1').html( options.attributes.title );
  //    }
  //  }
  //
  //  this.content.show(options.view);
  //  this.isShown = true;
  //
  //  if( options.view.model ) {
  //    this.listenTo(options.view.model, 'save:status', this.updateSaveStatus);
  //  }
  //
  //},
  //
  //teardownModal: function () {
  //  if (!this.isShown) {
  //    return;
  //  }
  //  this.content.empty();
  //  this.render(); // re-render to reset attributes
  //  this.isShown = false;
  //},
  //
  //saving: function(){
  //  this.$('.modal-footer .action-save')
  //      .addClass( 'disabled' );
  //
  //  this.$('.modal-footer p.response')
  //      .removeClass('success error')
  //      .html( '<i class="icon icon-spinner"></i>' );
  //},
  //
  //updateSaveStatus: function( status, message ){
  //  if( _.isUndefined(message) ){
  //    message = this.$('.modal-footer p.response').data(status);
  //  }
  //
  //  this.$('.modal-footer p.response')
  //      .addClass(status)
  //      .html( '<i class="icon icon-' + status + '"></i> ' + message );
  //
  //  this.$('.modal-footer .action-save')
  //      .removeClass( 'disabled' );
  //}

});