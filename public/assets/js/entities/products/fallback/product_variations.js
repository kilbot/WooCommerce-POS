define(['app', 'paginator', 'entities/products/product'], function(POS, PageableCollection){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.FallbackVariationsCollection = Backbone.PageableCollection.extend({
			model: Entities.FallbackProduct,
			mode: 'client',

			state: {
				pageSize: 5,
			},

			initialize: function( variations, parent ) {
				// this.on('all', function(e) { console.log("Variation Collection event: " + e); }); // debug

				// set some attributes from the parent
				_(variations).forEach( function(variation) {
					variation['type'] = 'variation';
					variation['title'] = parent.get('title');
					variation['categories'] = parent.get('categories');				
				});
			}
		});

	});

	return;
});