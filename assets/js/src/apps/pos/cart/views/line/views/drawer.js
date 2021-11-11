var FormView = require('lib/config/form-view');
var Utils = require('lib/utilities/utils');
var AutoGrow = require('lib/behaviors/autogrow');
var Numpad = require('lib/components/numpad/behavior');
var $ = require('jquery');
var _ = require('lodash');
var bb = require('backbone');
var Radio = bb.Radio;

module.exports = FormView.extend({

  template: 'pos.cart.item-drawer',

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
    removeMeta  : '*[data-action="remove-meta"]',
    metaLabel   : 'input[name="meta.label"]',
    metaValue   : 'textarea[name="meta.value"]'
  },

  events: {
    'click @ui.addMeta'     : 'addMetaFields',
    'click @ui.removeMeta'  : 'removeMetaFields',
    'blur @ui.metaLabel'    : 'updateMeta',
    'blur @ui.metaValue'    : 'updateMeta',
    'blur input[id^=billing_]' : 'saveBilling',
    'blur select[id^=billing_]': 'saveBilling'
  },

  modelEvents: {
    'pulse': 'pulse'
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
            name: 'shipping'
          });
        },
        comparator: function(){}
      }
    }
  },

  onShow: function() {
    var el = $(this.$el);

    for (var key in this.model.attributes) {
      if (key.indexOf('billing_') !== -1) {
        el.find('#' + key).val(this.model.attributes[key]);
      }
    }

    this.$el.hide().slideDown(250);
  },

  remove: function() {
    this.$el.slideUp( 250, function() {
      FormView.prototype.remove.call(this);
    }.bind(this));
  },

  pulse: function(type){
    if(type === 'remove'){
      return this.$el.slideUp(250);
    }
  },

  saveBilling: function (e) {
    if (e.target.name.indexOf('billing_') !== -1) {
      this.model.save(e.target.name, e.target.value);
      this.calculateMandatory();
    }
  },

  calculateMandatory: function () {
    var el = $(this.$el).find("input[id^=billing_]");
    var valid = true;
    for ( var i = 0 ; i < el.length ; i++ ) {
      var e=el.get(i);

      if ( $(e).hasClass('required') && e.value==='') {
        valid = false;
        break;
      }
      // Check email address (which might not be mandatory)
      if (e.validity.valid === false) {
        valid = false;
        break;
      }
    }
    this.model.save("$valid", valid);
  },

  updateMeta: function(e) {
    var el        = $(e.target),
        name      = el.attr('name').split('.'),
        attribute = name[0],
        value     = el.val(),
        data      = {},
        self      = this;

    var newValue = function(){
      var key = el.parent('span').data('key');
      var meta = ( self.model.get('meta') || [] );

      // select row (or create new one)
      var row = _.where( meta, { 'key': key } );
      row = row.length > 0 ? row[0] : { 'key': key };
      row[ name[1] ] = value;

      // add the change row and make unique on key
      meta.push(row);
      return _.uniq( meta, 'key' );
    };

    if( name.length > 1 && attribute === 'meta' ) {
      value = newValue();
    }

    data[ attribute ] = value;

    this.model.save(data);
  },

  addMetaFields: function(e){
    e.preventDefault();

    var row = $(e.currentTarget).prev('span').data('key');
    var i = row ? row + 1 : 1 ;

    $('<span data-key="'+ i +'" />')
      .append('' +
        '<input class="form-control" type="text" name="meta.label">' +
        '<textarea class="form-control" name="meta.value"></textarea>' +
        '<a href="#" data-action="remove-meta">' +
        '<i class="icon-remove icon-lg"></i>' +
        '</a>'
      )
      .insertBefore( $(e.currentTarget) );
  },

  removeMetaFields: function(e){
    e.preventDefault();

    var row = $(e.currentTarget).parent('span'),
        meta = ( this.model.get('meta') || [] ),
        index = _.findIndex( meta, { 'key': row.data('key') } );

    if( index >= 0 ){
      meta.splice( index, 1 );
      this.model.save({ 'meta': meta });
      this.model.trigger('change:meta');
    }

    row.remove();
  }

});
