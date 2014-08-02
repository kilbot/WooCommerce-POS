define([
	'app',
	'hbs!lib/components/numpad/templates/numpad'
], function(
	POS,
	NumpadTmpl
){
	
	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){
		
		Numpad.NumpadView = Marionette.ItemView.extend({
			template: NumpadTmpl,

		});

	});

});