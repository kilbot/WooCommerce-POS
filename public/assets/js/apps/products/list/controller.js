define([
	'app', 
	'apps/products/list/view',
	'common/views'
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
				var fetchingProducts = POS.Entities.channel.request('product:entities');

				this.listenTo( this.layout, 'show', function() {	
					this._showProductsRegion();		
				});

				var self = this;
				$.when(fetchingProducts).done( function(products){
					self.products = products;
					POS.leftRegion.show(self.layout);
				});

			},

			_showProductsRegion: function() {

				var view = new View.Products({
					collection: this.products
				});

				this.listenTo( view, 'show', function() {
					this._showFilterView();
					this._showPaginationView();
				});

				// add to cart
				this.listenTo( view, 'childview:cart:add:clicked', function(childview, args) {
					POS.trigger('cart:add', args.model);
				});

				// variations, new tab filter
				this.listenTo( view, 'childview:product:variations:clicked', function(childview, args) {
					var newTab = {
						label: args.model.get('title'),
						value: 'parent:' + args.model.get('id'),
						fixed: false					
					};
					this.trigger( 'add:new:tab', newTab );
				});

				// show
				this.layout.productsRegion.show( view );

			},

			_showFilterView: function() {

				var display_settings = POS.Entities.channel.request('user:display:settings');

				var view = new View.Filter({ model: display_settings });

				// filter collection = clone of products collection
				this.filterCollection = POS.Entities.channel.request('product:filtercollection', this.products);

				// add product tabs
				this.listenTo( view, 'show', function() {
					this._showTabsRegion();
				});
				
				// search queries
				this.listenTo( view, 'products:search:query', function( query ){
					this.filterCollection.searchQuery = query;
					this.filterCollection.trigger('filter:products', display_settings.get('search_mode') );
				});

				// sync
				this.listenTo( view, 'sync:clicked', function( args ) {
					this.products.serverSync();
				});

				// search mode
				this.listenTo( view, 'products:search:mode', function( mode ) {
					view.model.save({ search_mode: mode });
				});

				// show
				this.layout.filterRegion.show( view );
			},

			_showTabsRegion: function() {

				// get new tabs component
				var view = POS.Components.channel.request( 'get:tabs', pos_params.tabs );

				// listen to tab collection
				this.listenTo( view.collection, 'change:active', function(tab) {
					this.filterCollection.activeTab = tab.get('value');
					this.filterCollection.trigger('filter:products');
				});

				// listen for new tabs
				this.on( 'add:new:tab', function(tab) {
					view.collection.add( tab ).set({ active: true });
				}); 

				// show tabs component
				this.layout.tabsRegion.show( view );
			},

			_showPaginationView: function() {

				var view = new View.Pagination({
					collection: this.products
				});

				// sync
				this.listenTo( view, 'pagination:sync:clicked', function(args) {
					this.products.serverSync();
				});

				// clear
				this.listenTo( view, 'pagination:clear:clicked', function(args) {
					POS.Entities.channel.command('options:set', 'last_update', '' );
					args.view.render();
				});
				
				// show
				this.layout.paginationRegion.show(view);
			},

			showModal: function( data ) {
				new View.DownloadProgress( data );
			}

		});

		return List.Controller;
		
	});

});