define(['app', 'apps/cart/list/view', 'entities/cart'], function(POS, View){

	POS.module('CartApp.List', function(List, POS, Backbone, Marionette, $, _){

		List.Controller = POS.Controller.Base.extend({

			initialize: function(options) {

				// get cart items & totals
				this.items = POS.Entities.channel.request('cart:items', options.cartId);
				this.totals = POS.Entities.channel.request('cart:totals', options.cartId);

				// listen for Add to Cart commands
				POS.CartApp.channel.comply('cart:add', this.addToCart, this);

				// listen for update to totals
				this.totals.listenTo( this.items, 'update:totals', function(subtotals) {
					this.set(subtotals);
				});

				// init layout
				this.layout = new View.Layout();
				this.layout.cartTotalsRegion = ''; // cartTotalsRegion is a faux region

				this.listenTo( this.layout, 'show', function() {
					this._showItemsRegion();
				});

				// loader
				this.show( this.layout, { 
					region: POS.rightRegion,
					loading: {
						entities: [ this.items.fetch({ silent: true }), this.totals.fetch({ silent: true }) ]
					}
				});

			},

			onDestroy: function(){
				POS.CartApp.channel.stopComplying('cart:add');
			},

			addToCart: function(model) {
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
				});

				// remove cart item
				this.listenTo( view, 'childview:cartitem:delete', function(childview, model) {
					model.destroy();
				});

				// show
				this.layout.cartRegion.show( view );
			},

			_showTotalsRegion: function() {

				var view = new View.CartTotals({ 
					model: this.totals,
					el: this.layout.cartTotalsRegion
				});

				// show/hide
				this._showOrHideCart();
				this.items.on( 'add remove', this._showOrHideCart, this );

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
				var view = POS.CustomerApp.channel.request('customer:select', { model: this.totals });
				var self = this;

				this.listenTo( view, 'customer:select', function( id, name ) {
					self.totals.save({
						customer_id: id,
						customer_name: name
					});
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
					// POS.CheckoutApp.channel.command('checkout:payment', this.cartId);
					POS.CheckoutApp.channel.command('checkout:payment');
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

			_showOrHideCart: function() {
				if( this.items.length > 0 ) {
					this.layout.cartTotalsRegion.show();
					this._showCustomerRegion();
					this._showActionsRegion();
					this._showNotesRegion();
				}

				else {
					this.layout.cartTotalsRegion.hide();
					this.layout.cartCustomerRegion.empty();
					this.layout.cartActionsRegion.empty();
					this.layout.cartNotesRegion.empty();

					// reset totals to defaults
					this.totals.set( this.totals.defaults );
				}
			}

		});

	});

});