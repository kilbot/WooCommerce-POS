define(['app', 'localstorage'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.CartItem = Backbone.Model.extend({

			defaults : {
				'subtotal' 			: 0, // regular price * qty
				'subtotal_tax' 		: 0, // regular tax * qty
				'item_discount'		: 0, // regular price - item price
				'item_price'		: 0, // price entered in POS
				'item_tax' 			: 0, // tax calc on item price
				'line_discount' 	: 0, // item discount * qty
				'line_tax' 			: 0, // item tax * qty
				'line_total'		: 0, // item price * qty
				'qty'				: 1, // quantity
			},

			initialize: function(attributes, options) { 
				// this.on('all', function(e) { console.log(this.get('title') + " event: " + e); }); // debug

				// update on change to qty or line discount
				this.on( 'change:qty change:item_price', this.updateLineTotals );

				// set item price on init, this will trigger updateLineTotals()
				if( this.get('item_price') === 0 ) {
					var regular_price = parseFloat( this.get('regular_price') );
					this.set({ 
						'item_subtotal': regular_price,
						'item_subtotal_tax': this.calcTax( regular_price, 1 ),
						'item_price': parseFloat( this.get('price') ) 
					});
				}
			},

			updateLineTotals: function(e) {
				var qty 			= this.get('qty'),
					item_price 		= this.get('item_price'),
					discount 		= 0;
				
				// update subtotal on change to qty
				this.set({
					'subtotal' 		: POS.round( this.get('item_subtotal') * qty, 4 ),
					'subtotal_tax' 	: POS.round( this.get('item_subtotal_tax') * qty, 4 ),				
				});					

				// update discount calc
				discount = this.get('item_subtotal') - item_price;
				this.set({
					'item_discount'		: POS.round( discount, 4 ),
					'line_discount'		: POS.round( discount * qty, 4 ),
				});

				// set taxes
				this.calcTax( item_price, qty );

				// now save
				this.save({
					'line_total'		: POS.round( item_price * qty, 4 )
				});
			},

			/**
			 * Calculate the line item tax total
			 * based on the calc_tax function in woocommerce/includes/class-wc-tax.php
			 */
			calcTax: function( price, qty ) {
				var line_total = 0;

				if( this.get('taxable') && pos_params.wc.calc_taxes === 'yes' ) {
					if( pos_params.wc.prices_include_tax === 'yes' ) {
						line_total = this.calcInclusiveTax( price, qty );
					}
					else {
						line_total = this.calcExclusiveTax( price, qty );
					}
				}

				// use for init subtotal_tax
				return line_total;
			},

			/**
			 * Calculate the line item tax total
			 * based on the calc_inclusive_tax function in woocommerce/includes/class-wc-tax.php
			 */
			calcInclusiveTax: function( price, qty ) {
				var rates = this.get('tax_rates'),
					regular_tax_rates = 0,
					compound_tax_rates = 0,
					non_compound_price = 0,
					tax_amount = 0,
					item_tax = 0,
					line_tax = 0;

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
					var item_tax_ = POS.round( tax_amount, 4 );
					var line_tax_ = POS.round( tax_amount * qty, 4 );

					// set the itemized taxes
					this.set( 'item_tax_' + key, item_tax_ );
					this.set( 'line_tax_' + key, line_tax_ );
					rate.tax_amount = line_tax_; // nested attribute, for WC API

					// combine taxes
					item_tax += item_tax_;
					line_tax += line_tax_;

				}, this);

				// set the combined taxes now
				this.set( 'item_tax' , POS.round( item_tax, 4 ) );
				this.set( 'line_tax' , POS.round( line_tax, 4 ) );
				
				// return the line tax
				return POS.round( item_tax * qty, 4 );
			},

			/**
			 * Calculate the line item tax total
			 * based on the calc_exclusive_tax function in woocommerce/includes/class-wc-tax.php
			 */
			calcExclusiveTax: function( price, qty ) {
				var rates = this.get('tax_rates'),
					taxes = [],
					pre_compound_total = 0,
					tax_amount = 0,
					item_tax = 0,
					line_tax =0;

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
					var item_tax_ = POS.round( taxes[ key ], 4 );
					var line_tax_ = POS.round( taxes[ key ] * qty, 4 );

					// set the itemized taxes
					this.set( 'item_tax_' + key, item_tax_ );
					this.set( 'line_tax_' + key, line_tax_ );
					rate.tax_amount = line_tax_; // nested attribute, for WC API

					// combine taxes
					item_tax += item_tax_;
					line_tax += line_tax_;

				}, this);

				// set the combined taxes now
				this.set( 'item_tax' , POS.round( item_tax, 4 ) );
				this.set( 'line_tax' , POS.round( line_tax, 4 ) );
				
				// return the line tax
				return POS.round( item_tax * qty, 4 );
			},

			// Convenience method to increase or decrease qty
			quantity: function( type ) {
				var qty = this.get('qty');
				this.set('qty', (type === 'increase' ? ++qty : --qty) );
			},

		});

	});

	return POS.Entities.CartItem;
});