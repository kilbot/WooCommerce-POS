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
				this.on( 'remove', this.onRemove );			
				this.on( 'change:active', this.onChangeActive );			
			},

			onRemove: function() {
				var activeTabs = _.compact( this.pluck('active') );
				if( _.isEmpty( activeTabs ) ) {
					this.first().set({ active: true });
				}
			},

			onChangeActive: function(model) {
				this.each( function(tab) {
					if( model.id !== tab.id ) {
						tab.set( { active: false }, { silent: true } );
					}
				});
			}

		});

	});

});