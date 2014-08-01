define(['app', 'lib/components/tabs/tabs_view'], function(POS){

	POS.module('Components.Tabs', function(Tabs, POS, Backbone, Marionette, $, _){

		Tabs.TabsController = Marionette.Controller.extend({

			initialize: function(options) {
				var view = this.getTabsView( options.collection );

				this.listenTo( view, 'childview:tab:clicked', function(childview, args) {
					args.model.set({ active: true });
				});

				this.listenTo( view, 'childview:tab:remove:clicked', function(childview, args) {
					options.collection.remove(args.model);
				});

				options.region.show(view);
			},

			getTabsView: function(collection) {
				return new Tabs.TabsView({
					collection: collection
				});
			}

		});

		POS.commands.setHandler( 'show:tabs', function(region, collection) {
			return new Tabs.TabsController({
				region: region,
				collection: collection
			})
		});

	});

});