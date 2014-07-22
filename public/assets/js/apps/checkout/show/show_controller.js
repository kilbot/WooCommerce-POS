define(['app', 'apps/checkout/show/show_view', 'common/views'], function(POS, View){
	
	POS.module('CheckoutApp.Show', function(Show, POS, Backbone, Marionette, $, _){
	
		Show.Controller = Marionette.Controller.extend({

			initialize: function(options) {

				// loading view
				var loadingView = new POS.Common.Views.Loading();
				POS.rightRegion.show(loadingView);

				// init layout
				this.layout = new View.Layout();
				
				// show
				this.showCheckout();
			},

			showCheckout: function(){
				
				this.listenTo( this.layout, 'show', function() {
					this.paymentRegion();		
					this.actionsRegion();		
				});

				POS.rightRegion.show(this.layout);

			},

			paymentRegion: function(){
				
				// get payment view
				var view = new View.Payment();

				// show
				this.layout.paymentRegion.show( view );
			},

			actionsRegion: function(){
				
				// get payment view
				var view = new View.Actions();

				// return to sale
				this.listenTo( view, 'checkout:close', function(args) {
					POS.trigger('cart:list');
				});

				// show
				this.layout.actionsRegion.show( view );
			}

		});
		
	});

	return POS.CheckoutApp.Show.Controller;
});