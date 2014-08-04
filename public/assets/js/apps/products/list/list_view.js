define([
	'app', 
	'handlebars'
], function(
	POS, 
	Handlebars
){

	POS.module('ProductsApp.List.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-products-layout',

			regions: {
				filterRegion: '#products-filter',
				tabsRegion: '#products-tabs',
				productsRegion: '#products',
				paginationRegion: '#products-pagination'
			},

		});

		/**
		 * Filter
		 */
		View.Filter = Marionette.ItemView.extend({
			template: '#tmpl-products-filter',
			mode: 'client',

			events: {
				'keyup input[type=search]': 'searchTrigger',
				'click a.clear'	: 'clear',
			},

			ui: {
				searchField : 'input[type=search]',
				clearBtn 	: 'a.clear'
			},

			// if idb make the query instantly
			// else 
			searchTrigger: function(e){
				this.showClearButtonMaybe();
				if(this.mode === 'server' && e.keyCode !== 13) { return; }
				this.search();
			},

			// actually make the query
			search: _.debounce( function() {
				this.trigger('products:search:query', this.ui.searchField.val());
			}, 149),

			// clear the filter
			clear: function(e) {
				this.ui.searchField.val('');
				this.trigger('products:search:query', '');
				this.showClearButtonMaybe();
			},

			showClearButtonMaybe: function() {
				_.isEmpty( this.ui.searchField.val() ) ? this.ui.clearBtn.hide() : this.ui.clearBtn.show() ;
			},
		});

		/**
		 * Single Product
		 */
		View.Product = Marionette.ItemView.extend({
			tagName: 'li',
			template: Handlebars.compile( $('#tmpl-product').html() ),
			className: function(){ if( this.isVariable() ) return 'variable' },

			triggers: {
				'click .action-add' 		: 'cart:add:clicked',
				'click .action-variations' 	: 'product:variations:clicked'
			},

			onBeforeRender: function(){
				if( this.isVariable() ) { this.model.set('isVariable', true); }
			},

			isVariable: function() {
				if( this.model.get('type') === 'variable' ) { return true; }
			},

		});

		/**
		 * Product Collection
		 */
		var NoProductsView = Marionette.ItemView.extend({
			tagName: 'li',
			template: '#tmpl-products-empty',
		});

		View.Products = Marionette.CollectionView.extend({
			tagName: 'ul',
			className: 'list',
			childView: View.Product,
			emptyView: NoProductsView,

			initialize: function(options) {
				// this.on('all', function(e) { console.log("Product Collection View event: " + e); }); // debug
				
			},

		});

		/**
		 * Pagination
		 * TODO: store pagination and last update time in a viewModel?
		 */
		View.Pagination = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-pagination').html() ),

			initialize: function() {
				// this.on('all', function(e) { console.log("Pagination View event: " + e); }); // debug
				
			},

			triggers: {
				'click a.sync'		: 'pagination:sync:clicked',
				'click a.destroy'	: 'pagination:clear:clicked',
			},

			events: {
				'click a.prev'		: 'previous',
				'click a.next'		: 'next',
			},

			collectionEvents: {
				'sync reset': 'render'
			},

			serializeData: function(){
				var state = _.clone(this.collection.state);

				if(Modernizr.indexeddb) {
					var last_update = new Date( parseInt( POS.request('options:get', 'last_update') ) );
					state.last_update = last_update.getTime() > 0 ? last_update.toLocaleTimeString() : ' - ' ;
				}

				// calculate number of items on a page
				if(state.currentPage === state.lastPage) {
					state.currentRecords = state.totalRecords - (state.pageSize * (state.currentPage - 1));
				}
				else {
					state.currentRecords = state.pageSize;
				}

				// no results
				state.totalPages 	= state.totalPages ? state.totalPages : 1 ; 
				state.totalRecords 	= state.totalRecords ? state.totalRecords : 0 ; 

				return state;
			},

			previous: function(e) {
				e.preventDefault();
				if(this.collection.hasPreviousPage()) {
					this.collection.getPreviousPage();
				}
			},

			next: function(e) {
				e.preventDefault();
				if(this.collection.hasNextPage()) {
					this.collection.getNextPage();
				}
			}

		});

		View.DownloadProgress = Marionette.ItemView.extend({

			behaviors: {
				Modal: {
					behaviorClass: POS.Components.Modal.Behavior
				}
			},

			events: {
				'click .btn-primary' : 'confirm',
				'click .btn-default' : 'cancel',
				'click .close' 		 : 'cancel'
			},

			initialize: function (options) {
				this.template = _.template(options.data);
				this.trigger('modal:open', this.showProgressBar );
			},

			confirm: function () {
				this.trigger('modal:close');
			},

			cancel: function () {
				this.trigger('modal:close');
			},

			showProgressBar: function(args) {
				var el = args.view.content.$el.find('#progress-bar');
				var progressBar = POS.request( 'get:progressbar:component', { el: el } );
				progressBar.model.set({ max: el.data('total'), progress: 0, display: 'fraction' });

				this.listenTo( progressBar.model, 'progress:complete', function() {
					args.view.content.$el.find('.modal-footer').show();
				});

				progressBar.render();
			}

		});

	});

	return POS.ProductsApp.List.View;
});