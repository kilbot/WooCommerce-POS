define(['app'], function(POS){
	
	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){
	
		/**
		 * Numpad behavior
		 */
		Numpad.Behavior = Marionette.Behavior.extend({

			initialize: function( options ) {
				// remove any open popovers
				this.on( 'before:destroy', this.removePopovers );
			},

			ui: {
				input: '*[data-numpad]'
			},

			events: {
 				'show:numpad' 		: 'numpadPopover',
 				'click @ui.input' 	: 'numpadPopover',
 				'keydown @ui.input' : 'removePopovers'
 			},

 			onShow: function() {
				if(Modernizr.touch) {
					this.$('*[data-numpad]').attr('readonly', true);
				}
			},

			numpadPopover: function(e) {

				// select the target element
				$(e.target).select();

				// bail if popover is already open
				if( $(e.target).attr('aria-describedby') ) return;

				// nuke any open numpads
				$('*[data-numpad]').trigger( 'close:popover' );

				// open popover
				Numpad.channel.command( 'show:popover', { target: $(e.target) } );

				// on numpad return, close numpad and update value
				$(e.target).on( 'numpad:return', function( e, value ) {
					$(this).trigger( 'close:popover' );
					var enter = jQuery.Event( 'keypress', { which: 13 } );
					$(this).val( value ).trigger(enter);
				});

			},

			removePopovers: function() {
				if( _.isObject( this.ui.input ) ) {
					_.each(this.ui.input, function(input) {
						$(input).trigger( 'close:popover' );
					});
				}
			}

		});

	});

});