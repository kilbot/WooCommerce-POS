define(['app', 'handlebars', 'accounting', 'popover', 'autoGrowInput', 'selectText'], function(POS, Handlebars, accounting){

	POS.module('CartApp.List.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-cart-layout',

			regions: {
				cartRegion: '#cart',
				cartCustomerRegion: '#cart-customer',
				cartActionsRegion: '#cart-actions',
				cartNotesRegion: '#cart-notes'
			}
		});
		
		View.CartItem = Marionette.ItemView.extend({
			tagName: 'tr',
			template: Handlebars.compile( $('#tmpl-cart-item').html() ),
			params: pos_params,

			initialize: function( options ) {
				// set the accounting settings
				accounting.settings = this.params.accounting;
			},

			modelEvents: {
				'change': 'render'
			},

			events: {
				'click .action-remove' 	: 'removeFromCart',
				'show.bs.popover' 		: 'showNumpad',
				'click input'  			: 'change',
				'keypress input'  		: 'updateOnEnter',
      			'blur input'      		: 'save'
			},

			onRender: function() {
				this.$('input').autoGrowInput();
			},

			// TODO: abstract this
			onShow: function() {
				this.$('input').popover({
					placement: 'bottom',
					html: true,
					content: $('#numpad')
				}).autoGrowInput();
			},

			// TODO: move this
			showNumpad: function(e) {
				var numpad = new POS.Common.Views.Numpad();
				POS.numpadRegion.show(numpad);
			},

			removeFromCart: function() {
				this.trigger('cartitem:delete', this.model);
			},

			remove: function() {
				var self = this;
				this.$el.fadeOut( 300, function() {
					Marionette.ItemView.prototype.remove.call(self);
				});
			},

			change: function(e) {
				this.$(e.target).addClass('editing').focus().select();
			},

			save: function(e) {
				var input 	= $(e.target),
					key 	= input.data('id'),
					value 	= input.val(),
					decimal = accounting.unformat( value, accounting.settings.number.decimal );

				switch( key ) {
					case 'qty':
						if ( value === this.model.get('qty') ) { break; }
						if ( value === 0 ) {
							this.removeFromCart();
							break;
						}
						if ( value ) {
							this.model.save( { qty: value } );
							input.removeClass('editing');
						} else {
							input.focus();
						}
						break;

					case 'price':
						if( !isNaN( decimal ) ) {
							this.model.save( { display_price: decimal } );
						} else {
							input.focus();
						}
						break;		
				}
			},

			updateOnEnter: function(e) {

				// enter key triggers blur as well?
				if (e.keyCode === 13) { this.save(e); }
			},

		});

		var NoCartItemsView = Marionette.ItemView.extend({
			tagName: 'tr',
			template: '#tmpl-cart-empty',
		});

		View.CartItems = Marionette.CompositeView.extend({
			template: '#tmpl-cart-items',
			childView: View.CartItem,
			childViewContainer: 'tbody',
			emptyView: NoCartItemsView,

			// onChildviewCartitemDelete: function() {
			// 	console.log('test');
			// }
		});

		View.CartTotals = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-cart-totals').html() ),

			modelEvents: {
				'sync': 'render'
			},

			events: {
				'click .order-discount' 	: 'edit',
				'keypress .order-discount'	: 'saveOnEnter',
				'blur .order-discount'		: 'save',
			},

			edit: function(e) {
				var td = $(e.currentTarget).children('td');
				td.attr('contenteditable','true').text( td.data('value') ).selectText();
			},

			save: function(e) {
				var value = $(e.target).text();

				// if empty, go back to zero
				if( value === '' ) { value = 0; } 

				// validate
				if( isNaN( parseFloat( value ) ) ) {
					$(e.target).selectText(); 
					return;
				}

				// unformat number
				var decimal = accounting.unformat( value, accounting.settings.number.decimal );				

				// save
				this.model.save({ order_discount: decimal });
				// this.model.trigger('change:order_discount');
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
				td.attr('contenteditable','true').text( td.data('value') ).selectText();
			}
		});

		View.CartActions = Marionette.ItemView.extend({
			template: _.template( $('#tmpl-cart-actions').html() ),

			triggers: {
				'click .action-void' 	: 'cart:void:clicked',
				'click .action-note' 	: 'cart:note:clicked',
				'click .action-discount': 'cart:discount:clicked',
				'click .action-checkout': 'cart:checkout:clicked'
			}

		});

		View.Notes = Marionette.ItemView.extend({
			template: _.template( '<%= note %>' ),

			events: {
				'click' 	: 'edit',
				'keypress'	: 'saveOnEnter',
				'blur'		: 'save',
			},

			edit: function(e) {
				this.$el.attr('contenteditable','true').focus();
			},

			save: function(e) {
				var value = $(e.target).text();

				// validate and save
				this.model.save({ note: value });
			},

			saveOnEnter: function(e) {
				// save note on enter
				if (e.which === 13) { 
					this.save(e);
				}
			},

			showNoteField: function() {
				this.$el.show().attr('contenteditable','true').focus();
			}
		});

	});

	return POS.CartApp.List.View;
});