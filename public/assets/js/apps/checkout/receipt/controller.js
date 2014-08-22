define(['app', 'apps/checkout/receipt/view', 'entities/orders'], function(POS, View){
	
	POS.module('CheckoutApp.Receipt', function(Receipt, POS, Backbone, Marionette, $, _){
	
		Receipt.Controller = POS.Controller.Base.extend({

			initialize: function(options) {

				// get empty order model
				var order = POS.Entities.channel.request('order:entity', options.orderId);

				// init view
				var view = new View.Receipt({
					model: order
				});

				this.listenTo( view, 'email:receipt', this._emailReceipt );
				
				this.listenTo( view, 'refresh:receipt', function(args){
					args.model.fetch({ data: {pos: 1} });
				});
				
				this.listenTo( view, 'new:order', function() {
					POS.CartApp.channel.command('cart:list');
					POS.navigate('');
				});

				// loader
				this.show( view, { 
					region: POS.rightRegion,
					loading: {
						entities: [ order.fetch({ data: {pos: 1} }) ]
					}
				});

			},

			_emailReceipt: function(args) {
				var order_id = args.model.id;
				var view = new View.EmailModal();

				this.listenTo( view, 'send:email', function(args){
					
					var email = args.view.$('input[type=email]').val();
					$.post( 
						pos_params.ajax_url , { 
							action: 'pos_email_receipt',
							order_id: order_id,
							email: email,
							security: pos_params.nonce
						} 
					);

				})
			},

		});
		
	});

});