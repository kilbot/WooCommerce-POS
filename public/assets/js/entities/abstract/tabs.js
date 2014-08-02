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
				// this.on('all', function(e) { console.log("Tab event: " + e); }); // debug				
			},
		});

		Entities.ProductTabs = Backbone.Collection.extend({
			model: Entities.ProductTab,
			initialize: function(models, options) { 
				// this.on('all', function(e) { console.log("Tab Collection event: " + e); }); // debug
				
				this.on( 'remove', this.onRemove );			
				this.on( 'change:active', this.onChangeActive );			
			},

			onRemove: function() {
				this.first().set({ active: true });
			},

			onChangeActive: function(model) {
				_(this.models).each( function(tab) {
					if( model.id !== tab.id ) {
						tab.set( { active: false }, { silent: true } );
					}
				});
			}

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