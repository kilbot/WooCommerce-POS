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
				'change:active'	: 'render',
			},
			
		});

	});

});