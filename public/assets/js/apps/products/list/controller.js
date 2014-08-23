define(['app', 'apps/products/list/view', 'entities/products'], function(POS, View){

	POS.module('ProductsApp.List', function(List, POS, Backbone, Marionette, $, _){

		List.Controller = POS.Controller.Base.extend({

			initialize: function(options) {
				options || (options = {});

				// user settings
				var settings = POS.Entities.channel.request('user:product:settings');

				if(!Modernizr.indexeddb) settings.set({ sync_mode : 'server' });

				_.defaults(options, {
					settings: settings
				});

				// product collection
				var products = POS.Entities.channel.request('product:entities', options);

				// init layout
				this.layout = new View.Layout();

				this.listenTo( this.layout, 'show', function() {
					this._showProductsRegion( products );
				});

				// show with loader
				this.show( this.layout, { 
					region: POS.leftRegion,
					loading: {
						entities: products.fetch()
					}
				});

			},

			_showProductsRegion: function( products ) {				
				var view = new View.Products({
					collection: products
				});

				this.listenTo( view, 'show', function() {
					this._showFilterView( products );
					this._showPaginationView( products );
				});

				// add to cart
				this.listenTo( view, 'childview:cart:add:clicked', function(childview, args) {
					POS.CartApp.channel.command('cart:add', args.model);
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

			_showFilterView: function( products ) {

				var options = this.options,
					view = new View.Filter(options);

				// add product tabs
				this.listenTo( view, 'show', function() {
					this._showTabsRegion();
				});

				// search queries
				this.listenTo( view, 'products:search:query', function( query ){
					options.settings.set({ query: query });
				});

				// search mode
				this.listenTo( view, 'products:search:mode', function( mode ) {
					options.settings.set({ search_mode: mode });
				});

				// sync
				this.listenTo( view, 'sync:clicked', function( args ) {
					POS.Entities.channel.command('product:sync');
				});

				// show
				this.layout.filterRegion.show( view );
			},

			_showTabsRegion: function() {

				// get new tabs component
				var view = POS.Components.Tabs.channel.request( 'get:tabs', pos_params.tabs );

				// remove On Sale tab for Safari
				if(!Modernizr.indexeddb) {
					var onSaleTab = view.collection.get('on_sale:true');
					view.collection.remove(onSaleTab);
				}

				// listen to tab collection
				this.listenTo( view.collection, 'change:active', function(tab) {
					this.options.settings.set({ tab: tab.get('value') });				
				});

				// listen for new tabs
				this.on( 'add:new:tab', function(tab) {
					view.collection.add( tab ).set({ active: true });
				}); 

				// show tabs component
				this.layout.tabsRegion.show( view );
			},

			_showPaginationView: function( products ) {

				var view = new View.Pagination({
					collection: products
				});

				// sync on page load
				this.listenTo( view, 'show', function() {
					POS.Entities.channel.command('product:sync');
				});

				// sync
				this.listenTo( view, 'pagination:sync:clicked', function(args) {
					POS.Entities.channel.command('product:sync');
				});

				// clear
				this.listenTo( view, 'pagination:clear:clicked', function(args) {
					POS.Entities.channel.command('options:set', 'last_update', '' );
					POS.Entities.channel.command('options:delete', '_syncing' );
					products.fullCollection.reset();
					args.view.render();
				});
				
				// show
				this.layout.paginationRegion.show(view);
			},

			showModal: function( data ) {
				new View.DownloadProgress( data );
			}

		});
		
	});

});