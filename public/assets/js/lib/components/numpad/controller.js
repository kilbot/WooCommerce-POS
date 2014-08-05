define([
	'app', 
	'lib/components/numpad/view'
], function(
	POS
){

	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){

		Numpad.Controller = Marionette.Controller.extend({

			initialize: function(options) {
				this.view = new Numpad.View();
			},

			getNumpadView: function() {
				return this.view;
			}

		});

	});

});