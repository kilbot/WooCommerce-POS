define([
	'app',
	'text!lib/components/numpad/header.html',
	'text!lib/components/numpad/numkeys.html',
	'handlebars',
	'accounting'
], function(
	POS,
	HeaderTmpl,
	NumkeysTmpl,
	Handlebars,
	accounting
){
	
	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){

		Numpad.Layout = Marionette.LayoutView.extend({
			template: _.template( '<div class="numpad"><div class="numpad-header"></div><div class="numpad-keys"></div></div>' ),

			regions: {
				headerRegion: '.numpad-header',
				keysRegion: '.numpad-keys',
			}

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
				'change:value change:percentage change:mode': 'render'
			},

			events: {
				'keyup @ui.inputField' 	: 'directInput',
				'click *[data-qty]' 	: 'quantity',
				'click *[data-modifier]': 'mode'
			},

			initialize: function() {
				if( this.model.get('type') === 'discount' || this.model.get('type') === 'item_price' ){
					this.model.set({ 
						currency_symbol: pos_params.accounting.currency.symbol,
						mode: 'amount'
					});
					this.calcPercentage();
					this.model.on( 'change:value', this.calcPercentage, this );
					this.model.on( 'change:percentage', this.calcValue, this );
				} 
			},

			serializeData: function(){
				var data = this.model.toJSON();

				if( this.model.get('type') === 'discount' || this.model.get('type') === 'item_price' ){
					data.show_discount_input = true;
				}
					
				return data;
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

			calcPercentage: function() {
				var original = this.model.get('original'),
					value = this.model.get('value'),
					percentage;

				if( _.isNaN( value ) ) value = 0;

				if( this.model.get('type') === 'item_price' ) {
					percentage = 100 * ( 1 - ( value / original ) );
				} else {
					percentage = 100 * ( value / original );
				}

				if( !_.isFinite( percentage ) || _.isNaN( percentage ) ) percentage = 0;
				
				percentage = parseFloat( POS.round( percentage, 0 ) );
				this.model.set({ percentage: percentage }, { silent: true });

			},

			calcValue: function() {
				var original = this.model.get('original'),
					percentage = this.model.get('percentage'),
					value;

				if( _.isNaN( percentage ) ) percentage = 0;

				if( this.model.get('type') === 'item_price' ) {
					value = original * ( 1 - ( percentage / 100 ) );
				} else {
					value = original * ( percentage / 100 );
				}
				
				value = parseFloat( POS.round( value ) );
				this.model.set({ value: value }, { silent: true });
			}

		});
		
		Numpad.Keys = Marionette.ItemView.extend({
			template: Handlebars.compile( NumkeysTmpl ),

			events: {
				'click .standard button': 'standardKeyEvent',
				'click .discount button': 'discountKeyEvent',
				'click .cash button' 	: 'cashKeyEvent',
			},

			serializeData: function(){
				var data = {};
				data.type = this.model.get('type');

				if( data.type === 'discount' || data.type === 'item_price' ) {
					data.show_discount_keys = true;
				}

				if( data.type === 'cash' ) {
					data.show_cash_keys = true;
					data.quick_key = this.cashKeys( this.model.get('original') );
				}

				data.decimal = pos_params.accounting.number.decimal;
				
				return data;
			},

			standardKeyEvent: function(e){
				var key = $(e.currentTarget).data('key'),
					value,
					newValue;

				if( this.model.get('mode') === 'percentage' ) {
					value = this.model.get('percentage');
				} else {
					value = this.model.get('value');
				}

				switch(key) {
					case 'ret': 
						this.trigger('return:keypress');
					break;
					case 'del': 
						value = value.toString();
						if( value.length === 1 ) {
							newValue = 0;
						} else {
							newValue = value.slice(0, -1);
						}
						newValue = parseFloat(newValue);
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

				if( this.model.get('mode') === 'percentage' ) {
					this.model.set({ percentage: newValue });
				} else {
					this.model.set({ value: newValue });
				}
				
			},

			discountKeyEvent: function(e){
				var discount = $(e.currentTarget).data('key');
				this.model.set({
					percentage: discount,
					mode: 'percentage'
				});
			},

			cashKeyEvent: function(e) {
				var cash = $(e.currentTarget).data('key');
				this.model.set({ value: cash });
			},

			// create 4 quick keys based on amount
			cashKeys: function( amount ){
				var coins = pos_params.denominations.coins,
					notes = pos_params.denominations.notes,
					amount = parseFloat( amount ),
					keys = [],
					x;

				if(amount === 0) {
					return notes.slice(-4);
				}

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