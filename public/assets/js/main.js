// Require.js Configurations
// -------------------------

// load jQuery using CDN, keep jQuery separate for other pages
define('jquery', [], function() { return jQuery; });

require.config({

	// Sets the js folder as the base directory for all future relative paths
	baseUrl: '/wp-content/plugins/woocommerce-pos/public/assets/js',


	paths: {

		// Core Libraries
		// 'jquery': '//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min',
		// 'jquery': '../../../bower_components/jquery/dist/jquery.min',
		'underscore': '../../../bower_components/lodash/dist/lodash.min',
		// 'underscore': '../../../bower_components/underscore/underscore',
		'backbone': '../../../bower_components/backbone/backbone',
		'handlebars': '../../../bower_components/handlebars/handlebars.min',
		'accounting': '../../../bower_components/accounting/accounting.min',
		
		// Convenience methods for getting and setting User settings
		'settings': '../../../public/assets/js/src/Settings',

		// Plugins
		// 'bootstrap-modal': '../../../bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/modal',
		'backbone-indexeddb': '../../../bower_components/indexeddb-backbonejs-adapter/backbone-indexeddb',
		'backbone-localstorage': '../../../bower_components/backbone.localStorage/backbone.localStorage',
		'backbone-paginator': '../../../bower_components/backbone.paginator/lib/backbone.paginator.min',

		// Custom Plugins
		'autoGrowInput': '../../../public/assets/js/src/jquery.autoGrowInput',
		'selectText': '../../../public/assets/js/src/jquery.selectText',

	},

	// Sets the configuration for third party scripts that are not AMD compatible
	shim: {
		handlebars: {
			exports: 'Handlebars',
			init: function() {
				this.Handlebars = Handlebars;
				return this.Handlebars;
			}
		}
    }

});

require(['underscore', 'backbone', 'views/ProductList', 'views/CartList'], 
	function(_, Backbone, ProductList, CartList ){

	// create pubsub object
	var pubSub = _.extend({},Backbone.Events);

	// load the products
	new ProductList({ pubSub: pubSub });

	// init the cart
	new CartList({ pubSub: pubSub });

});