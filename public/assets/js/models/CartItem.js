define(['backbone', 'backbone-deepmodel', 'accounting'], 
	function(Backbone, DeepModel, accounting){

	// accounting.settings = pos_params.accounting.settings;
	// var wc = pos_params.wc;

  	// store the product data, add qty, total & discount by default
	var CartItem = Backbone.DeepModel.extend({
		defaults : {
			'display_price'	: 0,
			'display_total' : 0,
			'item_discount'	: 0,
			'item_price'	: 0,
			'line_total'	: 0,
			'qty'			: 1,
			'total_discount': 0,
		},
		params: pos_params,

		initialize: function() { 
			// this.on('all', function(e) { console.log(this.get('title') + " event: " + e); }); // debug

			// set the accounting settings
			accounting.settings = this.params.accounting.settings;

			// update on change to qty or line discount
			this.listenTo( this, 'change:qty change:display_price', this.updateLineTotals );

			// set item price on init, this will trigger updateLineTotals()
			this.set( { 'display_price': this.get('price') } );

		},

		updateLineTotals: function() {
			var qty 		   = this.get('qty'),
				display_price  = parseFloat( this.get('display_price') ),
				original_price = parseFloat( this.get('price') ),
				discount 	   = 0,
				item_price 	   = 0,
				display_total  = 0,
				taxable 	   = this.get('taxable');

			// set taxes first
			if( taxable && this.params.wc.calc_taxes === 'yes' ) {
				var taxes = [],
					item_total = 0,
					line_total = 0,
					total = 0;

				taxes = this.calcTaxTotal( display_price, this.get('taxes.itemized') );

				_.each(this.get('taxes.itemized'), function(tax_rate) {

					// round now if required
					if( this.params.wc.tax_round_at_subtotal === 'no' ) {
						line_total = this.roundNum( taxes[tax_rate.rate_id] * qty );
					} else {
						line_total = taxes[tax_rate.rate_id] * qty;
					}

					// set the itemized tax line_totals
					this.set('taxes.itemized.' + tax_rate.rate_id + '.line_total', line_total );
					
					item_total += taxes[tax_rate.rate_id];
					total += line_total;
				}, this);

				// round again if required
				if( this.params.wc.tax_round_at_subtotal === 'no' ) {
					item_total = this.roundNum( item_total );
					total = this.roundNum( total );
				}

				// set the item tax line_total
				this.set('taxes.item_total', item_total );
				this.set('taxes.line_total', total );

			}

			discount = original_price - display_price;
			item_price = this.calcPrice( display_price, taxable );
			display_total = this.displayTotal( original_price, taxable );
			this.set({
				'item_price'	: item_price,
				'item_discount'	: discount,
				'total_discount': this.roundNum( discount * qty ),
				'line_total'	: this.roundNum( item_price * qty ),
				'display_total'	: accounting.formatNumber( display_total * qty )
			});
		},

		calcPrice: function(price, taxable) {
			var tax = 0;

			if( taxable && this.params.wc.calc_taxes === 'yes' ) {
				tax = this.get('taxes.item_total');
				if(this.params.wc.prices_include_tax === 'yes') {
					price = price - tax;
				}
			}

			return price;
		},

		/**
		 * Calculate the line item tax total
		 * based on the calc_tax function in woocommerce/includes/class-wc-tax.php
		 */
		calcTaxTotal: function( price, rates ) {
			var taxes = [];

			if( this.params.wc.prices_include_tax === 'yes' ) {
				taxes = this.calcInclusiveTax( price, rates );
			}
			else {
				taxes = this.calcExclusiveTax( price, rates );
			}

			return taxes;
		},

		/**
		 * Calculate the line item tax total
		 * based on the calc_inclusive_tax function in woocommerce/includes/class-wc-tax.php
		 */
		calcInclusiveTax: function( price, rates ) {
			var taxes = [],
				regular_tax_rates = 0,
				compound_tax_rates = 0,
				non_compound_price = 0,
				tax_amount = 0;

			_.each(rates, function(rate) {
				if ( rate.compound === 1 ) {
					compound_tax_rates = compound_tax_rates + parseFloat(rate.rate);
				}
				else {
					regular_tax_rates  = regular_tax_rates + parseFloat(rate.rate);
				}
			});

			var regular_tax_rate 	= 1 + ( regular_tax_rates / 100 );
			var compound_tax_rate 	= 1 + ( compound_tax_rates / 100 );
			non_compound_price = price / compound_tax_rate;

			_.each(rates, function(rate) {
				var the_rate = parseFloat(rate.rate) / 100;
				var the_price = 0;

				if ( rate.compound === 1 ) {
					the_price = price;
					the_rate  = the_rate / compound_tax_rate;
				}
				else {
					the_price = non_compound_price;
					the_rate  = the_rate / regular_tax_rate;
				}

				var net_price = price - ( the_rate * the_price );
				tax_amount = price - net_price;

				taxes[ rate.rate_id ] = tax_amount;
			}, this);

			return taxes;
		},

		/**
		 * Calculate the line item tax total
		 * based on the calc_exclusive_tax function in woocommerce/includes/class-wc-tax.php
		 */
		calcExclusiveTax: function( price, rates ) {
			var taxes = [],
				tax_amount = 0,
				pre_compound_total = 0;

			// multiple taxes
			_.each(rates, function(rate) {
				if ( rate.compound !== 1 ) {
					tax_amount = price * ( parseFloat(rate.rate) / 100 );
				}
				pre_compound_total += tax_amount;
				taxes[ rate.rate_id ] = tax_amount;
			});

			// compound taxes
			_.each(rates, function(rate) {
				if ( rate.compound === 1 ) {
					var the_price_inc_tax = price + pre_compound_total;
					tax_amount = the_price_inc_tax * ( parseFloat(rate.rate) / 100 );
				}

				taxes[ rate.rate_id ] = tax_amount;
			}, this);

			return taxes;
		},

		displayTotal: function(price, taxable) {
			var tax = 0;

			if( taxable && this.params.wc.calc_taxes === 'yes' ) {
				tax = this.get('taxes.item_total');
				if( this.params.wc.prices_include_tax === 'no' && this.params.wc.tax_display_cart === 'incl' ) {
					price = price + tax;
				}
				else if ( this.params.wc.prices_include_tax === 'yes' && this.params.wc.tax_display_cart === 'excl' ) {
					price = price - tax;
				}
			}
			
			return price;
		},

		roundNum: function(num) {
			return parseFloat( accounting.formatNumber(num, 4) );
		},

		// Convenience method to increase or decrease qty
		quantity: function( type ) {
			var qty = this.get('qty');
			this.set('qty', (type === 'increase' ? ++qty : --qty) );
		},

	});

  // Return the model for the module
  return CartItem;
});