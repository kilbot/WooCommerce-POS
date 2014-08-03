define(['app', 'lib/components/tabs/view'], function(POS){

	POS.module('Components.Tabs', function(Tabs, POS, Backbone, Marionette, $, _){

		Tabs.Controller = Marionette.Controller.extend({

			initialize: function(options) {
				var view = this.getTabsView( options.entities );

				this.listenTo( view, 'childview:tab:clicked', function(childview, args) {
					args.model.set({ active: true });
				});

				this.listenTo( view, 'childview:tab:remove:clicked', function(childview, args) {
					options.entities.remove(args.model);
				});

				options.region.show(view);
			},

			getTabsView: function(entities) {
				return new Tabs.View({
					collection: entities
				});
			}

		});

	});

});