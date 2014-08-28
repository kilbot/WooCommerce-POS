define(['app', 'entities/cart/item', 'localstorage'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.CartItems = Backbone.Collection.extend({
			model: Entities.CartItem,

			initialize: function(models, options) { 
				this.on('all', function(e) { console.log("Cart Items event: " + e); }); // debug	
				
				// localStorage
				this.localStorage = new Backbone.LocalStorage( 'cart-' + options.cartId );

				// update totals on change to collection
				this.on( 'add remove change', this.calcTotals );
			},

			calcTotals: function() {
				var subtotal 		= 0,
					subtotal_tax 	= 0,
					cart_discount 	= 0,
					total_tax 		= 0,
					itemized_tax 	= [],
					tax_rates 		= {};

				// sum up the line totals
				subtotal 	  = _( this.pluck('line_subtotal') ).reduce( function(memo, num){ return memo + num; }, 0 );
				subtotal_tax  = _( this.pluck('line_subtotal_tax') ).reduce( function(memo, num){ return memo + num; }, 0 );
				total 		  = _( this.pluck('line_total') ).reduce( function(memo, num){ return memo + num; }, 0 );
				
				if( pos_params.wc.calc_taxes === 'yes' ) {
					total_tax = _( this.pluck('line_tax') ).reduce( function(memo, num){ return memo + num; }, 0 );			
				}

				// special case: itemized taxes
				if( total_tax !== 0 ) {
					tax_rates = this._tax_rates();
					_.each(tax_rates, function(tax, key) {
						var tax_sum = 0;
						tax_sum = _.reduce( _.compact( this.pluck( 'line_tax_' + key ) ), function(memo, num){ return memo + num; }, 0 );
						if( tax_sum !== 0 ) {
							itemized_tax.push({
								id: key,
								label: tax.label,
								total: POS.round( tax_sum, 4 )
							});
						}
					}, this);
				}

				// create totals object
				var totals = {
					'subtotal'		: POS.round( subtotal, 4 ),
					'subtotal_tax'	: POS.round( subtotal_tax, 4 ),
					'cart_discount'	: POS.round( subtotal - total, 4 ),
					'total_tax'		: POS.round( total_tax, 4 ),
					'itemized_tax'	: itemized_tax,
				};

				// now, update the totals
				this.trigger('update:totals', totals);

			},
	 
	 		/**
	 		 * grabs all the itemized taxes and merges them into one array
	 		 * @return {array}
	 		 */
			_tax_rates: function() {
				var tax_rates = [],
					all_rates = {};

				tax_rates = _.compact( this.pluck('tax_rates') );
				if( tax_rates.length > 0 ) {
					all_rates = _.reduce( tax_rates, function(a, b) { return _.merge(a, b); }, {});
				}
				return all_rates;
			},

		});

	});

	return POS.Entities.CartItems;
});