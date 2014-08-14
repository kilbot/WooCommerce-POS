define([
	'backbone.marionette',
	'lib/utilities/radio.shim'
], function(
	Marionette
){

	var POS = new Marionette.Application();

	POS.globalChannel = Backbone.Radio.channel('global');

	Marionette.Behaviors.getBehaviorClass = function(options, key) {
		return POS.Components[key].Behavior; // eg: POS.Components.Modal.Behavior
	};

	POS.addRegions({
		headerRegion: '#header',
		leftRegion	: '#left-panel',
		rightRegion	: '#right-panel',
		modalRegion	: '#modal'
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

		// debugging
		if( POS.Entities.channel.request('options:get', 'debug') ) {
			POS.debug = true;
			Backbone.Radio.DEBUG = true;
			console.info('Debugging is on, visit http://woopos.com.au/docs/debugging');
		} else {
			console.info('Debugging is off, visit http://woopos.com.au/docs/debugging');
		}

		// show products 
		POS.module('ProductsApp').start();

		if(Backbone.history){
			Backbone.history.start();
			if(POS.getCurrentRoute() === ''){
				// default to cart
				POS.trigger('cart:list');
			}
		}
	});

	return POS;
});