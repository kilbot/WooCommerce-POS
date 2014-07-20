define(['app', 'handlebars', 'apps/config/marionette/regions/transition'], function(POS, Handlebars){

	POS.module('ProductsApp.List.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-products-layout',

			regions: {
				filterRegion: '#filter',
				tabsRegion: '#filter-tabs',
				productsRegion: Marionette.Region.Transition.extend({
					el: '#products',
					concurrentTransition: true
				}),
				paginationRegion: '#pagination'
			}
		});

		/**
		 * Filter
		 */
		View.Filter = Marionette.ItemView.extend({
			template: '#tmpl-products-filter',

			events: {
				'keyup input[type=search]': 'search',
				'click a.clear'	: 'clear',
			},

			ui: {
				searchField : 'input[type=search]',
				clearBtn 	: 'a.clear'
			},

			search: _.debounce( function(e) {
				var query = this.ui.searchField.val();
				this.showClearButtonMaybe( query );
				this.trigger('products:filter', query);
			}, 149),

			clear: function(e) {
				this.ui.searchField.val('');
				this.trigger('products:filter', '');
				this.showClearButtonMaybe('');
			},

			showClearButtonMaybe: function ( query ) {
				_.isEmpty(query) ? this.ui.clearBtn.hide() : this.ui.clearBtn.show() ;
			},
		});

		/**
		 * Filter Tabs
		 */
		View.FilterTab = Marionette.ItemView.extend({
			tagName: 'li',
			template: _.template('<a href="#"><i class="fa fa-times-circle action-remove"></i></a> <%= category %>: <%= value %>'),

			events: {
				'click .action-remove' : 'removeFilter'
			},

			removeFilter: function(e) {
				this.trigger('filter:remove', this.model);
			}
		});

		View.FilterTabs = Marionette.CollectionView.extend({
			tagName: 'ul',
			childView: View.FilterTab,
		});

		/**
		 * Single Product
		 */
		View.Product = Marionette.ItemView.extend({
			tagName: 'li',
			template: Handlebars.compile( $('#tmpl-product').html() ),
			className: function(){ if( this.isVariable() ) return 'variable' },

			events: {
				'click .action-add' 	: 'addToCart',
				'click .action-variations' 	: 'showVariations'
			},

			onBeforeRender: function(){
				if( this.isVariable() ) { this.model.set('isVariable', true); }
			},

			isVariable: function() {
				if( this.model.get('type') === 'variable' ) { return true; }
			},

			addToCart: function(e) {
				e.preventDefault();
				POS.execute( 'cart:add', this.model );
			},

			showVariations: function(e) {
				e.preventDefault();
				this.trigger('product:variations', this.model);
			}
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

			transitionInCss: {
				'right': '100%'
			},

			initialize: function() {
				this.listenToOnce( this, 'animateIn', this.cssTearDown );
				this.listenToOnce( this, 'animateOut', this.cssTearDown );
			},

			// Do some jQuery stuff, then, once you're done, trigger 'animateIn' to let the region
			// know that you're done
			animateIn: function() {
				this.cssSetUp();
				this.$el.animate(
					{ 'right': 0 },
					400,
					_.bind(this.trigger, this, 'animateIn')
				);
			},

			// Same as above, except this time we trigger 'animateOut'
			animateOut: function() {
				this.cssSetUp();
				this.$el.animate(
					{ 'right': '100%' },
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
		 * Product Variations
		 */
		View.Variations = Marionette.CollectionView.extend({
			tagName: 'ul',
			className: 'variations list',
			childView: View.Product,
			emptyView: NoProductsView,

			transitionInCss: {
				'left': '100%',
			},

			initialize: function() {
				this.listenToOnce( this, 'animateIn', this.cssTearDown );
				this.listenToOnce( this, 'animateOut', this.cssTearDown );
			},

			// Do some jQuery stuff, then, once you're done, trigger 'animateIn' to let the region
			// know that you're done
			animateIn: function() {
				this.cssSetUp();
				this.$el.animate(
					{ 'left': 0 },
					400,
					_.bind(this.trigger, this, 'animateIn')
				);
			},

			// Same as above, except this time we trigger 'animateOut'
			animateOut: function() {
				this.cssSetUp();
				this.$el.animate(
					{ 'left': '100%' },
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

			events: {
				'click a.prev'		: 'previous',
				'click a.next'		: 'next',
				'click a.sync'		: 'sync',
				'click a.destroy'	: 'clear',
			},

			previous: function() {
				if(this.collection.hasPreviousPage()) {
					this.collection.getPreviousPage();
				}
				return false;
			},

			next: function() {
				if(this.collection.hasNextPage()) {
					this.collection.getNextPage();
				}
				return false;
			},

			sync: function() {
				this.collection.serverSync();
				return false;
			},

			clear: function() {
				this.collection.clear(); // clear the collection
				return false;
			},

		});

	});

	return POS.ProductsApp.List.View;
});