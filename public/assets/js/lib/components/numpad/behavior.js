define(['app'], function(POS){
	
	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){
	
		/**
		 * Popover behavior
		 */
		Numpad.Behavior = Marionette.Behavior.extend({

			initialize: function( options ) {
				// remove any open popovers
				this.on( 'before:render before:destroy', this.removePopovers );
			},

			events: {
 				'click *[data-numpad]'  : 'numpadPopover'
 			},

 			onShow: function() {
				if(Modernizr.touch) {
					this.$('*[data-numpad]').attr('readonly', true);
				}
			},

			numpadPopover: function(e) {

				// dirty check to see if popover is aleady open
				if( $(e.target).attr('aria-describedby') ) {
					return;
				}

				// much hack, trying to force close popovers
				var self = this;
				this.removePopovers();

				Numpad.channel.command( 'showPopover', { target: $(e.target) } );
				$(e.target).on( 'numpad:return', function( e, value ) {
					$(e.target).val( value ).trigger('blur');
					self.removePopovers();
				});
			},

			removePopovers: function() {
				// nuclear option
				// this needs to be change to only effect popovers attached to this view
				POS.Components.Popover.channel.command( 'close' );
			}

		});

	});

});