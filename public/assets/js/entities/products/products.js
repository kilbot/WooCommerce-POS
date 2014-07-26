define([
	'app', 
	'paginator', 
	'entities/products/db', 
	'entities/products/product',
	'entities/filter'
], function(
	POS, 
	PageableCollection
){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.ProductCollection = Backbone.PageableCollection.extend({
			database: Entities.DB,
			storeName: 'products',
			// model: Entities.Product,
			mode: 'client',

			filterEntities: POS.request('filter:entities'),

			state: {
				pageSize: 5,
			},
			
			initialize: function(models, options) {
				// this.on('all', function(e) { console.log("Product Collection event: " + e); }); // debug

				var self = this;
				this.listenTo( this.filterEntities, 'reset', function(e) {
					self.filterProducts();
				});

			},

			filterProducts: function() {

				// reset filtered
				filtered = this.filterCollection.models;

				// if active filter
				if( this.filterEntities.length > 0 ) {
					var text = _.first( this.filterEntities.values('text') );

					filtered = this.filterCollection.filter( function(product){
						return product.get( 'title' ).toLowerCase().indexOf( text ) !== -1
					});
				}

				this.fullCollection.reset(filtered, {reindex: false});
			}

		});

	});

	return;
});