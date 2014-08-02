define(['app', 'entities/products/db'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.Product = Backbone.Model.extend({
			database: Entities.DB,
			storeName: 'products',

			initialize: function(attributes, options) {
			}
			
		});

	});

	return;
});