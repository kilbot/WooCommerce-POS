define(['app', 'popover'], function(POS){
	
	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){
	
		Numpad.Behavior = Marionette.Behavior.extend({

			ui: {
				input: '.numpad'
			},

			events: {
				'click @ui.input' : 'onClick'
			},

			onClick: function(e) {
				this.$('input').popover({
					placement: 'bottom',
					html: true,
					content: $('#numpad')
				});
			}

		});

	});

});