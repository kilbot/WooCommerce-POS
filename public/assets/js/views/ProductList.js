define(['jquery', 'underscore', 'backbone', 'collections/Products', 'views/Product', 'views/ProductFilter', 'views/ProductPagination'], 
	function($, _, Backbone, ProductsCollection, ProductView, ProductFilter, ProductPagination) {

	// paginated view for the entire list
	var ProductList = Backbone.View.extend({
		el: $('#product-list'),
		elEmpty: $('#product-list').contents().clone(),

		initialize: function() {
			if(Modernizr.indexeddb) {
				this.collection = new ProductsCollection();
			} else {
				// this.collection = new ProductsFallbackCollection();
			}
			
			// init product filter & pagination
  			var productFilter = new ProductFilter( { collection: this.collection } );
  			var productPagination = new ProductPagination( { collection: this.collection } );

			// listen to the product collection and render on all events
			this.listenTo(this.collection, 'all', this.render);	

			// get products from indexedDB (if any)
			this.collection.fetch();

			// sync products with server on init
			this.collection.serverSync();

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
				var newProduct = new ProductView({ model : item });
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