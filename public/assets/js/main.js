// Require.js Configurations
// -------------------------
require.config({

	// Sets the js folder as the base directory for all future relative paths
	baseUrl: '/wp-content/plugins/woocommerce-pos/public/assets/js',


	paths: {

		// Core Libraries
		// 'jquery': '//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min',
		'jquery': '../../../bower_components/jquery/dist/jquery.min',
		'underscore': '../../../bower_components/lodash/dist/lodash.min',
		// 'underscore': '../../../bower_components/underscore/underscore',
		'backbone': '../../../bower_components/backbone/backbone',
		'accounting': '../../../bower_components/accounting/accounting.min',
		
		// Convenience methods for getting and setting User settings
		'settings': '../../../public/assets/js/plugins/Settings',

		// Plugins
		'bootstrap-modal': '../../../bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/modal',
		'bootstrap-dropdown': '../../../bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/dropdown',
		'backbone-indexeddb': '../../../bower_components/indexeddb-backbonejs-adapter/backbone-indexeddb',
		'backbone-localstorage': '../../../bower_components/backbone.localStorage/backbone.localStorage',
		'backbone-paginator': '../../../bower_components/backbone.paginator/lib/backbone.paginator.min',
		'pushy': '../../../public/assets/js/plugins/pushy',

		// Custom Plugins
		'autoGrowInput': '../../../public/assets/js/plugins/jquery.autoGrowInput',

	},

	// Sets the configuration for third party scripts that are not AMD compatible
	shim: {
		'bootstrap-dropdown': {
			deps: ['jquery'],
		},
		'pushy': {
			deps: ['jquery'],
		},
    }

});

require(['views/ProductList', 'pushy', 'bootstrap-dropdown'], 
	function( ProductList ){

	if ( typeof pos_params !== 'undefined' ) {

		//boot the POS
		var productList = new ProductList();
		
	} else {
		console.log('No pos_params, no start the app!');
	}

});