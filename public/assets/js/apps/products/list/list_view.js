define(['app', 'handlebars', 'apps/config/marionette/regions/transition'], function(POS, Handlebars){

	POS.module('ProductsApp.List.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-products-layout',

			regions: {
				filterRegion: '#filter',
				tabsRegion: '#filter-tabs',
				productsRegion: Marionette.Region.Transition.extend({
					el: '#products',
					concurrentTransition: true,
					animateOnPageLoad: false
				}),
				paginationRegion: '#pagination'
			},

		});

		/**
		 * Filter
		 */
		View.Filter = Marionette.ItemView.extend({
			template: '#tmpl-products-filter',
			db: 'server', // local or server swicth

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
				if(this.db === 'server' && e.keyCode !== 13) { return; }
				this.search();
			},

			// actually make the query
			search: _.debounce( function() {
				this.trigger('products:filter', this.ui.searchField.val());
			}, 149),

			// clear the filter
			clear: function(e) {
				this.ui.searchField.val('');
				this.trigger('products:filter', '');
				this.showClearButtonMaybe();
			},

			showClearButtonMaybe: function() {
				_.isEmpty( this.ui.searchField.val() ) ? this.ui.clearBtn.hide() : this.ui.clearBtn.show() ;
			},
		});

		/**
		 * Filter Tabs
		 */
		View.Tab = Marionette.ItemView.extend({
			tagName: 'li',
			template: _.template('<a href="#"><i class="fa fa-times-circle action-remove"></i></a> <%= category %>: <%= value %>'),

			triggers: {
				'click': 'tab:clicked',
				'click .action-remove': 'tab:remove:clicked'
			},

		});

		View.Tabs = Marionette.CollectionView.extend({
			tagName: 'ul',
			childView: View.Tab,

			initialize: function() {
				// this.on('all', function(e) { console.log("Tabs View event: " + e); }); // debug
				this.listenTo( this.collection, 'add remove', this.render );
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
				
				if( options.slideIn === 'left' ) {
					this.transitionInCss = {'left': '100%'};
					this.transitionToCss = {'left': 0};
				}
				else {
					this.transitionInCss = {'right': '100%'};
					this.transitionToCss = {'right': 0};
				}

				this.listenToOnce( this, 'animateIn', this.cssTearDown );
				this.listenToOnce( this, 'animateOut', this.cssTearDown );
			},

			// Do some jQuery stuff, then, once you're done, trigger 'animateIn' to let the region
			// know that you're done
			animateIn: function() {
				this.cssSetUp();
				this.$el.animate(
					this.transitionToCss,
					400,
					_.bind(this.trigger, this, 'animateIn')
				);
			},

			// Same as above, except this time we trigger 'animateOut'
			animateOut: function() {
				this.cssSetUp();
				this.$el.animate(
					this.transitionInCss,
					400,
					_.bind(this.trigger, this, 'animateOut')
				);
			},

			// add some css relevant to animation
			cssSetUp: function() {
				var height = this.$el.height();
				this.$el.css({
					'position': 'absolute',
					'top': 0 
				})
				.parent().css({ 
					'position': 'relative', 
					'overflow': 'hidden',
					'width': '100%',
					'min-height': height
				});
			},

			// remove the animation css
			cssTearDown: function() {
				this.$el.removeAttr('style').parent().removeAttr('style');
			},

		});

		/**
		 * Pagination
		 */
		View.Pagination = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-pagination').html() ),

			initialize: function() {
				// this.on('all', function(e) { console.log("Pagination View event: " + e); }); // debug
				// this.listenTo( this.collection, 'sync reset', this.render );
			},

			collectionEvents: {
				'sync reset': 'render'
			},

			serializeData: function(){
				var state = _.clone(this.collection.state);

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

			triggers: {
				'click a.sync'		: 'pagination:sync:clicked',
				'click a.destroy'	: 'pagination:clear:clicked',
			},

			events: {
				'click a.prev'		: 'previous',
				'click a.next'		: 'next',
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
			},

		});

	});

	return POS.ProductsApp.List.View;
});