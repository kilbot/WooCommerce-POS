define(['backbone', 'collections/CartItems', 'views/CartItem'], 
	function(Backbone, CartItems, CartItemView) {

	// view for the full cart
	var CartList = Backbone.View.extend({
		el: $('#cart-items'),
		elEmpty: $('#cart-items').contents().clone(),

		initialize: function( options ) {

			// init the CartItem collection 
			this.collection = new CartItems( [], { cartId: 1 } );

			// listen for changes
			this.listenTo(this.collection, 'add', this.addOne);
			this.listenTo(this.collection, 'reset', this.addAll);	
			this.listenTo(this.collection, 'reset remove', this.render);

			// init cart with localStorage
			this.collection.fetch( {reset: true} );

			// listen for addToCart events
			this.listenTo( options.pubSub, "addToCart", this.addToCart, this );
		
		},

		render: function() {

			// if empty, add empty message
			if( this.collection.length === 0 ) {
				this.emptyMessage();
			} 
			
		},

		addToCart: function( model ) {

			// if product already exists in cart, increase qty
			if( _( this.collection.pluck('id') ).contains( model.attributes.id ) ) {
				this.collection.get( model.attributes.id ).quantity('increase');
			}

			// else, add the product
			else { 
				this.collection.create(model.attributes);
			}
		},

		addOne: function( item ) {

			// if first, remove empty message and init the totals view
			if( this.collection.length === 1 ) {
				this.$el.removeClass('empty').html('');
			}

			// create a new CartItemView
			var newItem = new CartItemView({ model: item, cart: this.collection });

			// add the new CartItemView
			this.$el.append( newItem.render().el );

			// bit of a hack, need to trigger autoGrowInput after the first render
			this.$('input').trigger('change');
		},

		addAll: function() {

			// empty 
			this.$el.removeClass('empty').html('');

			// then fill
			this.collection.each(this.addOne, this);

    	},

		emptyMessage: function() {
			this.$el.addClass('empty').html(this.elEmpty);
		},

	});

	return CartList;
});