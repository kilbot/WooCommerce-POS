var FormView = require('lib/config/form-view');
var $ = require('jquery');
var _ = require('lodash');
var Numpad = require('lib/components/numpad/behavior');
var Utils = require('lib/utilities/utils');
var polyglot = require('lib/utilities/polyglot');
var hbs = require('handlebars');
var App = require('lib/config/application');
var Radio = require('backbone.radio');

var View = FormView.extend({

  tagName: 'form',

  attributes: {
    style: 'display:none' // start drawer closed
  },

  initialize: function() {
    this.template = hbs.compile( this.model.getPaymentFields() );
    this.order_total = this.model.collection.order.get('total');
    this.updateStatusMessage();

    // alert third party plugins that gateway has init
    Radio.trigger( 'checkout', 'gateway:init:' + this.model.id, this );
  },

  templateHelpers: function(){
    return {
      total: this.order_total
    };
  },

  behaviors: {
    Numpad: {
      behaviorClass: Numpad
    }
  },

  modelEvents: {
    'change:message': 'updateStatusMessage'
  },

  onRender: function(){
    var self = this;

    if(this.model.id === 'pos_cash'){
      return this.posCashRender();
    }

    if(this.model.id === 'pos_card'){
      return this.posCardRender();
    }

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

  posCashRender: function(){
    this.addBinding(null, {
      '#pos-cash-tendered': {
        observe: 'pos-cash-tendered',
        onGet: function(value){
          this.calcChange(value);
          return Utils.formatNumber(value);
        },
        onSet: function(value){
          var val = Utils.unformat(value);
          this.calcChange(val);
          return val;
        },
        initialize: function($el, model){
          if(!model.get('pos-cash-tendered')){
            model.set({ 'pos-cash-tendered': this.order_total });
          }
        }
      }
    });
  },

  posCardRender: function(){
    this.addBinding(null, {
      '#pos-cashback': {
        observe: 'pos-cashback',
        onGet: Utils.formatNumber,
        onSet: Utils.unformat
      }
    });
  },

  onShow: function() {
    // allow third party to setup before show
    $.when( this.deferShow.call( this ) )
      .then( this.slideDown.bind(this) );

    if(window.Modernizr.touch){
      this.$('#pos-cash-tendered').attr('readonly', true);
      this.$('#pos-cashback').attr('readonly', true);
    }
  },

  slideDown: function(){
    this.$el.slideDown(250);
  },

  remove: function() {
    // allow third party to setup before remove
    this.slideUp();

    $.when( this.deferRemove.call( this ) )
      .then( FormView.prototype.remove.bind(this) );
  },

  slideUp: function(){
    return this.$el.slideUp( 250 );
  },

  calcChange: function(tendered){
    var change = tendered - this.order_total;
    var msg = polyglot.t('titles.change') + ': ' + Utils.formatMoney(change);
    this.model.set({ message: msg, 'pos-cash-change': change });
  },

  updateStatusMessage: function(){
    this.model.collection.order.set({
      'payment_details.message': this.model.get('message')
    });
  },

  /**
   * Allow third party gateways to setup, teardown and submit payment details
   */
  deferShow: function(){},
  deferRemove: function(){}

});

module.exports = View;
App.prototype.set('POSApp.Checkout.Views.Gateways.Drawer', View);