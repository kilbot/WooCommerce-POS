define([
	'app',
	'apps/cart/list/view', 
	'entities/cart',
	'common/views'
], function(
	POS, 
	View
){

	POS.module('CartApp.List', function(List, POS, Backbone, Marionette, $, _){

		List.Controller = Marionette.Controller.extend({

			initialize: function(options) {

				// set cartId
				var id = options.cartId;
				if(0 === id % (!isNaN(parseFloat(id)) && 0 <= ~~id)) {
					this.cartId = id;
				} else {
					this.cartId = 1;
				}

				// loading view
				var loadingView = new POS.Common.Views.Loading();
				// POS.execute('show:loading', view, options); 
				POS.rightRegion.show(loadingView);

				// init layout
				this.layout = new View.Layout();
				this.layout.cartTotalsRegion = ''; // cartTotalsRegion is a fake region

				// get cart items & totals
				this.items = POS.Entities.channel.request('cart:items', { cartId: this.cartId });
				this.totals = POS.Entities.channel.request('cart:totals', { id: this.cartId, cart: this.items });

				this.listenTo( this.items, 'add remove', this._showOrHideCart );

			},
			
			show: function(){
				
				this.listenTo( this.layout, 'show', function() {
					this._showItemsRegion();
				});

				POS.rightRegion.show(this.layout);

			},

			_showItemsRegion: function(){

				// get cart view
				var view = new View.CartItems({
					collection: this.items
				});

				// on show, add totals child view
				this.listenTo( view, 'render', function(itemsView) {
					this.layout.cartTotalsRegion = itemsView.$('tfoot');
					this._showTotalsRegion();
					this._initCart();
				});

				// Add To Cart commands
				POS.CartApp.channel.comply('cart:add', function(model){
					
					// if product already exists in cart, increase qty
					if( _( this.items.pluck('id') ).contains( model.attributes.id ) ) {
						this.items.get( model.attributes.id ).quantity('increase');
					}
					// else, add the product
					else { 
						this.items.create(model.attributes);
					}

					// pulse item
					this.items.get( model.attributes.id ).trigger( 'pulse:item' );
				}, this);

				// remove cart item
				this.listenTo( view, 'childview:cartitem:delete', function(childview, model) {
					model.destroy();
				});

				// show
				this.layout.cartRegion.show( view );
			},

			_initCart: function() {
				if( this.items.length > 0 ) {
					this._showCustomerRegion();
					this._showActionsRegion();
					this._showNotesRegion();
				}
				else {
					this.layout.cartTotalsRegion.hide();
				}
			},

			_showOrHideCart: function() {

				if( this.items.length === 1 ) {
					this.layout.cartTotalsRegion.show();
					this._initCart();
				}
				else if( this.items.length === 0 ) {
					this.layout.cartTotalsRegion.hide();
					this._emptyCart();
				}
			
			},

			_showTotalsRegion: function(totalsRegion) {

				var view = new View.CartTotals({ 
					model: this.totals,
					el: this.layout.cartTotalsRegion
				});

				// clean up if itemsView is removed
				this.on( 'before:destroy', function(){
					view.destroy();
				});

				// toggle discount box
				this.on( 'cart:discount:clicked', function() {
					view.showDiscountRow();
				});

				view.render();
			},

			_showCustomerRegion: function(){
				var view = POS.CustomerApp.channel.request('customer:select');

				this.listenTo( view, 'customer:select', function() {
					// console.log();
				});

				this.layout.cartCustomerRegion.show( view );
			},

			_showActionsRegion: function(){

				// get actions view
				var view = new View.CartActions();

				// void cart
				this.listenTo( view, 'cart:void:clicked', function() {
					_.invoke( this.items.toArray(), 'destroy' );
				});

				// add note
				this.listenTo( view, 'cart:note:clicked', function() {
					this.trigger('cart:note:clicked');
				});

				// cart discount
				this.listenTo( view, 'cart:discount:clicked', function() {
					this.trigger('cart:discount:clicked');
				});

				// checkout
				this.listenTo( view, 'cart:checkout:clicked', function() {
					POS.trigger('checkout:show', this.cartId);
				});

				// show
				this.layout.cartActionsRegion.show( view );
			},

			_showNotesRegion: function() {

				var view = new View.Notes({
					model: this.totals
				});

				// toggle discount box
				this.on( 'cart:note:clicked', function() {
					view.showNoteField();
				});

				// show
				this.layout.cartNotesRegion.show( view );
			},

			_emptyCart: function() {
				// return cart to inital state
				this.layout.cartCustomerRegion.empty();
				this.layout.cartActionsRegion.empty();
				this.layout.cartNotesRegion.empty();
			}

		});

	});

	return POS.CartApp.List.Controller;
});