// Require.js Configurations
// -------------------------
require.config({

	// Sets the js folder as the base directory for all future relative paths
	baseUrl: '/wp-content/plugins/woocommerce-pos/public/assets/js',


	paths: {

		// Core Libraries
		'jquery': '../../../bower_components/jquery/dist/jquery',
		'underscore': '../../../bower_components/lodash/dist/lodash',
		// 'underscore': '../../../bower_components/underscore/underscore',
		'backbone': '../../../bower_components/backbone/backbone',
		'deepmodel': '../../../bower_components/backbone-deep-model/distribution/deep-model',
		'accounting': '../../../bower_components/accounting/accounting',
		
		// Convenince methods for getting and setting User settings
		'settings': '../../../public/assets/js/plugins/pos-settings',

		// Plugins
		'backbone.paginator': '../../../bower_components/backbone.paginator/lib/backbone.paginator',
		'indexeddb': '../../../bower_components/indexeddb-backbonejs-adapter/backbone-indexeddb',
		'bootstrap-modal': '../../../bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/modal',
		'backbone.bootstrap-modal': '../../../bower_components/backbone.bootstrap-modal/src/backbone.bootstrap-modal',
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