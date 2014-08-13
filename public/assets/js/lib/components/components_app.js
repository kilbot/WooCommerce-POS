define([
	'app',

	// behaviors
	'lib/components/autogrow/behavior',
	'lib/components/collapse/behavior',
	'lib/components/popover/behavior',
	'lib/components/modal/behavior',
	'lib/components/select2/behavior',
	'lib/components/pulse/behavior',

	// controllers
	// 'lib/components/loading/controller',
	'lib/components/modal/controller',
	'lib/components/numpad/controller',
	'lib/components/popover/controller',
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
				case 'Popover':
					return Components.Popover.Behavior;
				break;
				case 'Collapse':
					return Components.Collapse.Behavior;
				break;
				case 'Modal':
					return Components.Modal.Behavior;
				break;
				case 'Select2':
					return Components.Select2.Behavior;
				break;
				case 'Pulse':
					return Components.Pulse.Behavior;
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

			showPopover: function(options) {
				var controller = new Components.Popover.Controller(options);
				controller.openPopover(options);
			}
		};

		// modals
		Components.Modal.channel = Backbone.Radio.channel('modal');
		new Components.Modal.Controller();

		// popover
		Components.Popover.channel = Backbone.Radio.channel('popover');
		new Components.Popover.Controller()

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
		Components.Numpad.channel = Backbone.Radio.channel('numpad');

		Components.Numpad.channel.reply( 'getView', function(options) {
			var controller = new Components.Numpad.Controller(options);
			return controller.getNumpadView();
		});

		Components.Numpad.channel.comply( 'showPopover', function(options) {
			var controller = new Components.Numpad.Controller(options);
			controller.showNumpadPopover(options);
		});


	});

});