var FormView = require('lib/config/form-view');
var $ = require('jquery');
var _ = require('lodash');
var Numpad = require('lib/components/numpad/behavior');
var Utils = require('lib/utilities/utils');
var polyglot = require('lib/utilities/polyglot');
var hbs = require('handlebars');

module.exports = FormView.extend({

  initialize: function() {
    this.template = hbs.compile( this.model.get('payment_fields') );
    this.order_total = this.model.collection.order.get('total');
    this.updateStatusMessage();
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
    this.$el.hide().slideDown(250);

    if(window.Modernizr.touch){
      this.$('#pos-cash-tendered').attr('readonly', true);
      this.$('#pos-cashback').attr('readonly', true);
    }
  },

  remove: function() {
    this.$el.slideUp( 250, function() {
      FormView.prototype.remove.call(this);
    }.bind(this));
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
  }

});