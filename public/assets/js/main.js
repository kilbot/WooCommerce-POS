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
		'backbone.syphon': '../../../bower_components/backbone.syphon/lib/amd/backbone.syphon.min',
		accounting 	: '../../../bower_components/accounting/accounting.min',
		moment 		: '../../../bower_components/moment/min/moment.min',
		text 		: '../../../bower_components/text/text',

		// Plugins
		modal 		: '../../../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal',
		tooltip 	: '../../../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip',
		popover 	: '../../../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/popover',
		collapse 	: '../../../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/collapse',
		transition 	: '../../../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/transition',
		spin 		: '../../../bower_components/spinjs/spin',
		select2 	: '../../../bower_components/select2/select2.min',
		'jquery-color': '../../../bower_components/jquery-color/jquery.color'
		
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
		collapse: {
			deps: ['jquery', 'transition']
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

	// config
	'lib/config/base_controller',
	'lib/config/localstorage_entities',
	// 'lib/config/transition_region',

	// utilities
	'lib/utilities/helpers',

	// entities
	'entities/options',
	
	// components
	'lib/components/loading/controller',
	'lib/components/modal/controller',
	'lib/components/numpad/controller',
	'lib/components/popover/controller',
	'lib/components/print/controller',
	'lib/components/progress_bar/controller',
	'lib/components/search_parser/controller',
	'lib/components/tabs/controller',

	// behaviors
	'lib/components/autogrow/behavior',
	'lib/components/collapse/behavior',
	'lib/components/pulse/behavior',
	'lib/components/select2/behavior',

	// POS modules
	'apps/cart/cart_app',
	'apps/customer/customer_app',
	'apps/products/products_app'

], function(POS){
	POS.start();
});