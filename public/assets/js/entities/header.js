define(['app'], function(POS){
	
	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){
		
		Entities.Header = Backbone.Model.extend({

		});

		Entities.HeaderCollection = Backbone.Collection.extend({
			model: Entities.Header,

		});

		var initializeHeaders = function(){
			Entities.headers = new Entities.HeaderCollection([
				{ name: 'Contacts', url: 'contacts', navigationTrigger: 'contacts:list' },
				{ name: 'About', url: 'about', navigationTrigger: 'about:show' }
			]);
		};

		var API = {
			getHeaders: function(){
				if(Entities.headers === undefined){
					initializeHeaders();
				}
				return Entities.headers;
			}
		};

		POS.reqres.setHandler('header:entities', function(){
			return API.getHeaders();
		});
	});

	return;
});