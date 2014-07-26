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
					this._showTabsRegion();		
					this._showProductsRegion(this.products);		
				});

				var self = this;
				$.when(fetchingProducts).done( function(products){
					self.products = products;
					POS.leftRegion.show(self.layout);
				});

			},

			_showFilterView: function(products) {

				var view = new View.Filter({ collection: products });

				this.listenTo( view, 'products:filter:query', function(filterCriterion){
					var filter = POS.request('filter:facets', filterCriterion);
					products.filterEntities.reset(filter);
				});

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

				this.listenTo( view, 'childview:tab:clicked', function(childview, args) {
					console.log('tab click');
				});

				this.listenTo( view, 'childview:tab:remove:clicked', function(childview, args) {
					console.log('tab remove click');
				});

				// show
				this.layout.tabsRegion.show( view );
			},

			_showProductsRegion: function(products) {

				var view = new View.Products({
					collection: products
				});

				this.listenTo( view, 'show', function() {
					this._showFilterView(products);
					this._showPaginationView(products);
				});

				this.listenTo( view, 'childview:cart:add:clicked', function(childview, args) {
					POS.trigger('cart:add', args.model);
				});

				this.listenTo( view, 'childview:product:variations:clicked', function(childview, args) {
					this._showVariationsView( args.model );
				});

				// show
				this.layout.productsRegion.show( view );

			},

			_showVariationsView: function(model) {

				var productVariations = POS.request('product:variations', model);

				var view = new View.Products({
					collection: productVariations,
					slideIn: 'left',
				});

				this.listenTo( view, 'show', function() {
					this._showFilterView(productVariations);
					this._showPaginationView(productVariations);
				});

				this.listenTo( view, 'childview:cart:add:clicked', function(childview, args) {
					POS.trigger('cart:add', args.model);
				});

				// show
				this.layout.productsRegion.show( view );
			},

			_showPaginationView: function(products) {

				var view = new View.Pagination({
					collection: products
				});

				this.listenTo( view, 'pagination:sync:clicked', function(args) {
					// POS.execute('options:set', 'last_update', Date.now() );
					POS.execute('product:sync');
					args.view.render();
				});

				this.listenTo( view, 'pagination:clear:clicked', function(args) {
					POS.execute('options:set', 'last_update', '' );
					args.view.render();
				});
				
				// show
				this.layout.paginationRegion.show(view);
			},

		});
		
	});

	return POS.ProductsApp.List.Controller;
});