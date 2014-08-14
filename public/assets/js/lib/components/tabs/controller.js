define([
	'app',
	'lib/components/tabs/entities',
	'lib/components/tabs/view'
], function(
	POS
){

	POS.module('Components.Tabs', function(Tabs, POS, Backbone, Marionette, $, _){

		/**
		 * API
		 */
		Tabs.channel = Backbone.Radio.channel('tabs');

		Tabs.channel.reply( 'get:tabs', function( tabs ) {
			var controller = new Tabs.Controller();
			return controller.getTabView(tabs);
		});

		/**
		 * Controller
		 */
		Tabs.Controller = Marionette.Controller.extend({

			getTabView: function(tabs) {
				var collection = new Tabs.Collection( tabs );
				var view = new Tabs.View({
					collection: collection
				});
				return view;
			}

		});

	});

});