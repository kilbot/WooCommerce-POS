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

					// init the search query collection
					var filterCollection = POS.request('filter:entities');

					// init Views
					var productListLayout 	= new View.Layout();
					var productListFilter 	= new View.Filter();
					var productListTabs 	= new View.FilterTabs({
						collection: filterCollection
					});

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

								var variationsView = new View.Products({
									collection: productVariations,
									slideIn: 'left',
								});
								productListLayout.productsRegion.show( variationsView );

								// add tab to the filter tabs
								var parsedQuery = POS.Entities.SearchParser.parse('parent:' + model.get('id') );
								filterCollection.reset(parsedQuery);

							});

							/**
							 * Remove Filter
							 */
							productListTabs.on('childview:filter:remove', function(childview, model) {
								if( model.get('category') === 'parent' ) {
									var productListView = new View.Products({
										collection: products
									});
									productListLayout.productsRegion.show( productListView );
								}
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