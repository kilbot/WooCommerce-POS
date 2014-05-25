define(['backbone', 'collections/CartItems'], function(Backbone, CartItems) {

	// view for individual products
	var Product = Backbone.View.extend({
		tagName : 'tr',
		template: _.template($('#tmpl-product').html()),

		events: {
			'click a.add-to-cart'	: 'addToCart',
		},

		initialize: function() {

			// listen for changes to Product model
			this.listenTo( this.model, 'change', this.render );
		},

		render: function() {
			var item = this.model.toJSON();
			this.$el.html( ( this.template( item ) ) );
			return this;
		},

		addToCart: function(e) {
			e.preventDefault();

			// send to the cart
			CartItems.addToCart(this.model);
		},

	});

	return Product;
});