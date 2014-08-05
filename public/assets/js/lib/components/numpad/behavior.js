define(['app', 'popover'], function(POS){
	
	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){
	
		Numpad.Behavior = Marionette.Behavior.extend({

			ui: {
				inputField: '*[data-numpad]'
			},

			events: {
				'focus @ui.inputField' : 'onFocus'
			},

			onFocus: function(e) {
				var self = this;

				// close any open popovers
				$('.popover').popover('destroy');

				this.input = $(e.target);
				this.getNumpad();
				this.popOver();

				// listeners
				this.input.on( 'shown.bs.popover', function(){
					self.input.select();
					self.input.selected = true;
				});

				this.input.on( 'hidden.bs.popover', function(){
					self.tearDown();
				});

				this.numpad.on( 'numpad:keypress', function(key){
					var value = self.input.val();
					switch(key) {
						case 'ret': 
							self.input.popover('hide');
							self.input.trigger('blur');
						break;
						case 'del': 
							self.input.val( value.slice(0, -1) );
						break;
						case '+/-': 
							self.input.val( value*-1 );
						break;
						default: 
							if(self.input.selected) {
								self.input.val(key);
								self.input.selected = false;
							} else {
								self.input.val(value + key);
							}
					}
					self.input.trigger('input');
				});
			},

			// get Numpad
			getNumpad: function() {

				// get options from target element
				var data = this.input.data('numpad').split(' ');

				// get numpad view
				this.numpad = POS.Components.channel.request('get:numpad');
				this.numpad.render();
			},

			popOver: function() {

				// get options from target element
				var data = this.input.data('numpad').split(' ');

				// extract options
				var positions = ['left', 'right', 'top', 'bottom'];
				var position = _.first( _.intersection(data, positions) );

				var settings = {
					placement: position
				};

				var options = _.defaults( settings, {
					placement: 'bottom',
					html: true,
					content: this.numpad.$el
				});

				// popover
				this.input.popover(options);
			},

			// only one popover at a time
			tearDown: function() {
				this.numpad.destroy();
			}

		});

	});

});