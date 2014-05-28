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
		'backbone-modal': '../../../bower_components/backbone.bootstrap-modal/src/backbone.bootstrap-modal',
		'backbone-deepmodel': '../../../bower_components/backbone-deep-model/distribution/deep-model',
		'backbone-indexeddb': '../../../bower_components/indexeddb-backbonejs-adapter/backbone-indexeddb',
		'backbone-paginator': '../../../bower_components/backbone.paginator/lib/backbone.paginator.min',
		'pushy': '../../../public/assets/js/plugins/pushy',

		// 'bootstrap': '../libs/plugins/bootstrap',
		// 'text': '../libs/plugins/text',
		// 'jasminejquery': '../libs/plugins/jasmine-jquery'

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

require(['views/ProductList', 'views/CartList', 'pushy', 'bootstrap-dropdown'], function( ProductList, CartList ){

	if ( typeof pos_params !== undefined ) {

		//boot the POS
		var productList = new ProductList();
		var cartList = new CartList();
	} else {
		console.log('No pos_params, no start the app!');
	}

});