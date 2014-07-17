define(['app', 'apps/config/storage/localstorage'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.Totals = Backbone.Model.extend({
			urlRoot: 'cart_totals'
			
		});

		Entities.configureStorage(Entities.Totals);

	});

	return;
});