define(['app'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.ProductTab = Backbone.Model.extend({
			defaults: {
				label: '',
				value: '',
				active: false,
				fixed: true
			},
			idAttribute: 'value',
			initialize: function(models, options) { 
				this.on('all', function(e) { console.log("Tab event: " + e); }); // debug				
			},
		});

		Entities.ProductTabs = Backbone.Collection.extend({
			model: Entities.ProductTab,
			initialize: function(models, options) { 
				this.on('all', function(e) { console.log("Tab Collection event: " + e); }); // debug				
			},

		});

		var API = {
			getTabEntities: function() {
				return new Entities.ProductTabs( pos_params.tabs );
			}
		}

		POS.reqres.setHandler('tab:entities', function() {
			return API.getTabEntities();
		});

	});

});