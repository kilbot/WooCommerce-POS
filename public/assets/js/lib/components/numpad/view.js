define([
	'app',
	'text!lib/components/numpad/header.html',
	'text!lib/components/numpad/numkeys.html',
	'handlebars'
], function(
	POS,
	HeaderTmpl,
	NumkeysTmpl,
	Handlebars
){
	
	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){

		Numpad.Layout = Marionette.LayoutView.extend({
			template: _.template( '<div class="numpad"><div class="numpad-header"></div><div class="numpad-keys"></div></div>' ),

			regions: {
				headerRegion: '.numpad-header',
				keysRegion: '.numpad-keys',
			},

		});

		Numpad.Header = Marionette.ItemView.extend({
			template: Handlebars.compile( HeaderTmpl ),

			ui: {
				inputField: 'input'
			},

			behaviors: {
				AutoGrow: {},
			},

			modelEvents: {
				'change:value': 'render'
			},

			events: {
				'keyup @ui.inputField' 	: 'directInput',
				'click *[data-qty]' 	: 'quantity'
			},

			initialize: function() {
				this.model.set({ currency_symbol: pos_params.accounting.currency.symbol });
			},

			onShow: function() {
				if( this.model.get('select') ) {
					this.ui.inputField.select();
				}	
			},

			directInput: function(e) {
				var newValue = $(e.target).val();
				this.model.set({ value: newValue.toString(), select: false }, { silent: true });
				if( e.which === 13 ) {
					this.trigger('enter:keypress');
				}
			},

			quantity: function(e) {
				var type = $(e.currentTarget).data('qty'),
					value = this.model.get('value');

				this.model.set('value', (type === 'increase' ? ++value : --value) );
			}

		});
		
		Numpad.Keys = Marionette.ItemView.extend({
			template: Handlebars.compile( NumkeysTmpl ),

			events: {
				'click button': 'onClick'
			},

			onClick: function(e){
				var key = $(e.currentTarget).data('key'),
					value = this.model.get('value'),
					newValue;

				switch(key) {
					case 'ret': 
						this.trigger('return:keypress');
					break;
					case 'del': 
						newValue = value.slice(0, -1);
					break;
					case '+/-': 
						newValue = value*-1;
					break;
					default: 
						if( this.model.get('select') ) {
							newValue = key;
							this.model.set({ select: false });
						} else {
							newValue = value + key;
						}
				}
				
				if( newValue !== undefined ) {
					this.model.set({ value: newValue.toString() });
				}
			},

		});

	});

});