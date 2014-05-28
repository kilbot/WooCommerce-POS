define(['underscore', 'backbone', 'models/CartItem', 'settings'], 
	function(_, Backbone, CartItem, Settings){

	// the collection of cart items
	var CartItems = Backbone.Collection.extend({
		url: pos_params.ajax_url,
		model: CartItem,

  		// debug
		initialize: function() { 
			// this.on('all', function(e) { console.log("Cart Collection event: " + e); }); // debug
		},

		// add a product model to the cart
		addToCart: function(product) {
			
			// if product already exists in cart, increase qty
			// I don't know if this is the best way, but it's a way ...
			if(_.contains( this.pluck('id'), product.attributes.id )) {
				var item = this.get( product.attributes.id );
				item.quantity('increase');
			}

			// else, add the product
			else { 
				this.add( product.attributes );
			}

		}

	});
  
	// 
	return new CartItems();
});