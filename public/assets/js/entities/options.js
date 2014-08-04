define(['app'], function(POS){
	
	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.channel = Backbone.Radio.channel('entities');

		var API = {
			get: function(key){
				if ( !Modernizr.localstorage ) return false;
				var value = localStorage.getItem(key);
				if(POS.debug) console.log('[notice] ' + key + ' retrieved');
				return value;
			},
			set: function(key, value){
				if ( !Modernizr.localstorage ) { return false; }
				localStorage.setItem(key, value);
				if(POS.debug) console.log('[notice] ' + key + ' saved');
				return true;
			},
			delete: function(key) {
				if ( !Modernizr.localstorage ) { return false; }
				localStorage.removeItem(key);
				if(POS.debug) console.log('[notice] ' + key + ' removed');
				return true;
			}
		};

		Entities.channel.reply('options:get', function(key){
			return _.isString(key) ? API.get(key) : false ;
		});

		Entities.channel.comply('options:set', function(key, value){
			return _.isString(key) ? API.set(key, value) : false ;
		});

		Entities.channel.comply('options:delete', function(key){
			return _.isString(key) ? API.delete(key) : false ;
		});

	});

	return;
});