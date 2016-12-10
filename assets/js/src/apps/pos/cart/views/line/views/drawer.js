var FormView = require('lib/config/form-view');
var Utils = require('lib/utilities/utils');
var AutoGrow = require('lib/behaviors/autogrow');
var Numpad = require('lib/components/numpad/behavior');
var Radio = require('backbone.radio');
var _ = require('lodash');
var $ = require('jquery');
var App = require('lib/config/application');

var View = FormView.extend({

  template: 'pos.cart.item-drawer',

  attributes: {
    style: 'display:none' // start drawer closed
  },

  templateHelpers: function(){
    return {
      product   : this.model.type === 'product',
      shipping  : this.model.type === 'shipping',
      fee       : this.model.type === 'fee'
    };
  },

  behaviors: {
    AutoGrow: {
      behaviorClass: AutoGrow
    },
    Numpad: {
      behaviorClass: Numpad
    }
  },

  ui: {
    addMeta     : '*[data-action="add-meta"]',
    removeMeta  : '*[data-action="remove-meta"]'
  },

  events: {
    'click @ui.addMeta'     : 'addMeta',
    'click @ui.removeMeta'  : 'removeMeta'
  },

  bindings: {
    'input[name="regular_price"]' : {
      observe: 'regular_price',
      onGet: Utils.formatNumber,
      onSet: Utils.unformat
    },
    'input[name="taxable"]' : 'taxable',
    'select[name="tax_class"]' : {
      observe: 'tax_class',
      selectOptions: {
        collection: function(){
          return Radio.request('entities', 'get', {
            type: 'option',
            name: 'tax_classes'
          });
        }
      },
      attributes: [{
        name: 'disabled',
        observe: 'taxable',
        onGet: function(val) {
          return !val;
        }
      }]
    },
    'select[name="method_id"]': {
      observe: 'method_id',
      selectOptions: {
        collection: function(){
          return Radio.request('entities', 'get', {
            type: 'option',
            name: 'shipping.labels'
          });
        },
        comparator: function(){}
      }
    },
    '*[name^="meta"]': {
      observe: 'meta',
      events: ['blur'],
      update: function( $el, meta ){
        _.each( meta, function( row, idx ){
          this.$('input[name="meta.' + idx + '.label"]').val( row.label );
          this.$('textarea[name="meta.' + idx + '.value"]').val( row.value );
        }, this );
      },
      onSet: function(){
        var obj = {};
        this.$('*[name^="meta"]').each(function(){
          _.set( obj, $(this).attr('name'), $(this).val());
        });
        return obj.meta;
      }
    }
  },

  onShow: function() {
    this.$el.slideDown(250);
  },

  remove: function() {
    this.$el.slideUp( 250, function() {
      $(this).remove();
    });
  },

  addMeta: function(e){
    e.preventDefault();
    var meta = this.model.get('meta');
    if( !_.isArray(meta) ){
      meta = [];
    }
    meta = meta.slice();
    meta.push({ label: '', value: '' });

    this.model.set({ meta: meta })
      .render();
  },

  removeMeta: function(e) {
    e.preventDefault();
    var index = $(e.target).closest('span').data('index');
    var meta = this.model.get('meta');
    if( !_.isArray(meta) ){
      meta = [];
    }
    meta = meta.slice();
    _.pullAt( meta, index );

    this.model.set({ meta: meta })
      .render();
  }

});

module.exports = View;
App.prototype.set('POSApp.Cart.Views.Line.Drawer', View);