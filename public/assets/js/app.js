define([
	'marionette', 
	'apps/config/marionette/regions/modal'
], function(
	Marionette
){
	
	var POS = new Marionette.Application();

	POS.on('initialize:before', function() {
		POS.environment = options.environment;
	});

	POS.addRegions({
		headerRegion: '#header',
		leftRegion: '#left-panel',
		rightRegion: '#right-panel',
		dialogRegion: Marionette.Region.Modal.extend({
			el: '#modal'
		}),
		numpadRegion: '#numpad'
	});

	POS.navigate = function(route, options){
		options || (options = {});
		Backbone.history.navigate(route, options);
	};

	POS.getCurrentRoute = function(){
		return Backbone.history.fragment;
	};

	POS.startSubApp = function(appName, args){
		var currentApp = appName ? POS.module( appName ) : null;
		if ( POS.currentApp === currentApp ){ return; }

		if ( POS.currentApp ){
			POS.currentApp.stop();
		}

		POS.currentApp = currentApp;
		currentApp.start( args );
	};

	POS.on('start', function(){
		if(Backbone.history){

			Backbone.history.start();

			// show products 
			POS.module('ProductsApp').start();

			if(POS.getCurrentRoute() === ''){

				// default to cart
				POS.trigger('cart:list');
			}
		}
	});

	return POS;
});