define(['app'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.Totals = Backbone.Model.extend({
			urlRoot: 'cart_totals',
			defaults: {
				title 			: 'Cart Totals',
				note			: '',
				order_discount 	: 0,
				customer_id 	: pos_params.customer.default_id,
				customer_name	: pos_params.customer.default_name
			},
			params: pos_params,

			initialize: function(options) {
				// this.on('all', function(e) { console.log("Cart Totals Model event: " + e); }); // debug

				this.cart = options.cart;

				// update totals on change to the cart items
				this.listenTo( options.cart, 'add change remove reset', this.updateTotals );
				this.on( 'change:order_discount', this.updateTotals );

			},

			updateTotals: function() {
				var line_totals 	= 0,
					subtotal 		= 0,
					cart_discount 	= 0,
					order_discount 	= 0,
					tax 			= 0,
					total 			= 0,
					itemized_tax 	= {},
					tax_rates 		= {};

				// if cart is empty
				if( this.cart.length === 0 ) {
					
					// clear the cart totals
					this.save( this.defaults, { silent: true });
				}

				// sum up the line totals
				line_totals = _( this.cart.pluck('line_total') ).reduce( function(memo, num){ return memo + num; }, 0 );
				cart_discount = _( this.cart.pluck('total_discount') ).reduce( function(memo, num){ return memo + num; }, 0 );
				
				if( this.params.wc.calc_taxes === 'yes' ) {
					tax = _( this.cart.pluck('line_tax') ).reduce( function(memo, num){ return memo + num; }, 0 );			
				}

				// get order discount
				order_discount = this.get('order_discount');

				// totals calc
				subtotal = line_totals + cart_discount;
				total = line_totals + tax - order_discount;

				// special case: display cart with tax
				if ( this.params.wc.tax_display_cart === 'incl' ) {
					subtotal += tax;
				}

				// special case: itemized taxes
				if( tax !== 0 && this.params.wc.tax_total_display === 'itemized') {
					tax_rates = this.tax_rates();
					_.each(tax_rates, function(tax, key) {
						var tax_sum = 0;
						tax_sum = _.reduce( _.compact( this.cart.pluck( 'line_tax_' + key ) ), function(memo, num){ return memo + num; }, 0 );
						if( tax_sum !== 0 ) {
							itemized_tax[tax.label] = tax_sum;
						}
					}, this);
				}

				// set some flags
				var show_cart_discount 	= cart_discount !== 0 ? true : false ;
				var show_order_discount = order_discount !== 0 ? true : false ;
				var show_tax 			= tax !== 0 ? true : false ;
				var show_itemized 		= !_.isEmpty(itemized_tax);

				// create totals object
				var totals = {
					'subtotal'				: subtotal,
					'cart_discount'			: cart_discount,
					'tax'					: tax,
					'total'					: total,
					'show_cart_discount' 	: show_cart_discount,
					'show_order_discount' 	: show_order_discount,
					'show_tax' 				: show_tax,
					'show_itemized'			: show_itemized,
					'itemized_tax'			: itemized_tax
				};

				// now, update the totals
				this.save( totals );

			},
	 
	 		/**
	 		 * grabs all the itemized taxes and merges them into one array
	 		 * @return {array}
	 		 */
			tax_rates: function() {
				var tax_rates = [],
					all_rates = {};

				tax_rates = _.compact( this.cart.pluck('tax_rates') );
				if( tax_rates.length > 0 ) {
					all_rates = _.reduce( tax_rates, function(a, b) { return _.merge(a, b); }, {});
				}
				return all_rates;
			},

		});

		Entities.configureStorage(Entities.Totals);

	});

	return;
});