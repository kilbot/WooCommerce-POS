define(['app', 'lib/entities/localstorage'], function(POS){
	
	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.DisplaySettings = Backbone.Model.extend({
			urlRoot: 'display_settings',
			defaults: {
				id: pos_params.user.id,
				search_mode: 'search'
			}
			
		});

		Entities.configureStorage(Entities.DisplaySettings);

	});

});