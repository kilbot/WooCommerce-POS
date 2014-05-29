define(['underscore', 'backbone', 'models/CartItem', 'models/CartTotals', 'views/CartTotals', 'accounting'], 
	function(_, Backbone, CartItem, CartTotals, CartTotalsView, accounting){

	// the collection of cart items
	var CartItems = Backbone.Collection.extend({
		url: pos_params.ajax_url,
		model: CartItem,
		params: pos_params,

  		// debug
		initialize: function() { 
			this.on('all', function(e) { console.log("Cart Collection event: " + e); }); // debug

			// set the accounting settings
			accounting.settings = this.params.accounting.settings;

			// init the Cart Totals model ...
			var cartTotals = new CartTotals();

			// ... and pass it to the Cart Totals view
			this.totals = new CartTotalsView({ model: cartTotals });
			
			// update totals on change to the cart items
			this.listenTo( this, 'add change remove', this.updateTotals );
		},

		updateTotals: function() {
			var line_totals 	= 0,
				subtotal 		= 0,
				cart_discount 	= 0,
				tax 			= 0,
				total 			= 0,
				itemized_tax 	= [],
				tax_labels 		= [];

			// if cart is empty
			if( this.length === 0 ) {

				// clear the cart totals
				this.totals.model.clear({ silent: true });
				this.totals.$el.html('').addClass('empty');

				// and bail
				return;
			}

			// sum up the line totals
			line_totals = _( this.pluck('line_total') ).reduce( function(memo, num){ return memo + num; }, 0 );
			cart_discount = _( this.pluck('total_discount') ).reduce( function(memo, num){ return memo + num; }, 0 );
			
			if( this.params.wc.calc_taxes === 'yes' ) {
				tax = _( this.pluck('line_tax') ).reduce( function(memo, num){ return memo + num; }, 0 );			
			}

			// totals calc
			subtotal = line_totals + cart_discount;
			total = line_totals + tax;

			// special case: display cart with tax
			if ( this.params.wc.tax_display_cart === 'incl' ) {
				subtotal += tax;
			}

			// special case: itemized taxes
			if( tax !== 0 && this.params.wc.tax_display === 'itemized') {
				// tax_labels = this.tax_labels();
				// if ( this.params.wc.tax_display === 'itemized' ) {
				// 	var i = 3;
				// 	_.each(tax_labels, function(tax) {
				// 		tax_sum = 0;
				// 		tax_sum = _.reduce( _.compact( this.pluck('taxes.itemized.' + tax.id + '.line_total' ) ), function(memo, num){ return memo + num; }, 0 );
				// 		if( tax_sum !== 0 ) {
				// 			totals.push( { tax : tax_sum } );
				// 		}
				// 		i++;
				// 	}, this);
				// }
			}

			// set some flags
			var show_discount 	= cart_discount !== 0 ? true : false ;
			var show_tax 		= tax !== 0 ? true : false ;

			// create totals object
			var totals = {
				'subtotal'		: accounting.formatMoney(subtotal),
				'cart_discount'	: accounting.formatMoney(cart_discount * -1),
				'tax'			: accounting.formatMoney(tax),
				'total'			: accounting.formatMoney(total),
				'show_discount' : show_discount,
				'show_tax' 		: show_tax,
			};

			// now, update the totals
			this.totals.model.set( totals );

		},
 
 		/**
 		 * checks all the cart item taxes and merges them into an array of rate ids and labels  
 		 * @return {array}
 		 */
		tax_labels: function() {
			var itemized  = [],
				labels = [],
				prefix = '';

			if( this.params.wc.tax_display_cart === 'incl' ) {
				prefix = 'includes ';
			}

			itemized = _.compact( this.pluck('taxes.itemized') );
			if( itemized.length > 0 && this.params.wc.tax_display === 'itemized' ) {
				_.each( _.reduce( itemized, function(a, b) { return _.merge(a, b); } ), function(tax) {
					labels.push( { id: tax.rate_id, label: prefix + this.params.wc.tax_label + ' (' + tax.label + '):' });
				}, this);
			}
			else {
				labels.push({ id: 0, label: prefix + this.params.wc.tax_label + ':' });
			}

			return labels;
			
		},

	});
  
	// 
	return CartItems;
});