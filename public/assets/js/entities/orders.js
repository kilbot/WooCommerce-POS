define(['app', 
	'entities/orders/order',
	'entities/orders/orders'
], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		var API = {
			getOrder: function(id) {
				return new Entities.Order({ id: id });
			},
			getOrders: function() {
				return new Entities.Orders();
			}
		};

		Entities.channel.reply('order:entities', function() {
			return API.getOrders();
		});

		Entities.channel.reply('order:entity', function(id) {
			return API.getOrder(id);
		});

	});

	return;
});