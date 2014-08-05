// load jQuery using CDN, keep jQuery separate for other pages
define('jquery', [], function() { return jQuery; });

requirejs.config({
	baseUrl: '/wp-content/plugins/woocommerce-pos/public/assets/js',
	paths: {

		// Core Libraries
		underscore	: '../../../bower_components/lodash/dist/lodash.min',
		backbone	: '../../../bower_components/backbone/backbone',
		'backbone.radio': '../../../bower_components/backbone.radio/build/backbone.radio',
        'backbone.babysitter': '../../../bower_components/backbone.babysitter/lib/backbone.babysitter',
		'backbone.marionette': '../../../bower_components/marionette/lib/core/backbone.marionette',
		handlebars 	: '../../../bower_components/handlebars/handlebars.min',
		indexeddb 	: '../../../bower_components/indexeddb-backbonejs-adapter/backbone-indexeddb',
		localstorage: '../../../bower_components/backbone.localstorage/backbone.localStorage',
		paginator 	: '../../../bower_components/backbone.paginator/lib/backbone.paginator.min',
		accounting 	: '../../../bower_components/accounting/accounting.min',
		text 		: '../../../bower_components/text/text',

		// Plugins
		modal 		: '../../../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal',
		tooltip 	: '../../../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip',
		popover 	: '../../../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/popover',
		spin 		: '../../../bower_components/spinjs/spin',
		select2 	: '../../../bower_components/select2/select2.min',
		
	},

	shim: {
		handlebars: {
			exports: 'Handlebars',
			init: function() {
				this.Handlebars = Handlebars;
				return this.Handlebars;
			}
		},
		popover: {
			deps: ['jquery', 'tooltip']
		},
		// underscore: {
		// 	exports: '_'
		// },
		// backbone: {
		// 	deps: ['jquery', 'underscore'],
		// 	exports: 'Backbone'
		// },
		// marionette: {
		// 	deps: ['backbone'],
		// 	exports: 'Marionette'
		// },
		// localstorage: ['backbone'],
	}
});

require([
	'app',
	'entities/options',
	'entities/abstract/search_parser',
	'lib/components/components_app',
	'apps/products/products_app',
	'apps/cart/cart_app',
	'apps/checkout/checkout_app'
], function(POS){
	POS.start();
});