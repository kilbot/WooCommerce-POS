define([
	'app', 
	'accounting',
	'lib/components/numpad/entities',
	'lib/components/numpad/view',
	'lib/components/numpad/behavior'
], function(
	POS,
	accounting
){

	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){

		/**
		 * API
		 */
		Numpad.channel = Backbone.Radio.channel('numpad');

		Numpad.channel.reply( 'get:view', function(options) {
			var controller = new Numpad.Controller(options);
			return controller.getNumpadView();
		});

		Numpad.channel.comply( 'show:popover', function(options) {
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
					this._showHeaderRegion(options);
					this._showKeysRegion(options);
				});

				_.bindAll(this, '_onShowPopover');

			},

			getNumpadView: function() {
				return this.layout;
			},

			showNumpadPopover: function(options) {
				this.model.set({
					id: options.target.data('id'),
					title: options.target.data('title'),
					type: options.target.data('numpad'),
					original: options.target.data('original')
				});

				if( options.target.val() ) {
					this.model.set({ value: POS.unformat( options.target.val() ) });
				} else {
					this.model.set({ value: POS.unformat( options.target.data('value') )});
				}

				POS.Components.Popover.channel.command( 'open', { 
					target 		: options.target,
					className 	: 'popover numpad-popover',
					attributes 	: { 'role' : 'textbox' },
					callback 	: this._onShowPopover
				});
			},

			getNumpadValue: function() {
				return this.model.get('value');
			},

			_showHeaderRegion: function(options) {
				var view = new Numpad.Header({ model: this.model });

				this.listenTo( view, 'enter:keypress', function(e) {
					value = this.model.get('value');
					value = POS.formatNumber(value, 'auto');
					options.target.trigger( 'numpad:return', value, this );
				});

				this.layout.headerRegion.show( view );
			},

			_showKeysRegion: function(options) {
				var view = new Numpad.Keys({ model: this.model });

				this.listenTo( view, 'return:keypress', function() {
					value = this.model.get('value');
					value = POS.formatNumber(value, 'auto');
					options.target.trigger( 'numpad:return', value, this );
				});

				this.layout.keysRegion.show( view );
			},

			_onShowPopover: function( view ) {
				view.content.show(this.layout);
			}

		});

	});

});