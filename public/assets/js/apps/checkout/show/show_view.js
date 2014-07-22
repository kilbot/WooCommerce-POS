define(['app', 'handlebars'], function(POS, Handlebars){

	POS.module('CheckoutApp.Show.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-checkout',

			regions: {
				paymentRegion: '#checkout-payment',
				actionsRegion: '#checkout-actions',
			}
		});

		View.Payment = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-checkout-payment').html() ),
		});

		View.Actions = Marionette.ItemView.extend({
			template: _.template( $('#tmpl-checkout-actions').html() ),

			triggers: {
				'click .action-close' 	: 'checkout:close',
				'click .action-process' : 'checkout:process',
			}

		});

	});

	return POS.CheckoutApp.Show.View;
});