define(['app', 'handlebars', 'apps/config/marionette/regions/transition'], function(POS, Handlebars){

	POS.module('ProductsApp.List.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-products-layout',

			regions: {
				filterRegion: '#filter',
				productsRegion: Marionette.Region.Transition.extend({
					el: '#products'
				}),
				paginationRegion: '#pagination'
			}
		});

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
				this.trigger('product:add', this.model);
			},

			showVariations: function(e) {
				e.preventDefault();
				this.trigger('product:variations', this.model);
			}
		});

		var NoProductsView = Marionette.ItemView.extend({
			tagName: 'li',
			template: '#tmpl-products-empty',
		});

		View.Products = Marionette.CollectionView.extend({
			tagName: 'ul',
			className: 'list',
			childView: View.Product,
			emptyView: NoProductsView,

			animateIn: function() {
				this.$el.animate(
					{ opacity: 1 },
					1000,
					_.bind(this.trigger, this, 'animateIn')
				);
			},

			animateOut: function() {
				this.$el.animate(
					{ 
						right: '100%'
					},
					1000,
					_.bind(this.trigger, this, 'animateOut')
				);
			}
		});

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