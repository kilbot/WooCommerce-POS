define(['app'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.ProductTab = Backbone.Model.extend({
			defaults: {
				label: '',
				filter: '',
				active: false

			}
		});

		Entities.ProductTabs = Backbone.Collection.extend({
			model: Entities.ProductTab,
			initialize: function(models, options) { 
				// this.on('all', function(e) { console.log("Product Tab event: " + e); }); // debug				
			},

		});

		var API = {
			getTabEntities: function() {
				return new Entities.ProductTabs([
					{
						label: 'All',
						filter: '',
						active: true
					},
					{
						label: 'Featured',
						filter: 'featured:true'
					},
					{
						label: 'Music',
						filter: 'cat:music'
					}
				]);
			}
		}

		POS.reqres.setHandler('tab:entities', function() {
			return API.getTabEntities();
		});

	});

});