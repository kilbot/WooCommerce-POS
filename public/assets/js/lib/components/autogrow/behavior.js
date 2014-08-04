define(['app'], function(POS){
	
	POS.module('Components.AutoGrow', function(AutoGrow, POS, Backbone, Marionette, $, _){
	
		AutoGrow.Behavior = Marionette.Behavior.extend({

			initialize: function(){
				this.tester = $('<div />').css({
					opacity     : 0,
					top         : -9999,
					left        : -9999,
					position    : 'absolute',
					whiteSpace  : 'nowrap',
				});
				$('body').append(this.tester);
			},

			ui: {
				input: '.autogrow'
			},

			events: {
				'input @ui.input' : 'onInputEvent'
			},

			onRender: function() {
				_.each( this.ui.input, function( input ) {
					$(input).trigger('input');
				});
			},

			onInputEvent: function(e) {
				var input  	= $(e.target);
				var value 	= input.val();

				value = value.replace(/&/g, '&amp;')
								.replace(/\s/g,'&nbsp;')
								.replace(/</g, '&lt;')
								.replace(/>/g, '&gt;');

				this.tester.html(value);
				var width = this.tester.width() + 20;
				input.width(width);
			}

		});

	});

});