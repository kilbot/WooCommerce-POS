define([
	'app', 
	'lib/components/numpad/entities',
	'lib/components/numpad/view'
], function(
	POS
){

	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){

		Numpad.Controller = Marionette.Controller.extend({

			initialize: function(options) {

				// init numpad model
				this.model = new Numpad.Model(options);

				// init layout
				this.layout = new Numpad.Layout();

				this.listenTo( this.layout, 'show', function() {
					this._showHeaderRegion();
					this._showKeysRegion();
				});

			},

			getNumpadView: function() {
				return this.layout;
			},

			showNumpadPopover: function() {
				this.model.set({
					title: this.options.target.data('title'),
					value: this.options.target.val(),
					type: this.options.target.data('numpad'),
					select: true
				});

				POS.Components.Popover.channel.command( 'open', { 
					target 			: this.options.target,
					popoverTmpl 	: '<div class="arrow"></div><div class="popover-content"></div>',
					className 		: 'popover numpad-popover',
					attributes 		: { 'role' : 'textbox' },
					onShowPopover 	: this._onShowPopover,
					controller 		: this
				});
			},

			closeNumpadPopover: function( target ) {
				POS.Components.Popover.channel.command( 'close', target );
			},

			getNumpadValue: function() {
				return this.model.get('value');
			},

			_showHeaderRegion: function() {
				var view = new Numpad.Header({ model: this.model });

				this.listenTo( view, 'enter:keypress', function(e) {
					this.options.target.trigger( 'numpad:return', this.model.get('value') );
				});

				this.layout.headerRegion.show( view );
			},

			_showKeysRegion: function() {
				var view = new Numpad.Keys({ model: this.model });

				this.listenTo( view, 'return:keypress', function() {
					this.options.target.trigger( 'numpad:return', this.model.get('value') );
				});

				this.layout.keysRegion.show( view );
			},

			_onShowPopover: function() {

				// hijack popover setContent, and show numpad instead
				this.options.target.data('bs.popover').__proto__.setContent = function() {};
				this.content.show(this.options.controller.layout);
			}

		});

	});

});