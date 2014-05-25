define(['backbone', 'collections/CartTotals', 'views/CartTotal', 'views/Checkout'], 
	function(Backbone, CartTotals, CartTotalView, Checkout) {

	// the view containing all the totals, and the action buttons
	var CartTotalsView = Backbone.View.extend({
		el: $('#cart-totals'),
		events: {
			"click #pos_checkout"	: "checkout",
		},

		initialize: function() {

			// init the CartTotals collection 
			this.collection = new CartTotals();

			this.listenTo( this.collection, 'reset', this.render );
		},

		render: function() {

			this.$el.removeClass('empty').html('');

			// Loop through the collection
			this.collection.each(function( item ){

				// Render each item model into this List view
				var newTotal = new CartTotalView({ model : item });
				this.$el.append( newTotal.render().el );

			// Pass this list views context
			}, this);

			// add the action buttons
			if (this.collection.length > 0) {
				this.$el.append( _.template($('#tmpl-cart-action').html()) );
			}
		},

		checkout: function() {
			// send the cart data to checkout
			var checkout = new Checkout();
			checkout.process(this.collection);
		},

	});

  return CartTotalsView;
});