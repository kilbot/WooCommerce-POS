define(['underscore', 'backbone'], 
	function(_, Backbone) {

	// view for individual products
	var Product = Backbone.View.extend({
		tagName : 'tr',
		template: _.template($('#tmpl-product').html()),

		events: {
			'click a.add-to-cart'	: 'add',
		},

		initialize: function(options) {

			// pubsub
			this.pubSub = options.pubSub;

			// listen for changes to Product model
			this.listenTo( this.model, 'change', this.render );

		},

		render: function() {
			var item = this.model.toJSON();
			this.$el.html( ( this.template( item ) ) );
			return this;
		},

		add: function(e) {
			if( typeof e.target !== 'undefined' ) { e.preventDefault(); }

			// publish to CartList
			this.pubSub.trigger( 'addToCart', this.model );
		},

	});

	return Product;
});