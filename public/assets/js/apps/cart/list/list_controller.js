define(['app', 'apps/cart/list/list_view', 'common/views', 'common/helpers', 'entities/cart'], function(POS, View){

	POS.module('CartApp.List', function(List, POS, Backbone, Marionette, $, _){

		List.Controller = Marionette.Controller.extend({

			initialize: function(options) {

				// loading view
				var loadingView = new POS.Common.Views.Loading();
				POS.rightRegion.show(loadingView);

				// init layout
				this.layout = new View.Layout();

				// get cart items
				this.items = POS.request('cart:items');

				// show cart
				this.showCart();
			},
			
			showCart: function(){
				
				this.listenTo( this.layout, 'show', function() {
					this.itemsRegion();
					this.customerRegion();
					this.actionsRegion();			
				});

				POS.rightRegion.show(this.layout);

			},

			itemsRegion: function(){

				// get cart view
				var view = new View.CartItems({
					collection: this.items
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

			customerRegion: function(){
				POS.execute('cart:customer', this.layout.cartCustomerRegion);
			},

			actionsRegion: function(){

				// get actions view
				var view = new View.CartActions();

				// void cart
				this.listenTo( view, 'cart:void', function(args) {
					_.invoke( this.items.toArray(), 'destroy' );
				});

				// add note
				this.listenTo( view, 'cart:note', function(args) {
					
				});

				// cart discount
				this.listenTo( view, 'cart:discount', function(args) {
					
				});

				// checkout
				this.listenTo( view, 'checkout:cart', function(args) {
					POS.execute('checkout:show');
				});

				// show
				this.layout.cartActionsRegion.show( view );
			}

		});

	});

	return POS.CartApp.List.Controller;
});