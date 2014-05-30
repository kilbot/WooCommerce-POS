define(['jquery', 'underscore', 'backbone'], 
	function($, _, Backbone) {

	// view for individual products
	var Product = Backbone.View.extend({
		tagName : 'tr',
		template: _.template($('#tmpl-product').html()),

		events: {
			'click a.add-to-cart'	: 'addToCart',
		},

		initialize: function(options) {

			// use the cart already initialized
			this.cart = options.cart;

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

			// if product already exists in cart, increase qty
			if( _( this.cart.collection.pluck('id') ).contains( this.model.attributes.id ) ) {
				this.cart.collection.get( this.model.attributes.id ).quantity('increase');
			}

			// else, add the product
			else { 
				this.cart.collection.create(this.model.attributes);
			}
		},

	});

	return Product;
});