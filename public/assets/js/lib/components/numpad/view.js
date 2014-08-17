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
				'change:value change:mode': 'render'			
			},

			events: {
				'keyup @ui.inputField' 	: 'directInput',
				'click *[data-qty]' 	: 'quantity',
				'click *[data-modifier]': 'mode'
			},

			initialize: function() {
				if( this.model.get('type') === 'discount' ){
					this.model.set({ 
						currency_symbol: pos_params.accounting.currency.symbol,
						mode: 'amount'
					});
					this.calcDiscount();
					this.model.on( 'change:value', this.calcDiscount, this );
				} 
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
			},

			mode: function(e) {
				var mode = $(e.currentTarget).data('modifier');
				this.model.set({ mode: mode });
			},

			calcDiscount: function() {
				var value = parseFloat( this.model.get('value') ),
					original = parseFloat( this.model.get('original') );

				if( _.isNaN( value ) ) value = 0;
				var percentage = 100 * ( 1 - ( value / original ) );
				this.model.set({ percentage: percentage });
			}

		});
		
		Numpad.Keys = Marionette.ItemView.extend({
			template: Handlebars.compile( NumkeysTmpl ),

			events: {
				'click .standard button': 'standardKeyEvent',
				'click .discount button': 'discountKeyEvent'
			},

			serializeData: function(){
				var data = {};
				data.type = this.model.get('type');

				if( data.type === 'cash' ) {
					data.quick_key = this.cashKeys( this.model.get('original') );
				}
				
				return data;
			},

			standardKeyEvent: function(e){
				var key = $(e.currentTarget).data('key'),
					value = this.model.get('value'),
					newValue;

				switch(key) {
					case 'ret': 
						this.trigger('return:keypress');
					break;
					case 'del': 
						if(value[value.length-1] === '.') {
							newValue = value.toString().slice(0, -2);
						} else {
							newValue = value.toString().slice(0, -1);
						}
					break;
					case '+/-': 
						newValue = value*-1;
					break;
					default: 
						if( this.model.get('select') ) {
							newValue = key;
							this.model.set({ select: false });
						} else {
							newValue = '' + value + key; // concat as string
						}
				}

				this.model.set({ value: newValue }); // store as ??
			},

			discountKeyEvent: function(e){
				var discount = $(e.currentTarget).data('key');
				this.model.set({
					percentage: discount,
					mode: 'percentage'
				});
			},

			// create 4 quick keys based on amount
			cashKeys: function( amount ){
				var coins = pos_params.denominations.coins,
					notes = pos_params.denominations.notes,
					amount = parseFloat( amount ),
					keys = [],
					x;


				// round for two coins
				_.each( coins, function(coin) {
					if( _.isEmpty(keys) ) {
						x = Math.round( amount / coin );
					} else {
						x = Math.ceil( amount / coin );
					}
					keys.push( x * coin );
				});

				keys = _.uniq(keys, true).slice(0, 2);


				// round for two notes
				_.each( notes, function(note) {
					x = Math.ceil( amount / note );
					keys.push( x * note );
				});

				keys = _.uniq(keys, true).slice(0, 4);

				return keys;
			}

		});

	});

});