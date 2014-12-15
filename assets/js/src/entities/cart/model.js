POS.module('Entities.Cart', function(Cart, POS, Backbone, Marionette, $, _) {

    Cart.Model = Backbone.Model.extend({
        idAttribute: 'local_id',
        remoteIdAttribute: 'id',

        defaults : {
            'subtotal' 	    : 0,
            'subtotal_tax'  : 0,
            'total_tax' 	: 0,
            'total'		    : 0,
            'item_price'	: 0,
            'item_tax' 		: 0,
            'qty'			: 1,
            'taxable'       : true,
            'tax_class'     : ''
        },

        validation: {
            sale_price: {
                pattern: 'email'
            }
        },

        initialize: function( options ) {

            if( this.collection && this.collection.order ) {
                this.set({ order: this.collection.order.id });
            }

            // update on change to qty or item_price
            this.on( 'change:qty change:item_price change:taxable change:tax_class', this.updateLineTotals );

            // set item price on init, this will trigger updateLineTotals()
            if( this.get('item_price') === 0 ) {
                this.set({ 'item_price': parseFloat( this.get('price') ) });
            }
        },

        updateLineTotals: function() {
            console.log('recalc');
            var qty 			= this.get('qty'),
                item_price 		= this.get('item_price'),
                type            = this.get('type'),
                regular_price 	= parseFloat( this.get('regular_price') ),
                item_subtotal_tax = this.calcTax( regular_price ),
                item_tax 		= this.calcTax( item_price, qty );

            // if shipping or fee
            if( type === 'shipping' || type === 'fee' ) {
                regular_price = item_price;
            }

            // if price does not include tax
            if( POS.getOption('tax').prices_include_tax === 'yes' ) {
                regular_price -= item_subtotal_tax;
                item_price -= item_tax;
            }

            this.save({
                'item_subtotal' 	: regular_price,
                'item_subtotal_tax' : item_subtotal_tax,
                'item_tax'			: POS.Utils.round( item_tax, 4 ),
                'subtotal' 	        : POS.Utils.round( regular_price * qty, 4 ),
                'subtotal_tax'      : POS.Utils.round( item_subtotal_tax * qty, 4 ),
                'total_tax'			: POS.Utils.round( item_tax * qty, 4 ),
                'total'		        : POS.Utils.round( item_price * qty, 4 )
            });

        },

        /**
         * Calculate the line item tax total
         * based on the calc_tax function in woocommerce/includes/class-wc-tax.php
         */
        calcTax: function( price, qty ) {
            var item_tax = 0,
                tax_class = this.get('tax_class');

            if( _( POS.getOptions('tax_rates') ).has( tax_class ) ) {
                var rates = POS.getOptions('tax_rates').tax_class;
            }

            if( POS.getOptions('tax').calc_taxes === 'yes' && this.get('taxable') && rates ) {
                if( POS.getOptions('tax').prices_include_tax === 'yes' ) {
                    item_tax = this.calcInclusiveTax( price, rates, qty );
                }
                else {
                    item_tax = this.calcExclusiveTax( price, rates, qty );
                }
            }

            // use for init subtotal_tax
            return item_tax;
        },

        /**
         * Calculate the line item tax total
         * based on the calc_inclusive_tax function in woocommerce/includes/class-wc-tax.php
         */
        calcInclusiveTax: function( price, rates, qty ) {
            var regular_tax_rates = 0,
                compound_tax_rates = 0,
                non_compound_price = 0,
                tax_amount = 0,
                item_tax = 0,
                line_tax = 0;

            if( qty === undefined ) {
                var subtotal_calc = true;
                qty = 1;
            }

            _(rates).each( function(rate) {
                if ( rate.compound === 'yes' ) {
                    compound_tax_rates = compound_tax_rates + parseFloat(rate.rate);
                }
                else {
                    regular_tax_rates = regular_tax_rates + parseFloat(rate.rate);
                }
            });

            var regular_tax_rate 	= 1 + ( regular_tax_rates / 100 );
            var compound_tax_rate 	= 1 + ( compound_tax_rates / 100 );
            non_compound_price = price / compound_tax_rate;

            _(rates).each( function(rate, key) {
                var the_rate = parseFloat(rate.rate) / 100;
                var the_price = 0;

                if ( rate.compound === 'yes' ) {
                    the_price = price;
                    the_rate  = the_rate / compound_tax_rate;
                }
                else {
                    the_price = non_compound_price;
                    the_rate  = the_rate / regular_tax_rate;
                }

                var net_price = price - ( the_rate * the_price );
                tax_amount = price - net_price;

                // do the rounding now if required
                var item_tax_ = POS.Utils.round( tax_amount, 4 );
                var line_tax_ = POS.Utils.round( tax_amount * qty, 4 );

                // set the itemized taxes
                this.set( 'item_tax_' + key, item_tax_ );
                this.set( 'line_tax_' + key, line_tax_ );
                rate.tax_amount = line_tax_; // nested attribute, for WC API

                // sum item taxes
                item_tax += item_tax_;

                // WC API v2
                if( subtotal_calc ) {
                    rate.subtotal_tax = item_tax_;
                }

            }, this);

            // return the item tax
            return POS.Utils.round( item_tax, 4 );
        },

        /**
         * Calculate the line item tax total
         * based on the calc_exclusive_tax function in woocommerce/includes/class-wc-tax.php
         */
        calcExclusiveTax: function( price, rates, qty ) {
            var taxes = [],
                pre_compound_total = 0,
                tax_amount = 0,
                item_tax = 0,
                line_tax =0;

            if( qty === undefined ) {
                var subtotal_calc = true;
                qty = 1;
            }

            // multiple taxes
            _(rates).each( function(rate, key) {
                tax_amount = 0;
                if ( rate.compound !== 'yes' ) {
                    tax_amount = price * ( parseFloat(rate.rate) / 100 );
                }
                taxes[ key ] = tax_amount;
            });

            if( taxes.length > 0 ) {
                pre_compound_total = taxes.reduce( function(sum, num) { return sum + num; } );
            }

            // compound taxes
            _(rates).each( function(rate, key) {
                if ( rate.compound === 'yes' ) {
                    var the_price_inc_tax = price + pre_compound_total;
                    taxes[ key ] = the_price_inc_tax * ( parseFloat(rate.rate) / 100 );
                }

                // do the rounding now if required
                var item_tax_ = POS.Utils.round( taxes[ key ], 4 );
                var line_tax_ = POS.Utils.round( taxes[ key ] * qty, 4 );

                // set the itemized taxes
                this.set( 'item_tax_' + key, item_tax_ );
                this.set( 'line_tax_' + key, line_tax_ );
                rate.tax_amount = line_tax_; // nested attribute, for WC API

                // sum item taxes
                item_tax += item_tax_;

                // WC API v2
                if( subtotal_calc ) {
                    rate.subtotal_tax = item_tax_;
                }

            }, this);

            // return the item tax
            return POS.Utils.round( item_tax, 4 );
        },

        // Convenience method to increase or decrease qty
        quantity: function( type ) {
            var qty = this.get('qty');
            this.set('qty', (type === 'increase' ? ++qty : --qty) );
        }
    });

});