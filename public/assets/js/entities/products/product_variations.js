define(['app', 'entities/products/product'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.VariationsCollection = Backbone.Collection.extend({
			model: Entities.Product,

			initialize: function(models, options) {
				console.log(options);
			}
		});

	});

	return;
});