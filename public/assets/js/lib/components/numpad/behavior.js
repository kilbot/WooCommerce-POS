define(['app', 'popover'], function(POS){
	
	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){
	
		Numpad.Behavior = Marionette.Behavior.extend({

			initialize: function() {
				// check user agent and apply readonly to mobile
				// to prevent keyboard popup?
			},

			ui: {
				inputField: '*[data-numpad]'
			},

			events: {
				'click @ui.inputField' : 'onClick'
			},

			onClick: function(e) {
				var self = this;

				// close any open popovers
				$('.popover').popover('destroy');
				
				this.input = $(e.target);

				this.input.on('show.bs.popover', function(e) {
					console.log(e);
// POS.Components.channel.request('show:numpad', { region: view.content });
				});


				var settings = {};
var view = new Numpad.Popover();
view.render();

				var options = _.defaults( settings, {
					placement: 'bottom',
					content: 'hi',
					html: true,
					trigger: 'manual',
					container: 'body',
					template: view.el
				});

				// popover
				this.input.popover(options);

				this.input.popover('show');

				POS.Components.channel.request('show:numpad', { region: view.content });
			},

			// get Numpad
			getNumpad: function() {

				// get options from target element
				var data = this.input.data('numpad').split(' ');

				// get numpad view
				POS.Components.channel.request('show:numpad', { region: this.layout.numpadRegion });
				// this.numpad = POS.Components.channel.request('get:numpad');
				// this.numpad.render();
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
					content: this.numpad.$el,
					html: true,
					trigger: 'manual',
					container: 'body',
					template: '<div class="popover numpad-popover" role="textbox"><div class="arrow"></div><div class="popover-content"></div></div>'
				});

				// popover
				this.input.popover(options);

			},

		});

	});

});