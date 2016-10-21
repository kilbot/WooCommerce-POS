var FormView = require('lib/config/form-view');
var $ = require('jquery');
var _ = require('lodash');
var Numpad = require('lib/components/numpad/behavior');
var App = require('lib/config/application');
var Radio = require('backbone.radio');

var View = FormView.extend({

  tagName: 'form',

  attributes: {
    style: 'display:none' // start drawer closed
  },

  /**
   * Trigger event for gateway integrations
   */
  constructor: function( options ){
    options = options || {};
    if( options.model ){
      Radio.trigger( 'checkout', 'gateway:' + options.model.id, this );
    }
    FormView.apply( this, arguments );
  },

  /**
   * Make some order attributes available to gateway templates
   */
  templateHelpers: function(){
    return {
      total: this.model.collection.order.get('total')
    };
  },

  behaviors: {
    Numpad: {
      behaviorClass: Numpad
    }
  },

  onRender: function(){
    var self = this;

    /**
     * bind form elements
     */
    this.$('input, select, textarea').each(function(){
      var name = $(this).attr('name'),
        id = $(this).attr('id'),
        data = $(this).data();

      if(name){
        return self.addBinding(null, '*[name="' + name + '"]', name);
      }
      if(id){
        return self.addBinding(null, '#' + id, id);
      }
      if(_.size(data) === 1){
        var prop = Object.keys(data)[0];
        return self.addBinding(
          null,
          '*[data-' + prop + '="' + data[prop] + '"]',
          data[prop]
        );
      }

    });
  },

  onShow: function() {
    this.$el.slideDown(250);

    /**
     * Allow integrations to setup
     */
    this.model.onShow(this);
  },

  remove: function() {
    this.$el.slideUp( 250, function() {
      FormView.prototype.remove.call(this);
    }.bind(this));
  },

  /**
   * Allow integrations to teardown
   */
  onDestroy: function(){
    this.model.onDestroy(this);
  }

});

module.exports = View;
App.prototype.set('POSApp.Checkout.Views.Gateways.Drawer', View);