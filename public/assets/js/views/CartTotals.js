define(['jquery', 'underscore', 'backbone', 'views/Checkout'], 
	function($, _, Backbone, Checkout) {

	// the view containing all the totals, and the action buttons
	var CartTotalsView = Backbone.View.extend({
		el: $('#cart-totals'),
		template: _.template($('#tmpl-cart-total').html()),
		events: {
			"click #pos_checkout"	: "checkout",
		},

		initialize: function(options) {

			// use the cart already initialized
			this.cart = options.cart;

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

		checkout: function(e) {

			this.$(e.target).attr('disabled','disabled');
			$('#cart .actions').addClass('working');

			// pick the data from the cart items we are going to send
			var items = this.cart.map( function( model ) {
	    		return _.pick( model.toJSON(), ['id', 'qty', 'line_total'] );  
			});

			var checkout = new Checkout({ cart: this.cart, totals: this.model });
			checkout.process(items);

		},

	});

	return CartTotalsView;
});