
define(['app', 'handlebars'], function(POS, Handlebars){

	POS.module('CartApp.Receipt.View', function(View, POS, Backbone, Marionette, $, _){

		View.Receipt = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-receipt').html() ),

			triggers: {
				'click .action-email' 	: 'email:receipt',
				'click .action-refresh' : 'refresh:receipt',
				'click .action-new-order': 'new:order'
			},

			events: {
				'click .action-print' 	: 'printReceipt',
			},

			serializeData: function() {
				var data = this.model.toJSON();

				// itemized tax
				if( pos_params.wc.tax_total_display === 'itemized' ) {
					data.show_itemized = true;
				}

				// prices include tax?
				if( pos_params.wc.prices_include_tax === 'yes' ) {
					data.prices_include_tax = true;
				}

				return data;
			},

			onRender: function() {

				// var message = '<table class=\"bwwc-payment-instructions-table\" id=\"bwwc-payment-instructions-table\">\n<tr class=\"bpit-table-row\">\n<td colspan=\"2\">Please send your bitcoin payment as follows:<\/td>\n<\/tr>\n<tr class=\"bpit-table-row\">\n<td style=\"vertical-align:middle\" class=\"bpit-td-name bpit-td-name-amount\">\n      Amount (<strong>BTC<\/strong>):\n    <\/td>\n<td class=\"bpit-td-value bpit-td-value-amount\">\n<div style=\"border:1px solid #FCCA09;padding:2px 6px;margin:2px;background-color:#FCF8E3;color:#CC0000;font-weight: bold;font-size: 120%\">\n      \t0.08533582\n      <\/div>\n<\/td>\n<\/tr>\n<tr class=\"bpit-table-row\">\n<td style=\"vertical-align:middle\" class=\"bpit-td-name bpit-td-name-btcaddr\">\n      Address:\n    <\/td>\n<td class=\"bpit-td-value bpit-td-value-btcaddr\">\n<div style=\"border:1px solid #FCCA09;padding:2px 6px;margin:2px;background-color:#FCF8E3;color:#555;font-weight: bold;font-size: 120%\">\n        16YdyjR8bEnafrtHZEpjiSsXVd4xV1Rws\n      <\/div>\n<\/td>\n<\/tr>\n<tr class=\"bpit-table-row\">\n<td style=\"vertical-align:middle\" class=\"bpit-td-name bpit-td-name-qr\">\n\t    QR Code:\n    <\/td>\n<td class=\"bpit-td-value bpit-td-value-qr\">\n<div style=\"border:1px solid #FCCA09;padding:5px;margin:2px;background-color:#FCF8E3\">\n        <a href=\"\/\/16YdyjR8bEnafrtHZEpjiSsXVd4xV1Rws?amount=0.08533582\"><img src=\"https:\/\/blockchain.info\/qr?data=bitcoin:\/\/16YdyjR8bEnafrtHZEpjiSsXVd4xV1Rws?amount=0.08533582&amp;size=180\" style=\"vertical-align:middle;border:1px solid #888\" \/><\/a>\n      <\/div>\n<\/td>\n<\/tr>\n<\/table>\n<p>Please note:<\/p>\n<ol class=\"bpit-instructions\">\n<li>You must make a payment within 1 hour, or your order will be cancelled<\/li>\n<li>As soon as your payment is received in full you will receive email confirmation with order delivery details.<\/li>\n<li>You may send payments from multiple accounts to reach the total required.<\/li>\n<\/ol>\n';
				// this.$('#receipt-message').html(message);

			},

			printReceipt: function() {
				if(POS.debug) console.log('fetching receipt template');

				var data = this.model.toJSON();

				// itemized tax
				if( pos_params.wc.tax_total_display === 'itemized' ) {
					data.show_itemized = true;
				}

				// prices include tax?
				if( pos_params.wc.prices_include_tax === 'yes' ) {
					data.prices_include_tax = true;
				}

				var self = this;
				$.when( this.fetchTemplate() )
				.done( function( receiptTmpl ) {
					var template = Handlebars.compile( receiptTmpl );
					var html = template( data );
					POS.Components.Print.channel.command('print', html);
				})
				.fail( function() {
					if(POS.debug) console.warn('problem receipt template');
				});				
			},

			fetchTemplate: function() {
				return $.get( 
					pos_params.ajax_url , { 
						action: 'pos_get_print_template', 
						template: 'receipt',
						security: pos_params.nonce 
					} 
				);
			},

		});

		View.EmailModal = Marionette.ItemView.extend({
			initialize: function (options) {
				var self = this;

				if(POS.debug) console.log('fetching modal email receipt template');

				$.when( this.fetchTemplate() )
				.done( function( data ) {
					self.template = _.template(data);
					self.trigger('modal:open');
				})
				.fail( function() {
					if(POS.debug) console.warn('problem fetching email receipt template');
				});
			},

			render: function(options) {
				options || ( options = {} );
				_.defaults( options, {
					result: false,
					message: ''
				});
				this.$el.html( this.template(options) );
				return this;
			},

			behaviors: {
				Modal: {}
			},

			triggers: {
				'click .action-send': 'send:email',
			},

			events: {
				'click .close' 		 : 'cancel',
				'click .action-close': 'cancel'
			},

			cancel: function () {
				this.trigger('modal:close');
			},

			fetchTemplate: function() {
				return $.get( 
					pos_params.ajax_url , { 
						action: 'pos_get_modal', 
						template: 'email-receipt',
						security: pos_params.nonce 
					} 
				);
			},

		});

	});

	return POS.CartApp.Receipt.View;

});