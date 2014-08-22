define(['app'], function(POS){

	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){

		Numpad.Model = Backbone.Model.extend({
			defaults: {
				title: 'Numpad', // eg: Item Price
				value: '0', // eg: 4.25
				type: 'standard', // eg: quantity, discount
				select: true // select input on init
			},

			initialize: function(){
				// this.on('all', function(e) { console.log(this.get('title') + " event: " + e); }); // debug
			}
		});

	});

});