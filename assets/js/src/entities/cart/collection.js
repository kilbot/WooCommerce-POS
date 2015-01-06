POS.module('Entities.Cart', function(Cart, POS, Backbone, Marionette, $, _) {

    Cart.Collection = Backbone.Collection.extend({
        model: Cart.Model,

        comparator: function( model ){
            var type = model.get( 'type' );
            if( type === 'fee' ) { return 2; }
            if( type === 'shipping' ) { return 1; }
            return 0;
        },

        initialize: function (models, options) {
            options = options || {};

            this.indexedDB = new Backbone.IndexedDB({
                storeName: 'cart',
                storePrefix: 'wc_pos_',
                dbVersion: 1,
                keyPath: 'local_id',
                autoIncrement: true,
                indexes: [
                    {name: 'order', keyPath: 'order', unique: false},
                    {name: 'type', keyPath: 'type', unique: false}
                ]
            }, this);

            // if no order?
            if ( options.order ) {
                this.order = options.order;
            }

            this.on( 'add remove change', this.calcTotals );
        },

        calcTotals: function() {
            var subtotal,
                subtotal_tax,
                total_tax = 0,
                total,
                itemized_tax 	= [],
                tax_rates 		= {};

            // sum up the line totals
            subtotal 	  = _( this.pluck('subtotal') ).reduce( function(memo, num){ return memo + num; }, 0 );
            subtotal_tax  = _( this.pluck('subtotal_tax') ).reduce( function(memo, num){ return memo + num; }, 0 );
            total 		  = _( this.pluck('total') ).reduce( function(memo, num){ return memo + num; }, 0 );

            if( POS.getOption('tax').calc_taxes === 'yes' ) {
                total_tax = _( this.pluck('total_tax') ).reduce( function(memo, num){ return memo + num; }, 0 );
            }

            // create totals object
            var totals = {
                'total'		    : POS.Utils.round( total, 4 ),
                'subtotal'		: POS.Utils.round( subtotal, 4 ),
                'subtotal_tax'	: POS.Utils.round( subtotal_tax, 4 ),
                'cart_discount'	: POS.Utils.round( subtotal - total, 4 ),
                'total_tax'		: POS.Utils.round( total_tax, 4 ),
                //'itemized_tax'	: itemized_tax
            };

            // if no order?
            if( this.order ) {
                this.order.save( totals );
            }
        },

        fetchOrder: function () {
            var self = this;
            var onItem = function (item) {
                if (item.order === self.order.id) {
                    self.add(item);
                }
            };
            var onEnd = function () {
                self.trigger('cart:ready');
            };
            self.indexedDB.iterate(onItem, {
                index: 'order',
                order: 'ASC',
                onEnd: onEnd
            });
        }
    });

});