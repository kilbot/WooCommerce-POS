define(['jquery', 'backbone', 'collections/CartItems', 'views/CartItem', 'views/CartTotals'], 
	function($, Backbone, CartItems, CartItemView, CartTotalsView) {

	// view for the full cart
	var CartList = Backbone.View.extend({
		el: $('#cart-items'),
		elEmpty: $('#cart-items').contents().clone(),

		initialize: function() {

			// init the CartItem collection 
			this.collection = CartItems;

			// init the Cart Totals
			var cartTotalsView = new CartTotalsView();

			// listen for changes
			this.listenTo(this.collection, 'add', this.addOne);
			this.listenTo(this.collection, 'reset', this.addAll);
			this.listenTo(this.collection, 'remove', this.render);			
		},

		render: function() {

			// if empty, add empty message
			if( this.collection.length === 0 ) {
				this.emptyMessage();
			}
			
		},

		addOne: function( item ) {

			// if first, remove empty message and init the totals view
			if( this.collection.length === 1 ) {
				this.$el.removeClass('empty').html('');
			}

			// create a new CartItemView
			var newItem = new CartItemView({ model: item });

			// add the new CartItemView
			this.$el.append( newItem.render().el );
		},

		addAll: function() {

			// this will come into play with parked carts
			this.collection.each(this.addOne, this);
    	},

		emptyMessage: function() {
			this.$el.addClass('empty').html(this.elEmpty);
		},

	});

	return CartList;
});