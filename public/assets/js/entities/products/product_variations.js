define(['app', 'paginator', 'entities/products/product'], function(POS, PageableCollection){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.VariationsCollection = Backbone.PageableCollection.extend({
			model: Entities.Product,
		});

	});

	return;
});