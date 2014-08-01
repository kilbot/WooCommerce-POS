define([
	'app',
	'hbs!lib/components/tabs/templates/tabs'
], function(
	POS,
	TabsTmpl
){
	
	POS.module('Components.Tabs', function(Tabs, POS, Backbone, Marionette, $, _){
		
		Tabs.TabView = Marionette.ItemView.extend({
			tagName: 'li',
			template: TabsTmpl,
			className: function() {
				if( this.model.get('active') ) { return 'active'; }
			},

			triggers: {
				'click': 'tab:clicked',
				'click .action-remove': 'tab:remove:clicked'
			},

		});

		Tabs.TabsView = Marionette.CollectionView.extend({
			tagName: 'ul',
			childView: Tabs.TabView,

			collectionEvents: {
				'add' 			: 'addTab',
				'remove' 		: 'removeTab',
				'change:active'	: 'activateTab'
			},

			addTab: function(model) {
				model.set({ active: true });
			},

			removeTab: function(model) {
				this.collection.first().set({ active: true });
			},

			activateTab: function(model) {
				_(this.collection.models).each( function(tab) {
					if( model.id !== tab.id ) {
						tab.set( { active: false }, { silent: true } );
					}
				});
				this.render();
			}
			
		});

	});

});