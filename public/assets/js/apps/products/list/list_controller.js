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

				// variations
				this.listenTo( view, 'childview:product:variations:clicked', function(childview, args) {
					var newTab = this.tabEntities.add({
						label: args.model.get('title'),
						value: 'parent:' + args.model.get('id'),
						fixed: false
					});
					newTab.set({ active: true }); // trigger active 
				});

				// show
				this.layout.productsRegion.show( view );

			},

			_showFilterView: function() {

				var view = new View.Filter();

				// filter collection = clone of products collection
				this.filterCollection = POS.request('product:filtercollection', this.products);

				// add product tabs
				this.listenTo( view, 'show', function() {
					this._showTabsRegion();
				});
				
				// search queries
				this.listenTo( view, 'products:search:query', function( query ){
					this.filterCollection.searchQuery = query;
					this.filterCollection.trigger('filter:products');
				});

				// show
				this.layout.filterRegion.show( view );
			},

			_showTabsRegion: function() {

				this.tabEntities = POS.request('tab:entities');

				// listen to changes to active tab
				this.listenTo( this.tabEntities, 'change:active', function( tab ) {
					this.filterCollection.activeTab = tab.get('value');
					this.filterCollection.trigger('filter:products');
				});

				// show tabs component
				POS.execute('show:tabs', this.layout.tabsRegion, this.tabEntities);
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
					POS.execute('options:set', 'last_update', '' );
					args.view.render();
				});
				
				// show
				this.layout.paginationRegion.show(view);
			},

			showModal: function( template, data ) {

				if(POS.debug) console.log('[notice] Fetching modal template: ' + template);
				$.get( pos_params.ajax_url , { action: 'pos_get_modal', template: template, data: data, security: pos_params.nonce } )
				.done(function( data ) {
					new View.DownloadProgress({ data: data });
				})
				.fail(function() {
					if(POS.debug) console.log('[error] Problem fetching modal template');
				});

			}

		});

		return List.Controller;
		
	});

	// return POS.ProductsApp.List.Controller;
});