define(['app', 'handlebars', 'accounting', 'popover', 'autoGrowInput'], function(POS, Handlebars, accounting){

	POS.module('CartApp.List.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-cart-layout',

			regions: {
				cartRegion: '#cart',
				cartAccountRegion: '#cart-account',
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

				// listen for changes to CartItem model
				this.listenTo( this.model, 'change', this.render );
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

			// on any change, recalculate the totals
			onRender: function() {
				if( this.collection.length > 0 ) {
					var cartTotals = new View.CartTotals({ el: this.$('tfoot') });
					cartTotals.render();
				} 
			}

			// onChildviewCartitemDelete: function() {
			// 	console.log('test');
			// }
		});

		View.CartTotals = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-cart-totals').html() ),

			events: {
				'click' 	: 'addDiscount',
			},

			addDiscount: function() {
				console.log('discount!');
			}
		});

		View.CartAccount = Marionette.ItemView.extend({
			template: _.template( $('#tmpl-cart-account').html() ),
		});

		View.CartActions = Marionette.ItemView.extend({
			template: _.template( $('#tmpl-cart-actions').html() ),

			events: {
				'click .action-checkout' : 'showCheckout'
			},

			showCheckout: function() {
				// this.trigger('checkout:show');
				POS.execute('checkout:show')
			}

		});

	});

	return POS.CartApp.List.View;
});