define(['app', 'handlebars'], function(POS, Handlebars){

	POS.module('ProductsApp.List.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-products-layout',

			regions: {
				filterRegion: '#filter',
				productsRegion: '#products'
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

			events: {
				'click .action-add' : 'addToCart'
			},

			addToCart: function() {
				this.trigger('product:add', this.model);
			}
		});

		var NoProductsView = Marionette.ItemView.extend({
			tagName: 'li',
			template: '#tmpl-products-empty',
		});

		View.Products = Marionette.CollectionView.extend({
			tagName: 'ul',
			childView: View.Product,
			emptyView: NoProductsView
		});

	});

	return POS.ProductsApp.List.View;
});