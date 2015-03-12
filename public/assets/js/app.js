define([
	'backbone.marionette',
	'lib/utilities/radio.shim',
	'lib/config/application'
], function(
	Marionette
){

	window.POS = new Marionette.Application();

	/**
	 * Regions
	 */
	POS.addRegions({
		headerRegion: '#header',
		leftRegion	: '#left-panel',
		rightRegion	: '#right-panel',
		modalRegion	: '#modal'
	});

	/**
	 * Routes
	 */
	POS.POSRouting = function(){
	  var POSRouting = {};

	  POSRouting.Router = Backbone.Marionette.AppRouter.extend({
	    appRoutes: {
	      "": "products",
	      "products": "products",
	      "customers": "customers"
	    }
	  });

	  POS.addInitializer(function(){
	    POSRouting.router = new POSRouting.Router({
	      controller: POS
	    });
	  });

	  return POSRouting;
	}();

	POS.products = function(){
		POS.module('ProductsApp').stop();
		POS.module('ProductsApp').start();
	};
	POS.customers = function(){
		POS.module('CustomerApp').show();
	};

	/**
	 * Behaviors
	 */
	Marionette.Behaviors.getBehaviorClass = function(options, key) {
		return POS.Components[key].Behavior; // eg: POS.Components.Modal.Behavior
	};

	/**
	 * Global Channel
	 */
	POS.globalChannel = Backbone.Radio.channel('global');

	POS.globalChannel.reply('default:region', function() {
		return POS.leftRegion;
	});

	POS.globalChannel.comply('register:instance', function(instance, id) {
		return POS.register(instance, id);
	});

	POS.globalChannel.comply('unregister:instance', function(instance, id) {
		return POS.unregister(instance, id);
	});

	/**
	 * Start POS
	 */
	POS.on('start', function(){

		// debugging
		if( POS.Entities.channel.request('options:get', 'debug') ) {
			POS.debug = true;
			Backbone.Radio.DEBUG = true;
			console.info('Debugging is on, visit http://woopos.com.au/docs/debugging');
		} else {
			console.info('Debugging is off, visit http://woopos.com.au/docs/debugging');
		}

		POS.startHistory();
		if( !POS.getCurrentRoute() ){
			POS.CartApp.channel.command('cart:list');
		}

	});

	return POS;
});