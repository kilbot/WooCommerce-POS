/**
 * Helper functions for getting and setting POS user settings
 */

define([], function() {
	
	var _get = function(key) {
		if ( !Modernizr.localstorage ) { return false; }
		var value = localStorage.getItem(key);
		return value;
	};

	var _set = function(key, value) {
		if ( !Modernizr.localstorage ) { return false; }
		localStorage.setItem(key, value); 
		console.log('saved ' + key + ': ' + value);
		return true;
	};

	return {
		get: _get,
		set: _set
	};
});