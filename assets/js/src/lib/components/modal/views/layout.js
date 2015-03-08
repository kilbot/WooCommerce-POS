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
    var view = new Buttons(options),
        actions = _.pluck(options.buttons, 'action'),
        events = {};

    // register action events and pass them to the currentView
    _.each(actions, function(action){
      events['action:' + action] = function(){
        this.content.currentView.trigger('action:' + action);
      };
    }, this);

    this.listenTo(view, events);

    this.footer.show(view);
  },

  modalTitle: function(title){
    title = title || this.$('.modal-header h1').data('title');
    this.$('.modal-header h1').html(title);
  },

  modalClassName: function(className){
    if(className){
      this.$('.modal-dialog').addClass(className);
    }
  }

});