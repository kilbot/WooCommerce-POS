var Behavior = require('lib/config/behavior');
var App = require('lib/config/application');
var $ = require('jquery');
var _ = require('lodash');
var polyglot = require('lib/utilities/polyglot');
var d = 'disabled';

/**
 * @todo refactor
 * Button behavior here is a little too specific, can't be reused
 */

var Buttons = Behavior.extend({
  loadingText: polyglot.t('messages.loading'),

  ui: {
    btns    : '.btn',
    action  : '[data-action]',
    toggle  : '[data-toggle]',
    message : '.message'
  },

  events: {
    'click @ui.action': 'action',
    'click @ui.toggle': 'toggle',
    'state @ui.btns'  : 'setState'
  },

  namespace: function( str ){
    // test for wp-admin
    if(window.adminpage){
      str = 'wc_pos-' + str;
    }
    return str;
  },

  action: function(e){
    e.preventDefault();
    var action = $(e.target).data('action');
    this.view.triggerMethod('action:' + action, $(e.target), action);
    //this.view.trigger('action:' + action, $(e.target), this.view, action );
  },

  toggle: function(e){
    e.preventDefault();
    this.enable().disable($(e.target));
    var toggle = $(e.target).data('toggle');
    this.view.triggerMethod('toggle:' + toggle, $(e.target), toggle);
    //this.view.trigger('toggle:' + toggle, $(e.target), this.view, toggle);
  },

  enable: function(btn){
    if(btn){
      btn.removeClass(d).prop(d, false);
    } else {
      this.ui.btns.each(function(){
        $(this).removeClass(d).prop(d, false);
      });
    }
    return this;
  },

  disable: function(btn){
    if(btn){
      btn.addClass(d).prop(d, true);
    } else {
      this.ui.btns.each(function(){
        $(this).addClass(d).prop(d, true);
      });
    }
    return this;
  },

  setState: function(e, state, message){
    var btn = $(e.target),
        prop = state === 'loading' ? 'disable' : 'enable';
    this[prop]();
    this.updateText(btn);
    if( btn.is('input') ){
      this.updateInput(btn, state);
    } else {
      this.updateIcon(btn, state);
    }
    if(message !== undefined){
      this.updateMessage(message, state);
    }
  },

  updateText: function(btn){
    if(btn.data('loading') === undefined){ return; }
    var val  = btn.is('input') ? 'val' : 'html';
    var text = btn[val]();
    var loadingText = btn.data('loading') || this.loadingText;
    btn.data('loading', text);
    btn[val](loadingText);
  },

  updateIcon: function(btn, state){
    if(btn.data('icon') === undefined){ return; }
    var pos = btn.data('icon') || 'prepend';
    var icon = state !== 'reset' ? this.icon(state) : '';
    btn.children('i').remove();
    btn[pos](icon);
  },

  icon: function(state){
    return '<i class="' + this.namespace( 'icon-' + state ) + '"></i>';
  },

  updateInput: function(btn, state){
    var classes = _.map(['loading', 'success', 'error'], this.namespace )
      .join(' ');
    btn.removeClass( classes );
    if(state !== 'reset'){
      btn.addClass(state);
    }
  },

  /* jshint -W071 */
  updateMessage: function(message, state){
    if(message === null){
      message = polyglot.t('messages.' + state);
    }
    if(!state){
      state = message;
      message = polyglot.t('messages.' + message);
    }
    if(state === 'reset'){
      message = '';
    }

    var classes = _.map(
      ['text-loading', 'text-success', 'text-error'], this.namespace
    ).join(' ');

    this.ui.message
      .removeClass( classes )
      .addClass( this.namespace( 'text-' + state ) )
      .html(message);
  },
  /* jshint +W071 */

  onMessage: function(message, state){
    this.updateMessage(message, state);
  },

  onDisableButtons: function(){
    this.disable();
  },

  onEnableButtons: function(){
    this.enable();
  }

});

module.exports = Buttons;
App.prototype.set('Behaviors.Buttons', Buttons);