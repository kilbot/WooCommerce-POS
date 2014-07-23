define(['app', 'apps/cart/list/list_view', 'common/views', 'common/helpers', 'entities/cart'], function(POS, View){

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
				POS.rightRegion.show(loadingView);

				// init layout
				this.layout = new View.Layout();

				// get cart items & totals
				this.items = POS.request('cart:items', { cartId: this.cartId });
				this.totals = POS.request('cart:totals', { id: this.cartId, cart: this.items });

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

				// on show, display totals
				this.listenTo( view, 'render', function(itemsRegion) {
					this.totalsRegion = itemsRegion.$('tfoot');
					this._initCart();
				});

				// add cart item
				POS.commands.setHandler('cart:add', function(model) {
					// if product already exists in cart, increase qty
					if( _( this.items.pluck('id') ).contains( model.attributes.id ) ) {
						this.items.get( model.attributes.id ).quantity('increase');
					}
					// else, add the product
					else { 
						this.items.create(model.attributes);
					}
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
					this._showTotalsRegion();
					this._showCustomerRegion();
					this._showActionsRegion();
					this._showNotesRegion();
				}
			},

			_showOrHideCart: function() {

				if( this.items.length === 1 ) {
					this._initCart();
				}
				else if( this.items.length === 0 ) {
					this._emptyCart();
				}
			
			},

			_showTotalsRegion: function() {
				
				var view = new View.CartTotals({ 
					model: this.totals,
					el: this.totalsRegion
				});

				// toggle discount box
				this.on( 'cart:discount:clicked', function() {
					view.showDiscountRow();
				});

				view.render();
			},

			_showCustomerRegion: function(){
				POS.execute('cart:customer', this.layout.cartCustomerRegion);
			},

			_showActionsRegion: function(){

				// get actions view
				var view = new View.CartActions();

				// void cart
				this.listenTo( view, 'cart:void:clicked', function(args) {
					_.invoke( this.items.toArray(), 'destroy' );
				});

				// add note
				this.listenTo( view, 'cart:note:clicked', function(args) {
					this.trigger('cart:note:clicked');
				});

				// cart discount
				this.listenTo( view, 'cart:discount:clicked', function(args) {
					this.trigger('cart:discount:clicked');
				});

				// checkout
				this.listenTo( view, 'cart:checkout:clicked', function(args) {
					POS.execute('checkout:show', this.cartId);
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
				this.layout = new View.Layout();
				this.show();
			}

		});

	});

	return POS.CartApp.List.Controller;
});