define([
	'app',
	'entities/user/display_settings'
], function(
	POS
){
	
	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		/**
		 * API
		 */
		var API = {
			getDisplaySettings: function(){
				var settings = new Entities.DisplaySettings();
				settings.fetch();
				return settings;
			},
			
		};

		/**
		 * Handlers
		 */
		Entities.channel.reply('user:display:settings', function() {
			return API.getDisplaySettings();
		});

	});

});