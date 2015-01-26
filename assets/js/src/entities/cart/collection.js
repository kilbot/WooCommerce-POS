var bb = require('backbone');
var Collection = require('lib/config/collection');
var Model = require('./model');
var Utils = require('lib/utilities/utils');
var _ = require('lodash');
var entitiesChannel = bb.Radio.channel('entities');
var IndexedDB = require('lib/config/indexeddb');

module.exports = Collection.extend({
  model: Model,

  comparator: function( model ){
    var type = model.get( 'type' );
    if( type === 'fee' ) { return 2; }
    if( type === 'shipping' ) { return 1; }
    return 0;
  },

  initialize: function () {

    this.indexedDB = new IndexedDB({
      storeName: 'cart',
      storePrefix: 'wc_pos_',
      dbVersion: 1,
      keyPath: 'local_id',
      autoIncrement: true,
      indexes: [
        {name: 'local_id', keyPath: 'local_id', unique: true},
        {name: 'order', keyPath: 'order', unique: false},
        {name: 'type', keyPath: 'type', unique: false}
      ]
    }, this);

    this.on( 'add remove change', this.calcTotals );
  },

  calcTotals: function() {
    var subtotal,
      subtotal_tax,
      total_tax = 0,
      total;

    // sum up the line totals
    subtotal      = this.sum('subtotal');
    subtotal_tax  = this.sum('subtotal_tax');
    total         = this.sum('total');

    var tax = entitiesChannel.request('get', {
      type: 'option',
      name: 'tax'
    });
    if( tax && tax.calc_taxes === 'yes' ) {
      total_tax = this.sum('total_tax');
    }

    // create totals object
    var totals = {
      'total'         : Utils.round( total, 4 ),
      'subtotal'      : Utils.round( subtotal, 4 ),
      'subtotal_tax'  : Utils.round( subtotal_tax, 4 ),
      'cart_discount' : Utils.round( subtotal - total, 4 ),
      'total_tax'     : Utils.round( total_tax, 4 )
      //'itemized_tax'  : itemized_tax
    };

    this.trigger('update:totals', totals);
  },

  fetchCartItems: function (options) {
    var options = options || {};
    if(!options.order_id){
      return;
    }

    this.order_id = options.order_id;
    var onItem = function (item) {
      if (item.order === this.order_id) {
        this.add(item);
      }
    }.bind(this);
    var onEnd = function () {};
    this.indexedDB.iterate(onItem, {
      index: 'order',
      order: 'ASC',
      onEnd: onEnd
    });
  },

  // convenience method to sum attributes in collection
  sum: function(attribute){
    var array = this.pluck(attribute);
    return _( array ).reduce( function(memo, num){ return memo + num; }, 0 );
  },

  /**
   * add/increase item
   */
  addToCart: function(options){
    options = options || {};
    var attributes,
        model;

    if(options.model){
      attributes = options.model.attributes;
    } else {
      attributes = options;
    }

    if( attributes.id ) {
      model = this.findWhere({ id: attributes.id });
    }

    if( model ) {
      model.quantity('increase');
    } else {
      model = this.add(attributes);
    }

    model.trigger('focus');
  }
});