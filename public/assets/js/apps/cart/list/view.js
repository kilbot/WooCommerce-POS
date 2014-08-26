define(['app', 'handlebars', 'accounting'], function(POS, Handlebars, accounting){

	POS.module('CartApp.List.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-cart-layout',

			regions: {
				cartRegion: '#cart',
				cartCustomerRegion: '#cart-customer',
				cartActionsRegion: '#cart-actions',
				cartNotesRegion: '#cart-notes'
			},

			initialize: function() {

				// move this to a regionClass?
				this.cartCustomerRegion.on( 'show', function() {
					this.$el.show();
				});
				this.cartActionsRegion.on( 'show', function() {
					this.$el.show();
				});
				this.cartNotesRegion.on( 'show', function() {
					this.$el.show();
				});
				this.cartCustomerRegion.on( 'empty', function() {
					this.$el.hide();
				});
				this.cartActionsRegion.on( 'empty', function() {
					this.$el.hide();
				});
				this.cartNotesRegion.on( 'empty', function() {
					this.$el.hide();
				});
			}

		});
		
		View.CartItem = Marionette.ItemView.extend({
			tagName: 'tr',
			template: Handlebars.compile( $('#tmpl-cart-item').html() ),

			initialize: function( options ) {

			},

			behaviors: {
				AutoGrow: {},
				Pulse: {},
				Numpad: {}
			},

			modelEvents: {
				'change': 'render'
			},

			events: {
				'click .action-remove' 	: 'removeItem',
				'keypress input'  		: 'updateOnEnter',
      			'blur input'      		: 'save'
			},

			serializeData: function() {
				var data = this.model.toJSON();

				// discount
				if( data.line_discount !== 0 ) {
					data.show_line_discount = true;
				}

				return data;
			},

			remove: function() {
				this.$el.parent('tbody').addClass('animating');
				this.$('td').addClass('bg-danger');
				var self = this;
				this.$el.fadeOut( 500, function() {
					self.$el.parent('tbody').removeClass('animating');
					Marionette.ItemView.prototype.remove.call(self);
				});
			},

			removeItem: function() {
				this.model.destroy();
			},

			save: function(e) {
				var input 	= $(e.target),
					key 	= input.data('id'),
					value 	= input.val();

				// always store numbers as float
				if( value ){
					console.log(value);
					value = accounting.unformat( value, pos_params.accounting.number.decimal );
					value = parseFloat( value );
				}

				switch( key ) {
					case 'qty':
						if ( value === 0 ) {
							this.removeItem();
							break;
						}
						if ( value ) {
							this.model.save({ qty: value });
						}
						break;

					case 'price':
						if( !isNaN( value ) ) {
							this.model.save({ item_price: value });
						}
						break;		
				}

				input.focus();
			},

			updateOnEnter: function(e) {

				// enter key triggers blur as well?
				if ( e.which === 13 ) { 
					this.save(e); 
					this.render(); 
				}
			},

		});

		var NoCartItemsView = Marionette.ItemView.extend({
			tagName: 'tr',
			className: 'empty',
			template: '#tmpl-cart-empty',
		});

		View.CartItems = Marionette.CompositeView.extend({
			template: '#tmpl-cart-items',
			childView: View.CartItem,
			childViewContainer: 'tbody',
			emptyView: NoCartItemsView,

		});

		View.CartTotals = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-cart-totals').html() ),

			behaviors: {
				// Numpad: {}
			},

			modelEvents: {
				'sync': 'render'
			},

			events: {
				'click .order-discount' 	: 'edit',
				'keypress .order-discount'	: 'saveOnEnter',
				'blur .order-discount'		: 'save',
			},

			serializeData: function() {
				var data = this.model.toJSON();

				// show/hide cart discount
				if( data.cart_discount !== 0 ) {
					data.show_cart_discount = true;
				}

				// show/hide tax
				if( data.tax !== 0 ) {
					data.show_tax = true;
					if( pos_params.wc.tax_total_display === 'itemized' ) {
						data.show_itemized = true;
					}
				}

				// show/hide order discount
				if( data.order_discount !== 0 ) {
					data.show_order_discount = true;
				}

				// prices include tax?
				if( pos_params.wc.prices_include_tax === 'yes' ) {
					data.prices_include_tax = true;
				}

				return data;
			},

			edit: function(e) {
				var td = $(e.currentTarget).children('td');
				td.attr('contenteditable','true').text( td.data('value') );
			},

			save: function(e) {
				var value = $(e.target).text();

				// if empty, go back to zero
				if( value === '' ) { value = 0; } 

				// unformat number
				var decimal = accounting.unformat( value, pos_params.accounting.number.decimal );

				// // validate
				if( isNaN( parseFloat( decimal ) ) ) {
					$(e.target).focus(); 
					return;
				}	

				// save
				this.model.set({ order_discount: decimal });
			},

			saveOnEnter: function(e) {

				// save note on enter
				if (e.which === 13) { 
					e.preventDefault();
					this.save(e);
					// $(e.currentTarget).children('td').blur();
				}
			},

			addDiscount: function() {
				console.log('discount!');
			},

			showDiscountRow: function() {
				// toggle discount row
				td = this.$('.order-discount').show().children('td');
				td.attr('contenteditable','true').text( td.data('value') );
			}

		});

		View.CartActions = Marionette.ItemView.extend({
			template: _.template( $('#tmpl-cart-actions').html() ),

			initialize: function() {
				// this.on('all', function(e) { console.log("Cart Actions View event: " + e); }); // debug
			},

			triggers: {
				'click .action-void' 	: 'cart:void:clicked',
				'click .action-note' 	: 'cart:note:clicked',
				'click .action-discount': 'cart:discount:clicked',
				'click .action-checkout': 'cart:checkout:clicked'
			}

		});

		View.Notes = Marionette.ItemView.extend({
			template: _.template( '<%= note %>' ),

			modelEvents: {
				'change:note': 'render'
			},

			events: {
				'click' 	: 'edit',
				'keypress'	: 'saveOnEnter',
				'blur'		: 'save',
			},

			onShow: function() {
				this.showOrHide();
			},

			showOrHide: function() {
				if( this.model.get('note') === '' ) {
					this.$el.parent('#cart-notes').hide();
				}
			},

			edit: function(e) {
				this.$el.attr('contenteditable','true').focus();
			},

			save: function(e) {
				var value = this.$el.text();

				// validate and save
				this.model.set({ note: value });
				this.$el.attr('contenteditable','false');
				this.showOrHide();
			},

			saveOnEnter: function(e) {
				// save note on enter
				if (e.which === 13) { 
					e.preventDefault();
					this.$el.blur();
				}
			},

			showNoteField: function() {
				this.$el.parent('#cart-notes').show();
				this.$el.attr('contenteditable','true').focus();
			}
		});

	});

	return POS.CartApp.List.View;

});