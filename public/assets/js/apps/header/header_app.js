define(['app', 'apps/header/list/list_controller'], function(POS, ListController){
  
	POS.module('HeaderApp', function(Header, POS, Backbone, Marionette, $, _){
    
	    var API = {
			listHeader: function(){
				ListController.listHeader();
			}
		};

		POS.commands.setHandler('set:active:header', function(name){
			ListController.setActiveHeader(name);
		});

		Header.on('start', function(){
			API.listHeader();
		});
		
	});

	return POS.HeaderApp;
});