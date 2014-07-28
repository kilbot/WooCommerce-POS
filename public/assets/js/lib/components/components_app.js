define([
	'app',
	'lib/components/loading/loading_controller',
	'lib/components/numpad/numpad_controller',
], function(
	POS, 
	LoadingController
){
	
	POS.module('Components', function(Components, POS, Backbone, Marionette, $, _){

		POS.commands.setHandler('show:loading', function(view, options) {
			return new LoadingController({
				view: view,
				region: options.region,
				config: options.loading
			});
		});

		POS.commands.setHandler('show:numpad', function() {
			return new Components.Numpad.NumpadController();
		});

	});

});