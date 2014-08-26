define(['app'], function(POS){
	
	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){
	
		/**
		 * Popover behavior
		 */
		Numpad.Behavior = Marionette.Behavior.extend({

			initialize: function( options ) {
				// remove any open popovers
				// this.on( 'before:render before:destroy', this.removePopovers );
			},

			ui: {
				input: '*[data-numpad]'
			},

			events: {
 				'click @ui.input' : 'numpadPopover',
 				'keydown input'  : 'onBeforeDestroy'
 			},

 			onShow: function() {
				if(Modernizr.touch) {
					this.$('*[data-numpad]').attr('readonly', true);
				}

				this.on( 'before:render', this.onBeforeDestroy );
			},

			numpadPopover: function(e) {

				// nuke any open numpads
				$('*[data-numpad]').trigger( 'close:popover' );

				// open popover
				Numpad.channel.command( 'show:popover', { target: $(e.target) } );

				// collect value from numpad
				$(e.target).on( 'numpad:return', function( e, value ) {
					var enter = jQuery.Event( 'keypress', { which: 13 } );
					$(this).val( value ).trigger(enter);
				});
			},

			onBeforeDestroy: function() {
				_.each(this.ui.input, function(input) {
					$(input).trigger( 'close:popover' );
				});
			}

		});

	});

});