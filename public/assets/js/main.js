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
		
		// Convenince methods for getting and setting User settings
		'settings': '../../../public/assets/js/plugins/pos-settings',

		// Plugins
		'bootstrap-modal': '../../../bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/modal',
		'backbone-modal': '../../../bower_components/backbone.bootstrap-modal/src/backbone.bootstrap-modal',
		'backbone-deepmodel': '../../../bower_components/backbone-deep-model/distribution/deep-model',
		'backbone-indexeddb': '../../../bower_components/indexeddb-backbonejs-adapter/backbone-indexeddb',
		'backbone-paginator': '../../../bower_components/backbone.paginator/lib/backbone.paginator.min',

		// 'bootstrap': '../libs/plugins/bootstrap',
		// 'text': '../libs/plugins/text',
		// 'jasminejquery': '../libs/plugins/jasmine-jquery'

		// Custom Plugins
		'autoGrowInput': '../../../public/assets/js/plugins/jquery.autoGrowInput',

	},

	// Sets the configuration for third party scripts that are not AMD compatible
	shim: {

    }

});

require(['views/ProductList', 'views/CartList'], function( ProductList, CartList ){

	// show products
	var productList = new ProductList();

	// show cart
	var cartList = new CartList();

});