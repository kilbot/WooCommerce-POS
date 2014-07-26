define(['app'], function(POS){
	
	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		var API = {
			get: function(key){
				if ( !Modernizr.localstorage ) { return false; }
				var value = localStorage.getItem(key);
				return value;
			},
			set: function(key, value){
				if ( !Modernizr.localstorage ) { return false; }
				localStorage.setItem(key, value); 
				return true;
			}
		};

		POS.reqres.setHandler('options:get', function(key){
			return _.isString(key) ? API.get(key) : false ;
		});

		POS.commands.setHandler('options:set', function(key, value){
			return _.isString(key) ? API.set(key, value) : false ;
		});
	});

	return;
});