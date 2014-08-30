define(['app', 'apps/cart/checkout/view', 'entities/orders'], function(POS, View){
	
	POS.module('CartApp.Checkout', function(Checkout, POS, Backbone, Marionette, $, _){
	
		Checkout.Controller = POS.Controller.Base.extend({

			initialize: function(options) {

				// get cart from local storage
				var items = POS.Entities.channel.request('cart:items', options.cartId);
				var totals = POS.Entities.channel.request('cart:totals', options.cartId);

				// get empty order model
				var order = POS.Entities.channel.request('order:entity');

				// init view
				var view = new View.Payment({
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
				this.listenTo( order, 'processing:complete', function( response ) {
					view.processing(false);

					// sanitise response
					if( !_.isObject(response) ) {
						if( POS.debug ) console.warn('Attempting to sanitise response');
						response = response.substring(response.indexOf("{") - 1);
    					response = response.substring(0, response.lastIndexOf("}") + 1);
    					response = $.parseJSON(response);
					}

					if( response.result === 'success' ) {
						_.invoke( items.toArray(), 'destroy' );
						POS.CartApp.channel.command('show:receipt', response.order_id );
						POS.Entities.channel.command('product:sync');
					} else {
						view.onErrorResponse(response);
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