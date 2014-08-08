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

			get: function() {
				return this.layout;
			},

			_showHeaderRegion: function() {
				var view = new Numpad.Header({ model: this.model });

				this.listenTo( view, 'enter:keypress', function(e) {
					this.layout.trigger( 'popover:close' ); 
					this.layout.trigger( 'numpad:return', this.model.get('value') );
				});

				this.layout.headerRegion.show( view );
			},

			_showKeysRegion: function() {
				var view = new Numpad.Keys({ model: this.model });

				this.listenTo( view, 'return:keypress', function(e) {
					this.layout.trigger( 'popover:close' ); 
					this.layout.trigger( 'numpad:return', this.model.get('value') );
				});

				this.layout.keysRegion.show( view );
			},

			getValue: function() {
				return this.model.get('value');
			}

		});

	});

});