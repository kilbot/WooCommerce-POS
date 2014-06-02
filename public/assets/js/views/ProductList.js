define(['jquery', 'backbone', 'collections/Products', 'views/Product', 'views/ProductFilter', 'views/ProductPagination', 'collections/ProductsFallback', 'views/CartList'], 
	function($, Backbone, ProductsCollection, Product, ProductFilter, ProductPagination, ProductsFallbackCollection, CartList) {

	// paginated view for the entire list
	var ProductList = Backbone.View.extend({
		el: $('#product-list'),
		elEmpty: $('#product-list').contents().clone(),
		cart: new CartList(), // there can be only one cart

		initialize: function() {

			if(Modernizr.indexeddb) {
				this.collection = new ProductsCollection();
				// sync products with server on init
				// this.collection.serverSync();
			} else {
				this.collection = new ProductsFallbackCollection();
			}
	
			// init product filter & pagination
  			new ProductFilter( { collection: this.collection } );
  			new ProductPagination( { collection: this.collection } );

			// listen to the product collection and render on all events
			this.listenTo(this.collection, 'all', this.render);	

			// get products from indexedDB or fallback 
			this.collection.fetch();

		},

		render: function() {
			// console.log('render the products'); // debug

			// if empty, add empty message
			if( this.collection.length === 0 ) {
				this.emptyMessage();

			// Else, clear the view ready for new products
			} else {
				this.$el.removeClass('empty').html('');
			}

			// Loop through the collection
			this.collection.each(function( item ){

				// Render each item model into this List view
				var newProduct = new Product({ model : item, cart: this.cart });
				this.$el.append( newProduct.render().el );

			// Pass this list views context
			}, this);

		},

		emptyMessage: function() {
			this.$el.addClass('empty').html(this.elEmpty);
		},

	});

	return ProductList;
});