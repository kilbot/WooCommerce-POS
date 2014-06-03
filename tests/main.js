// Require.js Configurations
// -------------------------
require.config({

	// Sets the js folder as the base directory for all future relative paths
	baseUrl: '/wp-content/plugins/woocommerce-pos/public/assets/js',

	paths: {

        // jasmine
        'jasmine': '../../../tests/lib/jasmine-2.0.0/jasmine',
        'jasmine-html': '../../../tests/lib/jasmine-2.0.0/jasmine-html',
        'boot': '../../../tests/lib/jasmine-2.0.0/boot',

		// Core Libraries
		// 'jquery': '//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min',
		'jquery': '../../../bower_components/jquery/dist/jquery.min',
		'underscore': '../../../bower_components/lodash/dist/lodash.min',
		// 'underscore': 'bower_components/underscore/underscore',
		'backbone': '../../../bower_components/backbone/backbone',
		'accounting': '../../../bower_components/accounting/accounting.min',
		
		// Convenience methods for getting and setting User settings
		'settings': '../../../public/assets/js/plugins/Settings',

		// Plugins
        'bootstrap-modal': '../../../bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/modal',
        'bootstrap-dropdown': '../../../bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/dropdown',
        'backbone-modal': '../../../bower_components/backbone.bootstrap-modal/src/backbone.bootstrap-modal',
        'backbone-indexeddb': '../../../bower_components/indexeddb-backbonejs-adapter/backbone-indexeddb',
        'backbone-localstorage': '../../../bower_components/backbone.localStorage/backbone.localStorage',
        'backbone-paginator': '../../../bower_components/backbone.paginator/lib/backbone.paginator.min',
        
        'text': '../../../tests/lib/text',
		'json': '../../../tests/lib/json',

        // Dummy Data
        'dummy-products': '../../../tests/data/dummy-products.json'

	},

	// Sets the configuration for third party scripts that are not AMD compatible
	shim: {
        'jasmine': {
            exports: 'window.jasmineRequire'
        },
        'jasmine-html': {
            deps: ['jasmine'],
            exports: 'window.jasmineRequire'
        },
        'boot': {
            deps: ['jasmine', 'jasmine-html'],
            exports: 'window.jasmineRequire'
        }
    }
});

var specs = [
    '../../../tests/spec/cartItemSpec',
    '../../../tests/spec/cartTotalsSpec',
];

// default params
var pos_params = {
    "ajax_url": "\/wp-admin\/admin-ajax.php",
    "loading_icon": "http:\/\/woopos.com.au\/wp-content\/plugins\/woocommerce-pos\/\/assets\/ajax-loader.gif",
    "accounting": {
        "currency": {
            "symbol": "&#36;",
            "format": {
                "pos": "%s%v",
                "neg": "- %s%v",
                "zero": "%s%v"
            },
            "decimal": ".",
            "thousand": ",",
            "precision": "2"
        },
        "number": {
            "precision": "2",
            "thousand": "",
            "decimal": "."
        }
    },
    "wc": {
        "tax_label": "Tax",
        "calc_taxes": "no",
        "prices_include_tax": "no",
        "tax_round_at_subtotal": "no",
        "tax_display_cart": "excl",
        "tax_total_display": "single"
    }
};

require(['boot'], function () {

    // Load the specs
    require(specs, function () {

        // Initialize the HTML Reporter and execute the environment (setup by `boot.js`)
        window.onload();
    });
});