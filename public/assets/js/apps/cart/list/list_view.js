define(['app', 'handlebars', 'popover'], function(POS, Handlebars){

	POS.module('CartApp.List.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-cart-layout',

			regions: {
				cartRegion: '#cart',
				cartActionsRegion: '#cart-actions',
				cartNotesRegion: '#cart-notes'
			}
		});
		
		View.CartItem = Marionette.ItemView.extend({
			tagName: 'tr',
			template: Handlebars.compile( $('#tmpl-cart-item').html() ),

			events: {
				'click .action-remove' 	: 'removeFromCart',
				'show.bs.popover' 		: 'showNumpad'
			},

			// TODO: abstract this
			onShow: function() {
				this.$('input.numpad').popover({
					placement: 'bottom',
					html: true,
					content: $('#numpad')
				});
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
			}
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