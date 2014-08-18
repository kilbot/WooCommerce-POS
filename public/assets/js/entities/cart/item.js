define(['app', 'localstorage'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.CartItem = Backbone.Model.extend({

			defaults : {
				'item_discount'		: 0,
				'item_price'		: 0,
				'item_tax' 			: 0,
				'line_discount' 	: 0,
				'line_tax' 			: 0,
				'line_total'		: 0,
				'qty'				: 1,
			},

			initialize: function(attributes, options) { 
				// this.on('all', function(e) { console.log(this.get('title') + " event: " + e); }); // debug

				// update on change to qty or line discount
				this.on( 'change:qty change:item_price', this.updateLineTotals );

				// set item price on init, this will trigger updateLineTotals()
				if( this.get('item_price') === 0 ) {
					this.set( { 'item_price': parseFloat( this.get('price') ) } );
				}
			},

			updateLineTotals: function() {
				var qty 			= this.get('qty'),
					item_price 		= this.get('item_price'),
					discount 		= 0;
				
				// calc discount
				discount = parseFloat( this.get('regular_price') ) - item_price;
				
				// set taxes
				if( this.get('taxable') && pos_params.wc.calc_taxes === 'yes' ) {
					this.calcTax( item_price, qty, this.get('tax_rates') );
				}

				this.save({
					'item_discount'		: this.roundNum( discount ),
					'line_discount'		: this.roundNum( discount * qty ),
					'item_price'		: this.roundNum( item_price ),
					'line_total'		: this.roundNum( item_price * qty )
				});
			},

			/**
			 * Calculate the line item tax total
			 * based on the calc_tax function in woocommerce/includes/class-wc-tax.php
			 */
			calcTax: function( price, qty, rates ) {
				var line_total = 0;

				if( pos_params.wc.prices_include_tax === 'yes' ) {
					line_total = this.calcInclusiveTax( price, qty, rates );
				}
				else {
					line_total = this.calcExclusiveTax( price, qty, rates );
				}

				// not using at present
				return line_total;
			},

			/**
			 * Calculate the line item tax total
			 * based on the calc_inclusive_tax function in woocommerce/includes/class-wc-tax.php
			 */
			calcInclusiveTax: function( price, qty, rates ) {
				var regular_tax_rates = 0,
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
					var item_tax_ = this.roundNum( tax_amount );
					var line_tax_ = this.roundNum( tax_amount * qty );

					// set the itemized taxes
					this.set( 'item_tax_' + key, item_tax_ );
					this.set( 'line_tax_' + key, line_tax_ );

					// combine taxes
					item_tax += item_tax_;
					line_tax += line_tax_;

				}, this);

				// set the combined taxes now
				this.set( 'item_tax' , this.roundNum( item_tax ) );
				this.set( 'line_tax' , this.roundNum( line_tax ) );
				
				// return the line tax
				// return this.roundNum( item_tax * qty );
			},

			/**
			 * Calculate the line item tax total
			 * based on the calc_exclusive_tax function in woocommerce/includes/class-wc-tax.php
			 */
			calcExclusiveTax: function( price, qty, rates ) {
				var taxes = [],
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
					var item_tax_ = this.roundNum( taxes[ key ] );
					var line_tax_ = this.roundNum( taxes[ key ] * qty );

					// set the itemized taxes
					this.set( 'item_tax_' + key, item_tax_ );
					this.set( 'line_tax_' + key, line_tax_ );

					// combine taxes
					item_tax += item_tax_;
					line_tax += line_tax_;

				}, this);

				// set the combined taxes now
				this.set( 'item_tax' , this.roundNum( item_tax ) );
				this.set( 'line_tax' , this.roundNum( line_tax ) );
				
				// return the line tax
				// return this.roundNum( item_tax * qty );
			},

			// Convenience method for rounding to 4 decimal places
			// TODO: mirror the functionality of WC_ROUNDING_PRECISION
			roundNum: function(num) {
				if( pos_params.wc.tax_round_at_subtotal === 'no' ) {
					return parseFloat( num.toFixed(4) );
				}
				return num;
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