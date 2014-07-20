define(['app', 'apps/products/list/list_view'], function(POS, View){

	POS.module('ProductsApp.List', function(List, POS, Backbone, Marionette, $, _){

		List.Controller = {
			listProducts: function(criterion){
				require(['common/views', 'entities/product', 'entities/search_parser'], function(){

					// loading view
					var loadingView = new POS.Common.Views.Loading();
					POS.leftRegion.show(loadingView);

					// fetch products
					var fetchingProducts = POS.request('product:entities');

					// init Views
					var productListLayout 	= new View.Layout();
					var productListFilter 	= new View.Filter();
					var productListTabs 	= new View.FilterTabs();

					// init the search query collection
					var searchParser 		= new POS.Entities.SearchQuery();

					// when fetch complete, display the products
					require(['entities/common'], function(FilteredCollection){

						$.when(fetchingProducts).done( function(products){

							if(criterion){
								products.parameters.set({ criterion: criterion });
								productListFilter.once('show', function(){
									productListFilter.triggerMethod('set:filter:criterion', criterion);
								});
							}

							products.getPage(1);
							var productListView = new View.Products({
								collection: products
							});
							var productPaginationView = new View.Pagination({ 
								collection: products 
							})

							productListFilter.on('products:filter', function(filterCriterion){
								products.parameters.set({
									page: 1,
									criterion: filterCriterion
								})
								POS.trigger('products:filter', filterCriterion);
							});

							// show the productsRegion
							productListLayout.on('show', function() {
								productListLayout.filterRegion.show( productListFilter );
								productListLayout.tabsRegion.show( productListTabs );
								productListLayout.productsRegion.show( productListView );
								productListLayout.paginationRegion.show( productPaginationView );
							});

							/**
							 * Add to Cart
							 */
							productListView.on('childview:product:add', function(childview, model) {
								POS.trigger('cart:add', model);
							});

							/**
							 * Slide in Variations
							 */
							productListView.on('childview:product:variations', function(childview, model) {
								// reset collection based on parent id
								var productVariations = new POS.Entities.VariationsCollection( model.get('variations'), model );

								var variationsView = new View.Variations({
									collection: productVariations
								});
								productListLayout.productsRegion.show(variationsView);

								// init a new pagination view with the variations
								productPaginationView = new View.Pagination({ 
									collection: productVariations 
								})
								productListLayout.paginationRegion.show( productPaginationView );
							});

							/**
							 * Remove Filter
							 */
							productListTabs.on('childview:filter:remove', function(childview, model) {
								model.destroy();
							});

							// show the leftRegion
							POS.leftRegion.show(productListLayout);
						});	

					});

				});
			}
		};
	});

	return POS.ProductsApp.List.Controller;
});