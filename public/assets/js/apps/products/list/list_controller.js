define([
	'app', 
	'apps/products/list/list_view',
	'common/views',
	'entities/products',
], function(
	POS, 
	View
){

	POS.module('ProductsApp.List', function(List, POS, Backbone, Marionette, $, _){

		List.Controller = Marionette.Controller.extend({

			initialize: function(options) {

				// loading view
				var loadingView = new POS.Common.Views.Loading();
				POS.leftRegion.show(loadingView);

				// init layout
				this.layout = new View.Layout();

			},

			show: function() {

				// fetch products
				var fetchingProducts = POS.request('product:entities');

				this.listenTo( this.layout, 'show', function() {
					this._showFilterRegion();		
					this._showTabsRegion();		
					this._showProductsRegion(this.products);		
					this._showPaginationRegion();		
				});

				var self = this;
				$.when(fetchingProducts).done( function(products){
					self.products = products;
					POS.leftRegion.show(self.layout);
				});

			},

			_showFilterRegion: function() {

				var view = new View.Filter();

				// show
				this.layout.filterRegion.show( view );
			},

			_showTabsRegion: function() {

				var tabs = new Backbone.Collection([ 
					{ category: 'label', value: 'All' },  
					{ category: 'cat', value: 'Albums' },  
					{ category: 'id', value: '3|6|9' },  
				]);

				var view = new View.Tabs({
					collection: tabs
				});

				// show
				this.layout.tabsRegion.show( view );
			},

			_showProductsRegion: function(products) {

				products.getPage(1);
				var view = new View.Products({
					collection: products
				});

				this.listenTo( view, 'childview:cart:add:clicked', function(childview, args) {
					POS.trigger('cart:add', args.model);
				});

				// show
				this.layout.productsRegion.show( view );

			},

			_showPaginationRegion: function() {

			},

		});
		
	});

	return POS.ProductsApp.List.Controller;
});