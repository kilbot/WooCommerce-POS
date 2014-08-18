define(['app', 'apps/checkout/payment/view'], function(POS, View){
	
	POS.module('CheckoutApp.Payment', function(Payment, POS, Backbone, Marionette, $, _){
	
		Payment.Controller = POS.Controller.Base.extend({

			initialize: function(options) {

				// get cart items & totals
				this.items = POS.Entities.channel.request('cart:items', options.cartId);
				this.totals = POS.Entities.channel.request('cart:totals', options.cartId);

				// init layout
				this.layout = new View.Layout();

				this.listenTo( this.layout, 'show', function() {
					this._showStatusRegion();		
					this._showPaymentRegion();		
					this._showActionsRegion();		
				});

				// loader
				this.show( this.layout, { 
					region: POS.rightRegion,
					loading: {
						entities: [ this.items.fetch({ silent: true }), this.totals.fetch({ silent: true }) ]
					}
				});

			},

			_showStatusRegion: function(){
				
				// get payment view
				var view = new View.Status({
					model: this.totals
				});

				// show
				this.layout.statusRegion.show( view );
			},

			_showPaymentRegion: function(){
				
				// get payment view
				var view = new View.Payment({
					model: this.totals
				});

				// show
				this.layout.paymentRegion.show( view );
			},

			_showActionsRegion: function(){
				
				// get payment view
				var view = new View.Actions();

				// return to sale
				this.listenTo( view, 'checkout:close', function(args) {
					POS.CartApp.channel.command('cart:list');
				});

				// show
				this.layout.actionsRegion.show( view );
			}

		});
		
	});

});