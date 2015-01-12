var _ = require('underscore');
var POS = require('lib/utilities/global');
var Application = require('apps/app/application');

/**
 * Create the app
 */
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

app.module( 'Modal', {
    moduleClass: require('lib/components/modal/module'),
    container: app.layout.modalRegion
});

/**
 * Attach app to window for third party plugins
 */
window.POS = _.defaults( app, POS );