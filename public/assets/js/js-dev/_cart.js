/**
 * Use backbone.js and backgrid.js to display the cart
 */

(function ( $ ) {
	"use strict";

	// pos_cart_params is required to continue, ensure the object exists
	if ( typeof pos_cart_params === 'undefined' ) {
		console.log('No pos_cart_params');
		return false;
	}

	/**
	 * Cart
	 * A hash and the full cart html 
	 */
	var Cart = Backbone.Model.extend({
		defaults: {
			cart_hash: "default-cart-hash",
			fragments: "There seems to be a problem getting the cart :("
		}
	});

	var cart = new Cart();
	
	/**
	 * CartPark: Backbone Collection
	 * A collection of parked carts
	 */
	var CartPark = Backbone.Collection.extend({
		model: Cart,
		url: pos_cart_params.ajax_url,

		parse : function(response){
			console.log("updating cart");
			console.log(response);
			cart.set( response );
			return response;  
		},
	});

	var cartPark = new CartPark();

	/**
	 * CartView
	 * displaying the cart fragments inside div#cart
	 */
	var CartView = Backbone.View.extend({
		el: $("#cart"),

		initialize : function(){
			console.log("initializing cart");

			// listen to reset and add events
			cartPark.on('add', this.render, this);
			cartPark.on('reset', this.render, this);
			mediator.subscribe("updateCart", function(){ 
				cartPark.fetch({
					data: { action: "get_cart_fragment" }, processData: true,
					reset: true
				});
			});
		},

		render: function() {
			console.log( "rendering cart" );

			// we're going to render the whole cart
			// eventually we'll need to split this into fragments and templates
			this.$el.html( cart.get( "fragments" ) );
		},

		events: {"click a.remove-from-cart": "removeFromCart"},

		removeFromCart: function(e) {
			e.preventDefault();
console.log($(e.currentTarget).attr( "href" ));
			var data = {
				action	: "pos_remove_item",
				href	: $(e.currentTarget).attr( 'href' ),
			};

			// Ajax action
			$.post( pos_cart_params.ajax_url, data, function( response ) {

				if ( ! response ) {
					console.log('No response from server');
					return;
				}

				if ( response.error ) {
					console.log(response.error);
					return;
				}

				// set the cart collection
				console.log(cart.get( "cart_hash" ));
				cart.set( response );
				cartPark.reset();
				console.log(cart.get( "cart_hash" ));
			});
		},

	});

	var cartView = new CartView();

	cartPark.fetch({
		data: { action: "get_cart_fragment" }, processData: true,
		reset: true
	});

}(jQuery));