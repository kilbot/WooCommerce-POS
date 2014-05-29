define(['jquery', 'underscore', 'backbone', 'views/Checkout'], 
	function($, _, Backbone, Checkout) {

	// the view containing all the totals, and the action buttons
	var CartTotalsView = Backbone.View.extend({
		el: $('#cart-totals'),
		template: _.template($('#tmpl-cart-total').html()),
		events: {
			"click #pos_checkout"	: "checkout",
		},

		initialize: function() {

			// re-render on all changes to the totals model
			this.listenTo( this.model, 'change', this.render );
		},

		render: function() {

			// clear #cart-totals to start
			this.$el.removeClass('empty').html('');

			// grab the model
			var totals = this.model.toJSON();

			// render the totals
			this.$el.html( ( this.template( totals ) ) );

			return this;
		},

		checkout: function() {
			// send the cart data to checkout
			var checkout = new Checkout();
			checkout.process(this.collection);
		},

	});

	return CartTotalsView;
});