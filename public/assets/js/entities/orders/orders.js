define([
	'app', 
	'paginator', 
	'entities/orders/order'
], function(
	POS,
	PageableCollection
){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.Orders = Backbone.PageableCollection.extend({
			url: pos_params.wc_api_url + 'orders/',
			model: Entities.Order,

			state: {
				pageSize: 20,
			},
			
			initialize: function(models, options) {

			},

		});

	});

	return;
});