define(['app', 'paginator', 'entities/products/db', 'entities/products/product'], function(POS, PageableCollection){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.ProductCollection = Backbone.PageableCollection.extend({
			database: Entities.DB,
			storeName: 'products',
			// model: Entities.Product,
			mode: 'client',

			state: {
				pageSize: 5,
			},
			
			initialize: function(models, options) {
				// this.on('all', function(e) { console.log("Product Collection event: " + e); }); // debug

				options || (options = {});
				this.parameters = options.parameters || new Backbone.Model({ page: 1 });

				var self = this;
				this.listenTo( this.parameters, 'change', function(model) {
					if( _.has( model.changed, 'criterion' )) {
						console.log('criterion changed');
					}
					// self.getPage( parseInt( self.parameters.get('page') , 10 ) );
				});

			},

		});

	});

	return;
});