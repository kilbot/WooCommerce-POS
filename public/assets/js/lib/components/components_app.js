define([
	'app',

	// behaviors
	'lib/components/autogrow/behavior',

	// controllers
	// 'lib/components/loading/controller',
	'lib/components/modal/controller',
	'lib/components/numpad/controller',
	'lib/components/progress_bar/controller',
	'lib/components/tabs/controller'
	
], function(
	POS
){
	
	POS.module('Components', function(Components, POS, Backbone, Marionette, $, _){

		Components.channel = Backbone.Radio.channel('components');

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
		Components.Modal.channel = Backbone.Radio.channel('modal');

		Components.Modal.controller = new Components.Modal.Controller({
			container: POS.modalRegion
		});

		Components.Modal.channel.comply( 'show:modal', function( template, data ) {
			Components.Modal.controller.getModal( template, data );
		});

		// tabs
		Components.channel.reply( 'get:tabs', function( tabs ) {
			return API.getTabs(tabs);
		});

		// progress bar
		Components.ProgressBar.channel = Backbone.Radio.channel('components');

		Components.ProgressBar.channel.reply( 'get:progressbar', function(options) {
			return API.getProgressBar(options);
		});

	});

});