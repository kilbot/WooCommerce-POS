define([
	'app',
	// 'lib/components/print/view'
], function(
	POS
){

	POS.module('Components.Print', function(Print, POS, Backbone, Marionette, $, _){

		/**
		 * API
		 */
		Print.channel = Backbone.Radio.channel('print');
		
		Print.channel.comply( 'print', function(options) {
			var controller = new Print.Controller();
			controller.print(options);

		});

		/**
		 * Controller
		 */
		Print.Controller = Marionette.Controller.extend({

			initialize: function() {
				var iframe = '<iframe id="printIframe" name="printIframe" src="about:blank" style="position:absolute;top:-9999px;left:-9999px;border:0px;overfow:none; z-index:-1"></iframe>';
				$('body').append(iframe);
			},

			print: function(options) {
				frames['printIframe'].document.write(options);
				frames['printIframe'].focus();
 				frames['printIframe'].print();
 				$('#printIframe').remove();
			}

		});

	});

});