define([
	'app',

	// behaviors
	'lib/components/autogrow/behavior',
	'lib/components/numpad/behavior',

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

		Marionette.Behaviors.getBehaviorClass = function(options, key) {
			switch (key) {
				case 'AutoGrow':
					return Components.AutoGrow.Behavior;
				break;
				case 'Numpad':
					return Components.Numpad.Behavior;
				break;
				default:
					return Marionette.Behaviors.behaviorsLookup[key];
			}
		};

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
			},

			getNumpad: function() {
				var controller = new Components.Numpad.Controller();
				return controller.getNumpadView();
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
		Components.ProgressBar.channel = Backbone.Radio.channel('progressbar');

		Components.ProgressBar.channel.reply( 'get:progressbar', function(options) {
			return API.getProgressBar(options);
		});

		// numpad
		Components.channel.reply( 'get:numpad', function() {
			return API.getNumpad();
		});

	});

});