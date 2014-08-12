define(['app', 'jquery-color'], function(POS){
	
	POS.module('Components.Pulse', function(Pulse, POS, Backbone, Marionette, $, _){
	
		Pulse.Behavior = Marionette.Behavior.extend({

			modelEvents: {
				'pulse:item': 'pulseItem'
			},

			pulseItem: function(){
				this.$('td').addClass('bg-success').animate({
					backgroundColor: 'transparent'
				}, 500, function() {
					$(this).removeClass('bg-success').removeAttr('style');
				});
			}

		});

	});

});