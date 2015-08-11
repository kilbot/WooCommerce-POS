var IndexedDBCollection = require('lib/config/idb-collection');
var Model = require('./model');
var _ = require('lodash');
var bb = require('backbone');

module.exports = IndexedDBCollection.extend({
  model: Model,
  name: 'cart',
  indexes: [
    {name: 'local_id', keyPath: 'local_id', unique: true},
    {name: 'order', keyPath: 'order', unique: false},
    {name: 'type', keyPath: 'type', unique: false}
  ],

  /**
   * Whitelist of attributes taken from product model
   */
  productAttributes: [
    'order',
    'title',
    'local_id',
    'product_id',
    'type',
    'price',
    'regular_price',
    'sale_price',
    'taxable',
    'tax_status',
    'tax_class',
    'attributes',
    'meta',         // variation meta
    'method_title', // shipping
    'method_id'     // shipping
  ],

  comparator: function( model ){
    var type = model.get( 'type' );
    if( type === 'fee' ) { return 2; }
    if( type === 'shipping' ) { return 1; }
    return 0;
  },

  /**
   * If collection has order_id, query idb for index: 'order' = order_id
   * onSuccess add items to collection
   */
  fetchCartItems: function () {
    if(!this.order_id){
      return;
    }

    var onSuccess = this.add.bind(this);
    var keyRange = this.db.store.makeKeyRange({
      only: this.order_id
    });

    this.db.store.query(onSuccess, {
      index: 'order',
      keyRange: keyRange
    });
  },

  // convenience method to sum attributes in collection
  sum: function(attribute, type){
    var col = this.toJSON();
    if(type){ col = _.where(col, {type: type}); }
    return _.pluck(col, attribute).reduce(function(a, b){return a + b;}, 0);
  },

  /**
   * add/increase item
   * also prune attributes
   */
  /* jshint -W071, -W074 */
  addToCart: function(options){
    options = options || {};
    var model, attributes = options.model || options;
    if(attributes instanceof bb.Model){
      attributes = attributes.toJSON();
    }

    if(attributes.id){
      model = this.findWhere({ product_id: attributes.id });
      attributes.product_id = attributes.id;
      delete attributes.id;
    }

    if(model){
      model.quantity('increase');
    } else {
      model = this._addToCart(attributes);
    }

    model.trigger('pulse');
  },
  /* jshint +W071, +W074 */

  _addToCart: function(attributes){
    attributes.order = this.order_id;

    // turn variation attributes into line item meta
    if(attributes.type === 'variation'){
      attributes.meta = _.map(attributes.attributes, function(variant, idx){
        return {
          key: ++idx,
          label: variant.name,
          value: variant.option
        };
      });
    }

    return this.add(_.pick(attributes, this.productAttributes));
  },

  itemizedTax: function(){
    var items = _.clone(this.toJSON(), true);
    var taxes = _.map(items, function(item){
      if(!item.tax) { return; }
      _.each(item.tax, function(tax){
        tax.shipping = item.type === 'shipping' ? tax.total : 0 ;
      });
      return item.tax;
    });
    var obj = this.sumTaxes(taxes);

    // convert obj to array to be consistent with WC REST API output
    var arr = [];
    _.each(obj, function(value, key){
      //value.rate_id = parseInt(key, 10);
      value.rate_id = key.toString(); // make sure it's a string
      arr.push(value);
    });

    return arr;
  },

  sumTaxes: function(taxes){
    return _.reduce(taxes, function(result, tax){
      return _.merge(result, tax, function(a, b){
        if(a){
          b.total += a.total;
          b.subtotal += a.subtotal;
          b.shipping += a.shipping;
        }
        return b;
      });
    }, {});
  }

});