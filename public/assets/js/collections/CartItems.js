define(['underscore', 'backbone', 'models/CartItem', 'models/CartTotals', 'views/CartTotals', 'accounting', 'backbone-localstorage'], 
	function(_, Backbone, CartItem, CartTotals, CartTotalsView, accounting, LocalStorage){

	// the collection of cart items
	var CartItems = Backbone.Collection.extend({
		// url: pos_params.ajax_url,
		localStorage: new Backbone.LocalStorage("cart"),
		model: CartItem,
		params: pos_params,

  		// debug
		initialize: function() { 
			// this.on('all', function(e) { console.log("Cart Collection event: " + e); }); // debug

			// set the accounting settings
			accounting.settings = this.params.accounting;

			// init the Cart Totals model ...
			var cartTotals = new CartTotals();

			// ... and pass it to the Cart Totals view
			this.totals = new CartTotalsView({ model: cartTotals, cart: this });
			
			// update totals on change to the cart items
			this.listenTo( this, 'add change remove reset', this.updateTotals );
		},

		updateTotals: function() {
			var line_totals 	= 0,
				subtotal 		= 0,
				cart_discount 	= 0,
				tax 			= 0,
				total 			= 0,
				itemized_tax 	= {},
				tax_rates 		= {};

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
			if( tax !== 0 && this.params.wc.tax_total_display === 'itemized') {
				tax_rates = this.tax_rates();
				_.each(tax_rates, function(tax, key) {
					var tax_sum = 0;
					tax_sum = _.reduce( _.compact( this.pluck( 'line_tax_' + key ) ), function(memo, num){ return memo + num; }, 0 );
					if( tax_sum !== 0 ) {
						itemized_tax[tax.label] = accounting.formatMoney(tax_sum);
					}
				}, this);
			}

			// set some flags
			var show_discount 	= cart_discount !== 0 ? true : false ;
			var show_tax 		= tax !== 0 ? true : false ;
			var show_itemized 	= !_.isEmpty(itemized_tax);

			// create totals object
			var totals = {
				'subtotal'		: accounting.formatMoney(subtotal),
				'cart_discount'	: accounting.formatMoney(cart_discount * -1),
				'tax'			: accounting.formatMoney(tax),
				'total'			: accounting.formatMoney(total),
				'show_discount' : show_discount,
				'show_tax' 		: show_tax,
				'show_itemized'	: show_itemized,
				'itemized_tax'	: itemized_tax,
				'total_check' 	: accounting.formatNumber(total)
			};

			// now, update the totals
			this.totals.model.set( totals );

		},
 
 		/**
 		 * grabs all the itemized taxes and merges them into one array
 		 * @return {array}
 		 */
		tax_rates: function() {
			var tax_rates = [],
				all_rates = {};

			tax_rates = _.compact( this.pluck('tax_rates') );
			if( tax_rates.length > 0 ) {
				all_rates = _.reduce( tax_rates, function(a, b) { return _.merge(a, b); }, {});
			}
			return all_rates;
		},

	});
  
	// 
	return CartItems;
});