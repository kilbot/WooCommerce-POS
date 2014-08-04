define([
	'app', 
	'lib/components/numpad/view',
	'lib/components/numpad/behavior'
], function(
	POS
){

	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){

		Numpad.Controller = Marionette.Controller.extend({

			initialize: function(options) {
				var numpadView = this.getNumpadView();
				this.show(numpadView);
			},

			getNumpadView: function() {
				return new Numpad.View();
			}

		});

		POS.commands.setHandler('show:numpad', function() {
			return new Numpad.Controller();
		});

	});

});