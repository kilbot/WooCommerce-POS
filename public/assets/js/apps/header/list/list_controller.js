define(['app', 'apps/header/list/list_view'], function(POS, View){

	POS.module('HeaderApp.List', function(List, POS, Backbone, Marionette, $, _){
		
		List.Controller = {
			listHeader: function(){
				require(['entities/header'], function(){
					var links = POS.request('header:entities');
					var headers = new View.Headers({collection: links});

					headers.on('brand:clicked', function(){
						POS.trigger('products:list');
					});

					headers.on('childview:navigate', function(childView, model){
						var trigger = model.get('navigationTrigger');
						POS.trigger(trigger);
					});

					POS.headerRegion.show(headers);
				});
			},

			setActiveHeader: function(headerUrl){
				var links = POS.request('header:entities');
				var headerToSelect = links.find(function(header){ return header.get('url') === headerUrl; });
				headerToSelect.select();
				links.trigger('reset');
			}

		};
		
	});

	return POS.HeaderApp.List.Controller;
});