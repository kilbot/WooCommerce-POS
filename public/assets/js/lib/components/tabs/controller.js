define([
	'app',
	'lib/components/tabs/entities',
	'lib/components/tabs/view'
], function(
	POS
){

	POS.module('Components.Tabs', function(Tabs, POS, Backbone, Marionette, $, _){

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