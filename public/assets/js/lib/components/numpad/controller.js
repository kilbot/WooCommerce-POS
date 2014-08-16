define([
	'app', 
	'lib/components/numpad/entities',
	'lib/components/numpad/view',
	'lib/components/numpad/behavior'
], function(
	POS
){

	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){

		/**
		 * API
		 */
		Numpad.channel = Backbone.Radio.channel('numpad');

		Numpad.channel.reply( 'getView', function(options) {
			var controller = new Numpad.Controller(options);
			return controller.getNumpadView();
		});

		Numpad.channel.comply( 'showPopover', function(options) {
			var controller = new Numpad.Controller(options);
			controller.showNumpadPopover(options);
		});

		/**
		 * Controller
		 */
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

				_.bindAll(this, '_onShowPopover');
			},

			getNumpadView: function() {
				return this.layout;
			},

			showNumpadPopover: function() {
				this.model.set({
					title: this.options.target.data('title'),
					value: this.options.target.val(),
					type: this.options.target.data('numpad'),
					original: this.options.target.data('original'),
					select: true
				});

				POS.Components.Popover.channel.command( 'open', { 
					target 			: this.options.target,
					className 		: 'popover numpad-popover',
					attributes 		: { 'role' : 'textbox' },
					onShowPopover 	: this._onShowPopover
				});
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

			_onShowPopover: function( popoverRegion ) {
				popoverRegion.show(this.layout);
			}

		});

	});

});