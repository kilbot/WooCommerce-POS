define(['app'], function(POS){

	POS.module('Components.Tabs', function(Tabs, POS, Backbone, Marionette, $, _){

		Tabs.Model = Backbone.Model.extend({
			defaults: {
				label: '',
				value: '',
				active: false,
				fixed: true
			},
			idAttribute: 'value'
		});

		Tabs.Collection = Backbone.Collection.extend({
			model: Tabs.Model,
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

	});

});