define(['app'], function(POS){
	
	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.ProductSettings = Backbone.Model.extend({
			urlRoot: 'product_settings',
			defaults: {
				id: pos_params.user.id,
				sync_mode: 'client',
				search_mode: 'search'
			}
			
		});

		Entities.configureStorage(Entities.ProductSettings);

	});

});