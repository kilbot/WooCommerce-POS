define(['app', 'handlebars'], function(POS, Handlebars){

	POS.module('CheckoutApp.Show.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-checkout',

			regions: {
				statusRegion: '#checkout-status',
				paymentRegion: '#checkout-payment',
				actionsRegion: '#checkout-actions',
			}
		});

		View.Status = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-checkout-status').html() ),

			initialize: function(options){
				this.total = options.total;
			},

			serializeData: function() {
				return { total: this.total };
			}

		});

		View.Payment = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-checkout-payment').html() ),

			behaviors: {
				Collapse: {
					// options
				},
			},

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