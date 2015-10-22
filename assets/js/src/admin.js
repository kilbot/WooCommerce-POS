var Application = require('apps/admin/application');

/**
 * Services
 */
var EntitiesService = require('entities/service');
var ModalService = require('lib/components/modal/service');
var TabsService = require('lib/components/tabs/service');
var ButtonsService = require('lib/components/buttons/service');

/**
 * SubApps
 */
var SettingsRouter = require('apps/settings/router');

/**
 * bootstrap Handlebars Helpers
 */
require('lib/utilities/handlebars-helpers');

/**
 * Create the app
 */
var app = new Application();

/**
 * ... add SubApps and Services
 */
app.entities = new EntitiesService({
  app: app
});

app.settingsApp = new SettingsRouter({
  container: app.layout.getRegion('main')
});

app.modalApp = new ModalService({
  container: app.layout.getRegion('modal')
});

app.tabsService = new TabsService();
app.buttonsService = new ButtonsService();

/**
 * Attach app to window for third party plugins
 */
module.exports = app;