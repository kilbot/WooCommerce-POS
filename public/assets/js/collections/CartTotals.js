define(['underscore', 'backbone', 'models/CartTotal', 'collections/CartItems'], 
	function(_, Backbone, CartTotal, CartItems){

	// pos_cart_params is required to continue, ensure the object exists
	if ( typeof pos_cart_params === 'undefined' ) {
		console.log('No pos_cart_params');
		return false;
	} else {
		var wc = pos_cart_params.wc;
	}

	var CartTotals = Backbone.Collection.extend({
		model: CartTotal,
		comparator: 'id', // order by id

		// debug
		initialize: function() { 
			// this.on('all', function(e) { console.log("Total Collection event: " + e); }); // debug
			
			// listen to line_totals, update subtotal on change or remove
			this.listenTo( CartItems, 'change remove', this.updateTotals );
		},

		updateTotals: function() {
			var totals = [],
				subtotal_sum = 0,
				discount_sum = 0,
				tax_sum = 0,
				total_sum =0,
				tax_labels = [];

			// clear the totals
			this.reset();

			// bail if the cart is empty
			if( CartItems.length === 0 ) { 
				return; 
			} 

			// sum up the line totals
			subtotal_sum = _.reduce( CartItems.pluck('total'), function(memo, num){ return memo + num; }, 0 );
			totals.push( { id: 1, label: 'Subtotal:', total: subtotal_sum } );

			// sum the line discounts
			discount_sum = _.reduce( CartItems.pluck('total_discount'), function(memo, num){ return memo + num; }, 0 );
			if( discount_sum !== 0 ) {
				totals.push( { id: 2, label: 'Cart Discount:', total: discount_sum } );
			} 

			// sum up the line totals
			if( wc.calc_taxes === 'yes' ) {
				tax_labels = this.tax_labels();
				tax_sum = _.reduce( CartItems.pluck('taxes.line_total'), function(memo, num){ return memo + num; }, 0 );
				if( tax_sum !== 0 ) {
					if (wc.tax_total_display === 'itemized') {
						_.each(tax_labels, function(tax) {
							var i = 3;
							tax_sum = _.reduce( CartItems.pluck('taxes.itemized.' + tax.id + '.line_total' ), function(memo, num){ return memo + num; }, 0 );
							totals.push( { id: i, label: tax.label, total: tax_sum } );
							i++;
						}, this);
					}
					else {
						totals.push( { id: 3, label: tax_labels[0].label, total: tax_sum } );
					}
				}
			}

			// special case for cart includes tax
			if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'no' && wc.tax_display_cart === 'incl' ) {
				tax_sum = _.reduce( CartItems.pluck('taxes.line_subtotal'), function(memo, num){ return memo + num; }, 0 );
				totals[0].total = subtotal_sum + tax_sum;
			}

			else if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'incl' ) {
				tax_sum = _.reduce( CartItems.pluck('taxes.line_total'), function(memo, num){ return memo + num; }, 0 );
				totals[0].total = subtotal_sum + tax_sum;
			}

			// remove the old total, add up the totals and set the new total
			total_sum = subtotal_sum - discount_sum + tax_sum;
			totals.push( { id: 100, label: 'Total:', total: total_sum } );

			// update the CartTotals models
			this.reset( totals );

		},

		// get the tax ids and labels 
		// TODO: what happens if first item not taxable???
		tax_labels: function() {
			var labels = [],
				prefix = '';
			var taxes = CartItems.at(0).get('taxes.itemized');

			// special case for cart includes tax
			if( wc.calc_taxes === 'yes' && wc.tax_display_cart === 'incl' ) {
				prefix = 'includes ';
			}

			if( wc.tax_total_display === 'itemized' ) {
				_.each(taxes, function(tax) {
					labels.push( { id: tax.rate_id, label: prefix + wc.tax_label + ' (' + tax.label + '):' });
				});
			}
			else {
				labels.push( { id: 0, label: prefix + wc.tax_label + ':' });
			}
			return labels;
		},

	});
  
	// return the collection
	return CartTotals;
});