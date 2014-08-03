define(['app', 'lib/components/loading/view'], function(POS){

	POS.module('Components.Loading', function(Loading, POS, Backbone, Marionette, $, _){

		Loading.LoadingController = Marionette.Controller.extend({

			initialize: function(options) {
      			var view 	= options.view, 
      				config 	= options.config;

      			config = _.isBoolean(config) ? {} : config;

				_.defaults(config, { 
					loadingType : 'spinner', 
					entities 	: this.getEntities(view),
					debug 		: false
				});

				switch (config.loadingType) {
					case 'spinner':
						var loadingView = this.getLoadingView();
						this.show(loadingView);
					break;
					default:
						throw new Error('Invalid loadingType');
				}

				this.showRealView(view, loadingView, config);
			},

			showRealView: function(realView, loadingView, config){
				POS.execute('when:fetched', config.entities, function(){
					switch (config.loadingType) {
						case 'spinner':
							if(this.region.currentView !== loadingView) {
								return realView.close();
							}
						break;
					}
					this.show(realView);
				});
			},

			getEntities: function(view) {
				_.chain(view).pick('model', 'collection').toArray().compact().value();
			},

			getLoadingView: function() {
				return new Loading.LoadingView();
			}

		});

		POS.commands.setHandler('show:loading', function(view, options) {
			return new Loading.LoadingController({
				view: view,
				region: options.region,
				config: options.loading
			});
		});

	});

});