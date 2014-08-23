define(['app', 'apps/checkout/payment/view', 'entities/orders'], function(POS, View){
	
	POS.module('CheckoutApp.Payment', function(Payment, POS, Backbone, Marionette, $, _){
	
		Payment.Controller = POS.Controller.Base.extend({

			initialize: function(options) {

				// get cart from local storage
				var items = POS.Entities.channel.request('cart:items', options.cartId);
				var totals = POS.Entities.channel.request('cart:totals', options.cartId);

				// get empty order model
				var order = POS.Entities.channel.request('order:entity');

				// init view
				var view = new View.Checkout({
					model: order
				});

				// create new order
				this.listenTo( view, 'before:render', function(e) {
					order.create(items, totals);
				});

				// return to sale
				this.listenTo( view, 'checkout:close', function(args) {
					POS.CartApp.channel.command('cart:list');
				});

				// return to sale
				this.listenTo( order, 'change:status', function(e) {
					if( e.changed.status === 'completed' ) {
						// go to receipt
					}
				});

				// loader
				this.show( view, { 
					region: POS.rightRegion,
					loading: {
						entities: [ items.fetch({ silent: true }), totals.fetch({ silent: true }) ]
					}
				});

			},

		});
		
	});

});