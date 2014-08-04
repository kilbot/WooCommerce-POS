define([
	'app',

	// behaviors
	'lib/components/autogrow/behavior',

	// controllers
	'lib/components/loading/controller',
	'lib/components/modal/controller',
	'lib/components/numpad/controller',
	'lib/components/progress_bar/controller',
	'lib/components/tabs/controller'
	
], function(
	POS
){
	
	POS.module('Components', function(Components, POS, Backbone, Marionette, $, _){


		var API = {

			// returns new tabs view
			getTabs: function(tabs) {
				var controller = new Components.Tabs.Controller();
				return controller.getTabView(tabs);
			},

			// returns new progress bar view
			getProgressBar: function(options) {
				var controller = new Components.ProgressBar.Controller();
				return controller.getProgressBarView(options);
			} 
		};

		// modals
		Components.Modal.channel = new Backbone.Wreqr.Channel('modal');

		Components.Modal.controller = new Components.Modal.Controller({
			container: POS.modalRegion
		});

		POS.commands.setHandler( 'show:modal', function( template, data ) {
			Components.Modal.controller.getModal( template, data );
		});

		// tabs
		POS.reqres.setHandler( 'get:tabs:component', function( tabs ) {
			return API.getTabs(tabs);
		});

		// progress bar
		POS.reqres.setHandler( 'get:progressbar:component', function(options) {
			return API.getProgressBar(options);
		});

	});

});