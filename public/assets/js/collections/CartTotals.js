define(['underscore', 'backbone', 'models/CartTotal', 'collections/CartItems'], 
	function(_, Backbone, CartTotal, CartItems){

	var CartTotals = Backbone.Collection.extend({
		model: CartTotal,
		comparator: 'id', // order by id
		params: pos_params,

		// debug
		initialize: function() { 
			// this.on('all', function(e) { console.log("Total Collection event: " + e); }); // debug
			
			// listen to line_totals, update subtotal on change or remove
			this.listenTo( CartItems, 'add change remove', this.updateTotals );
		},

		updateTotals: function() {
			var totals = [],
				line_total_sum = 0,
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
			line_total_sum = _.reduce( CartItems.pluck('line_total'), function(memo, num){ return memo + num; }, 0 );
			discount_sum = _.reduce( CartItems.pluck('total_discount'), function(memo, num){ return memo + num; }, 0 );

			// if tax
			if( this.params.wc.calc_taxes === 'yes' ) {
				tax_sum = _.reduce( CartItems.pluck('taxes.line_total'), function(memo, num){ return memo + num; }, 0 );			
			}

			// totals
			subtotal_sum = line_total_sum + discount_sum;
			total_sum = subtotal_sum - discount_sum + tax_sum;

			// special case
			if ( this.params.wc.tax_display_cart === 'incl' ) {
				subtotal_sum += tax_sum;
				total_sum = subtotal_sum - discount_sum;
			}

			// put the totals into an array
			totals.push( { id: 1, label: 'Subtotal:', total: subtotal_sum } );

			if( discount_sum !== 0 ) {
				totals.push( { id: 2, label: 'Cart Discount:', total: discount_sum } );
			}

			if( tax_sum !== 0 ) {
				tax_labels = this.tax_labels();
				totals.push( { id: 3, label: tax_labels[0].label, total: tax_sum } );
			}

			totals.push( { id: 100, label: 'Total:', total: total_sum } );

			// now, update the totals
			this.reset( totals );

			// // sum up the line totals
			// if( this.params.wc.calc_taxes === 'yes' ) {
			// 	tax_labels = this.tax_labels();
			// 	tax_sum = _.reduce( CartItems.pluck('taxes.line_total'), function(memo, num){ return memo + num; }, 0 );
			// 	if( tax_sum !== 0 ) {
			// 		if ( this.params.wc.tax_total_display === 'itemized' ) {
			// 			_.each(tax_labels, function(tax) {
			// 				var i = 3;
			// 				tax_sum = _.reduce( CartItems.pluck('taxes.itemized.' + tax.id + '.line_total' ), function(memo, num){ return memo + num; }, 0 );
			// 				totals.push( { id: i, label: tax.label, total: tax_sum } );
			// 				i++;
			// 			}, this);
			// 		}
			// 		else {
			// 			totals.push( { id: 3, label: tax_labels[0].label, total: tax_sum } );
			// 		}
			// 	}
			// }

		},

		// get the tax ids and labels 
		// TODO: what happens if first item not taxable???
		tax_labels: function() {
			var labels = [],
				prefix = '';
			var taxes = CartItems.at(0).get('taxes.itemized');

			// special case for cart includes tax
			if( this.params.wc.tax_display_cart === 'incl' ) {
				prefix = 'includes ';
			}

			if( this.params.wc.tax_total_display === 'itemized' ) {
				_.each(taxes, function(tax) {
					labels.push( { id: tax.rate_id, label: prefix + this.params.wc.tax_label + ' (' + tax.label + '):' });
				}, this);
			}
			else {
				labels.push( { id: 0, label: prefix + this.params.wc.tax_label + ':' });
			}
			return labels;
		},

	});
  
	// return the collection
	return CartTotals;
});