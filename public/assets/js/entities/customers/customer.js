define(['app', 'entities/customers/db'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){
		Entities.Customer = Backbone.Model.extend({
			url: function () {
				return '/wp-json/users/' + this.id;
			}
		});
	});

	return;
});