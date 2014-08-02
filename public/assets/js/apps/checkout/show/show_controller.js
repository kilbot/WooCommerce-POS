define(['app', 'apps/checkout/show/show_view', 'common/views'], function(POS, View){
	
	POS.module('CheckoutApp.Show', function(Show, POS, Backbone, Marionette, $, _){
	
		Show.Controller = Marionette.Controller.extend({

			initialize: function(options) {

				// set cartId
				var id = options.cartId;
				if(0 === id % (!isNaN(parseFloat(id)) && 0 <= ~~id)) {
					this.cartId = id;
				} else {
					this.cartId = 1;
				}

				// loading view
				var loadingView = new POS.Common.Views.Loading();
				POS.rightRegion.show(loadingView);

				// init layout
				this.layout = new View.Layout();

			},

			show: function(){
				
				this.listenTo( this.layout, 'show', function() {
					this._showPaymentRegion();		
					this._showActionsRegion();		
				});

				POS.rightRegion.show(this.layout);

			},

			_showPaymentRegion: function(){
				
				// get payment view
				var view = new View.Payment();

				// show
				this.layout.paymentRegion.show( view );
			},

			_showActionsRegion: function(){
				
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