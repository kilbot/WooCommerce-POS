define(['app', 'apps/products/list/list_view'], function(POS, View){

	POS.module('ProductsApp.List', function(List, POS, Backbone, Marionette, $, _){

		List.Controller = {
			listProducts: function(criterion){
				require(['common/views', 'entities/product'], function(){

					// loading view
					var loadingView = new POS.Common.Views.Loading();
					POS.leftRegion.show(loadingView);

					// fetch products
					var fetchingProducts = POS.request('product:entities');

					// init Views
					var productListLayout = new View.Layout();
					var productListFilter = new View.Filter();

					// when fetch complete, display the products
					require(['entities/common'], function(FilteredCollection){

						$.when(fetchingProducts).done( function(products){

							var filteredProducts = POS.Entities.FilteredCollection({
								collection: products,
								filterFunction: function(filterCriterion) {
									var criterion = filterCriterion.toLowerCase();
									return function(product){
										if(product.get('title').toLowerCase().indexOf(criterion) !== -1) {
											return product;
										}
									}
								}
							});

							if(criterion){
								filteredProducts.filter(criterion);
								productListFilter.once('show', function(){
									productListFilter.triggerMethod('set:filter:criterion', criterion);
								});
							}

							var productListView = new View.Products({
								collection: filteredProducts
							});

							productListFilter.on('products:filter', function(filterCriterion){
								filteredProducts.filter(filterCriterion);
								POS.trigger('products:filter', filterCriterion);
							});

							// show the productsRegion
							productListLayout.on('show', function() {
								productListLayout.filterRegion.show(productListFilter);
								productListLayout.productsRegion.show(productListView);
								productListLayout.paginationRegion.show(
									new View.Pagination({ collection: filteredProducts })
								);
							});

							/**
							 * Add to Cart
							 */
							productListView.on('childview:product:add', function(childview, model) {
								POS.trigger('cart:add', model);
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