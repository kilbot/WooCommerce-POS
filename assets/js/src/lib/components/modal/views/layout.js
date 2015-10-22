var LayoutView = require('lib/config/layout-view');
var Header = require('./header');
var _ = require('lodash');
var $ = require('jquery');
var hbs = require('handlebars');
var Tmpl = require('./modal.hbs');
var Radio = require('backbone.radio');
var debug = require('debug')('modalLayout');
var App = require('lib/config/application');
require('bootstrap/dist/js/umd/modal');

module.exports = LayoutView.extend({
  template: hbs.compile(Tmpl),

  // if wp-admin, add css prefix
  className: function(){
    return App.prototype.namespace('modal');
  },

  attributes: {
    'tabindex' : -1,
    'role' : 'dialog'
  },

  buttons: [
    {
      type: 'message'
    },{
      action: 'save',
      icon: 'prepend',
      className: 'btn-primary'
    }
  ],

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
      this.tearDown();
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

  tearDown: function(){
    this.header.empty();
    this.content.empty();
    this.footer.empty();
    this.$('.modal-dialog').removeClass().addClass('modal-dialog');
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
    options.buttons = options.buttons || this.buttons;
    var view = Radio.request('buttons', 'view', options);
    this.footer.show(view);
  },

  modalTitle: function(title){
    //title = title || this.$('.modal-header h1').data('title');
    this.$('.modal-header h1').html(title);
  },

  modalClassName: function(className){
    if(className){
      this.$('.modal-dialog').addClass(className);
    }
  },

  getButtons: function(){
    return this.getRegion('footer').currentView;
  }

});