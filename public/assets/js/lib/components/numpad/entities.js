define(['app'], function(POS){

	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){

		Numpad.Model = Backbone.Model.extend({
			defaults: {
				title: '', // eg: Item Price
				value: '', // eg: 4.25
				input: '', // eg: Cash, Discount
				select: false // select input on init
			}
		});

	});

});