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
				// this.on('all', function(e) { console.log("Cart Items View event: " + e); }); // debug
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
				'keypress input'  		: 'saveOnEnter',
      			'blur input'      		: 'onBlur'
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

				// check for sensible input
				if( _.isNaN( parseFloat( value ) ) ) {
					input.select();
					return;
				}

				// always store numbers as float
				if( value ){
					value = POS.unformat( value );
					value = parseFloat( value );
				}

				// if qty is 0, delete the item
				if( key === 'qty' && value === 0 ) { 
					this.removeItem();
					return;
				}

				// save
				var data = {};
				data[key] = value;
				this.model.save(data);

			},

			saveOnEnter: function(e) {

				// enter key triggers blur as well?
				if ( e.which === 13 ) { 
					this.save(e);
					this.model.trigger('change');
				}

			},

			onBlur: function(e) {
				if( $(e.target).attr('aria-describedby') === undefined ) {
					this.save(e);
					this.model.trigger('change');
				}
			} 

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
				AutoGrow: {},
				Numpad: {}
			},

			modelEvents: {
				'change': 'render'
			},

			events: {
				'click .order-discount td' 		: 'edit',
				'keypress .order-discount input': 'saveOnEnter',
				'blur .order-discount input'	: 'onBlur'
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

				// orginal total for calculating percentage discount
				data.original = data.total + data.order_discount;

				return data;
			},

			edit: function(e) {
				$(e.currentTarget).addClass('editing').children('input').trigger('show:numpad');
			},

			save: function(e) {
				var input 	= $(e.target),
					value 	= input.val();

				// check for sensible input
				if( _.isNaN( parseFloat( value ) ) ) {
					input.select();
					return;
				}

				// always store numbers as float
				if( value ){
					value = POS.unformat( value );
					value = parseFloat( value );
				}

				// save
				this.model.save({ order_discount: value });

			},

			saveOnEnter: function(e) {

				if (e.which === 13) { 
					this.save(e);
					this.model.trigger('change');
				}
			},

			showDiscountRow: function() {
				this.$('.order-discount').show().children('td').trigger('click');
			},

			onBlur: function(e) {
				if( $(e.target).attr('aria-describedby') === undefined ) {
					this.save(e);
					this.model.trigger('change');
				}
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