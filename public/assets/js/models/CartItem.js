define(['backbone', 'deepmodel', 'accounting'], function(Backbone, DeepModel, accounting){

	// pos_cart_params is required to continue, ensure the object exists
	if ( typeof pos_cart_params === 'undefined' ) {
		console.log('No pos_cart_params');
		return false;
	} else {
		accounting.settings = pos_cart_params.accounting.settings;
		var wc = pos_cart_params.wc;
	}

  	// store the product data, add qty, total & discount by default
	var CartItem = Backbone.DeepModel.extend({
		defaults : {
			'qty'		: 1,
			'total'		: 0.00,
			'discount'	: 0.00,
			'total_discount': 0.00,
		},

		// debug
		initialize: function() { 
			// this.on('all', function(e) { console.log(this.get('title') + " event: " + e); }); // debug

			// update line item subtotals
			this.listenTo( this, 'add change:qty change:discount', this.updateLineTotals );
			
		},

		// 
		updateLineTotals: function() {
			var qty = this.get('qty');

			// do taxes first
			if( this.get('taxable') ) {
				var tax_total = this.calcTaxLineTotal();
				this.set('taxes.line_total', tax_total);
				this.set('taxes.line_subtotal', this.get('taxes.total') * qty );

				// if itemized
				if( wc.tax_total_display === 'itemized' ) {
					var itemized = this.get('taxes').itemized;
					_.each(itemized, function(tax_rate) {
						this.set('taxes.itemized.' + tax_rate.rate_id + '.line_total', this.calcTaxLineTotal( tax_rate.tax_amount ) );
						this.set('taxes.itemized.' + tax_rate.rate_id + '.line_subtotal', tax_rate.tax_amount * qty );
					}, this);
				}
			}

			// update discount
			this.set('total_discount', this.get('discount') * qty );

			// update line total
			var total = this.calcLineTotal();
			this.set('total', total);
		},

		// Increase or decrease the quantity
		quantity: function( type ) {
			var qty = this.get('qty');
			this.set('qty', (type === 'increase' ? ++qty : --qty) );
		},


		/**
		 * Calculate the line total
		 * @param  {object} model 	the product
		 * @return {float} total 	the total
		 */
		calcLineTotal: function() {
			var qty = this.get('qty'),
				price = this.get('price'),
				tax = 0,
				total = 0;

			// if cart item is taxable, get tax
			if( this.get('taxable') ) { tax = this.get('taxes').line_total; } 
			
			if( wc.prices_include_tax === 'yes' ) {
				total = (qty * price) - tax;
			} else {
				total = qty * price;
			}

			// round price now if required
			if( wc.round_at_subtotal === 'no' ) {
				total = accounting.formatNumber(total);
			}

			return total;
		},

		/**
		 * Calculate the line item tax total
		 * @param  {object} model 	the product
		 * @return {float} line_total tax
		 */
		calcTaxLineTotal: function(itemized) {
			var tax_total = parseFloat( this.get('taxes.total') ),
				price = parseFloat( this.get('price') ),
				discount = parseFloat( this.get('discount') ),
				qty = parseFloat( this.get('qty') );

			var tax = typeof itemized !== 'undefined' ? itemized : tax_total ; // default is the total tax


			if( discount !== 0 && wc.prices_include_tax === 'no' && wc.tax_display_cart === 'incl' ) {
				tax = ( tax / ( price + tax_total ) ) * ( price + tax_total - discount );
			}

			else if( discount !== 0 && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'excl' ) {
				tax = ( tax / ( price - tax_total ) ) * ( price - tax_total - discount );
			} 

			else if( discount !== 0 ) {
				tax = ( tax / price ) * ( price - discount );
			}

			return tax * qty;
		},


	});

  // Return the model for the module
  return CartItem;
});