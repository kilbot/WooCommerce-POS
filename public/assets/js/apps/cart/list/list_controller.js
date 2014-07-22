define(['app', 'apps/cart/list/list_view', 'common/views', 'common/helpers', 'entities/cart'], function(POS, View){

	POS.module('CartApp.List', function(List, POS, Backbone, Marionette, $, _){

		List.Controller = Marionette.Controller.extend({

			initialize: function(options) {

				// loading view
				var loadingView = new POS.Common.Views.Loading();
				POS.rightRegion.show(loadingView);

				// init layout
				this.layout = new View.Layout();

				// get cart items & totals
				this.items = POS.request('cart:items');
				this.totals = POS.request('cart:totals', this.items);

			},
			
			show: function(){
				
				this.listenTo( this.layout, 'show', function() {
					this._showItemsRegion();
					this._showCustomerRegion();
					this._showActionsRegion();
					this._showNotesRegion();		
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
					this._showTotalsRegion(itemsRegion);
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

			_showTotalsRegion: function(itemsRegion) {
				
				var view = new View.CartTotals({ 
					model: this.totals,
					el: itemsRegion.$('tfoot') 
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
					POS.execute('checkout:show');
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

		});

	});

	return POS.CartApp.List.Controller;
});