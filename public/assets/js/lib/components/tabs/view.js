define([
	'app',
	'text!lib/components/tabs/template.html',
	'handlebars'
], function(
	POS,
	TabsTmpl,
	Handlebars
){
	
	POS.module('Components.Tabs', function(Tabs, POS, Backbone, Marionette, $, _){
		
		Tabs.ItemView = Marionette.ItemView.extend({
			tagName: 'li',
			template: Handlebars.compile( TabsTmpl ),
			className: function() {
				if( this.model.get('active') ) { return 'active'; }
			},

			triggers: {
				'click': 'tab:clicked',
				'click .action-remove': 'tab:remove:clicked'
			},

		});

		Tabs.View = Marionette.CollectionView.extend({
			tagName: 'ul',
			childView: Tabs.ItemView,

			collectionEvents: {
				'change:active'	: 'render',
			},
			
		});

	});

});