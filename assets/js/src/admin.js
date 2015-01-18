var POS = require('lib/utilities/global');
var Application = require('apps/admin/application');

/**
 * bootstrap Handlebars Helpers
 */
require('lib/utilities/handlebars-helpers');

/**
 * Create the app
 */
var app = new Application();
/**
 * Modules
 */
app.module( 'SettingsApp', {
  moduleClass: require('apps/settings/module'),
  container: app.layout.mainRegion
});

/**
 * Attach app to window for third party plugins
 */
module.exports = window.POS = POS.create(app);