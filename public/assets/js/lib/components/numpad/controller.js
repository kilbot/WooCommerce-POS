define(['app', 'lib/components/numpad/view'], function(POS){

	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){

		Numpad.NumpadController = Marionette.Controller.extend({

			initialize: function(options) {
				var numpadView = this.getNumpadView();
				this.show(numpadView);
			},

			getNumpadView: function() {
				return new Numpad.NumpadView();
			}

		});

		POS.commands.setHandler('show:numpad', function() {
			return new Numpad.NumpadController();
		});

	});

});