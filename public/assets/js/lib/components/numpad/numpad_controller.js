define(['app', 'lib/components/numpad/numpad_view'], function(POS){

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

		// return Numpad.NumpadController;

	});

});