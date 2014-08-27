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
        'jquery': 'vendor/jquery-2.1.1.min',
        // 'jquery': '../../../bower_components/jquery/dist/jquery.min',
        underscore  : '../../../bower_components/lodash/dist/lodash.min',
        backbone    : '../../../bower_components/backbone/backbone',
        'backbone.radio': '../../../bower_components/backbone.radio/build/backbone.radio',
        'backbone.babysitter': '../../../bower_components/backbone.babysitter/lib/backbone.babysitter',
        'backbone.marionette': '../../../bower_components/marionette/lib/core/backbone.marionette',
        handlebars  : '../../../bower_components/handlebars/handlebars.min',
        indexeddb   : '../../../bower_components/indexeddb-backbonejs-adapter/backbone-indexeddb',
        localstorage: '../../../bower_components/backbone.localstorage/backbone.localStorage',
        paginator   : '../../../bower_components/backbone.paginator/lib/backbone.paginator.min',
        accounting  : '../../../bower_components/accounting/accounting.min',
        moment      : '../../../bower_components/moment/min/moment.min',
        
        text: '../../../tests/lib/text',
		json: '../../../tests/lib/json',

        // Dummy Data
        'dummy-products': '../../../tests/data/dummy-products.json',
        helpers: '../../../public/assets/js/lib/utilities/helpers',

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
        },
        handlebars: {
            exports: 'Handlebars',
            init: function() {
                this.Handlebars = Handlebars;
                return this.Handlebars;
            }
        }
    }
});

var specs = [
    '../../../tests/spec/cartItemSpec',
    '../../../tests/spec/cartItemsSpec',
    // '../../../tests/spec/cartTotalsSpec',
];

// default params
var pos_params = {
    "ajax_url": "\/wp-admin\/admin-ajax.php",
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
    },
    "customer": {
        "default_id": "0",
        "default_name": "Guest"
    }
};

window.POS = {};

require(['boot'], function () {

    // Load the specs
    require(specs, function () {

        // Initialize the HTML Reporter and execute the environment (setup by `boot.js`)
        window.onload();
    });
});