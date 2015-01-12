var _ = require('underscore');

///**
// * create global variable
// */
//global['POS'] = {
//    Behaviors: {}
//};

/**
 * helpers
 */
require('lib/utilities/handlebars-helpers');
require('lib/utilities/stickit-handlers');

/**
 * Create the app
 */
var Application = require('apps/app/application');
var app = new Application();

/**
 * Modules
 */
app.module( 'Entities', {
    moduleClass: require('entities/module')
});

app.module( 'HeaderApp', {
    moduleClass: require('apps/header/module'),
    container: app.layout.headerRegion
});

app.module( 'POSApp', {
    moduleClass: require('apps/pos/module'),
    container: app.layout.mainRegion
});

app.module( 'SupportApp', {
    moduleClass: require('apps/support/module'),
    container: app.layout.mainRegion
});

app.module('Modal', {
    moduleClass: require('lib/components/modal/module'),
    container: app.layout.modalRegion
});

/**
 * Expose app to window for third party plugins
 */
global['POS'] = _.defaults( app, ( global['POS'] || {} ) );