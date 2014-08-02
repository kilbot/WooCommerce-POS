/**
 * TODO: this is a bit confusing ..
 * need a solid way to request params set by the server
 * and user options stored locally
 */

define(['app'], function(POS){
	
	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

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
			},
			params: function(key){
				if( _(pos_params).has( key ) ) {
					if(POS.debug) console.log('[notice] ' + key + ' retrieved');
					return pos_params[key];
				} else {
					if(POS.debug) console.log('[notice] ' + key + ' not found');
					return false;
				}
			}
		};

		POS.reqres.setHandler('options:get', function(key){
			return _.isString(key) ? API.get(key) : false ;
		});

		POS.commands.setHandler('options:set', function(key, value){
			return _.isString(key) ? API.set(key, value) : false ;
		});

		POS.commands.setHandler('options:delete', function(key){
			return _.isString(key) ? API.delete(key) : false ;
		});

		POS.reqres.setHandler('params:get', function(key){
			return _.isString(key) ? API.params(key) : false ;
		});

	});

	return;
});