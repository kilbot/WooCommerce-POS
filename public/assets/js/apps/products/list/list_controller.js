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
					require(['entities/common', 'entities/search_parser'], function(FilteredCollection, SearchParser){

						// init the search query collection
						var searchParser = new POS.Entities.SearchQuery();

						$.when(fetchingProducts).done( function(products){

							var filteredProducts = POS.Entities.FilteredCollection({
								collection: products,

								filterFunction: function(filterCriterion) {
									var criterion = filterCriterion.toLowerCase();

									// parse filterCriterion
									var parsedQuery = POS.Entities.SearchParser.parse(filterCriterion);
									searchParser.reset(parsedQuery);
									
									return function(product){

										var categories = _.map( product.get('categories'), function(cat) { return cat.toLowerCase(); });

										if(
											// filter titles
											product.get('title').toLowerCase().indexOf(searchParser.find('freetext')) !== -1 ||

											// filter by id:
											product.get('id') === parseInt( searchParser.find('id') ) ||

											// filter by cat:
											_.contains( categories, searchParser.find('cat') )

										) {
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
									// new View.Pagination({ collection: filteredProducts })
								);
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
								// create new collection based on parent id
								console.log(model.attributes.variations);
								var productVariations = new View.Variations({
									collection: products 
								});
								productListLayout.productsRegion.show(productVariations);
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