var POS = require('lib/utilities/global');
var Application = require('apps/admin/application');

/**
 * Services
 */
var EntitiesService = require('entities/service');
var ModalService = require('lib/components/modal/service');
var TabsService = require('lib/components/tabs/service');

/**
 * SubApps
 */
var SettingsRouter = require('apps/settings/router');

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
  container: app.layout.mainRegion
});

app.modalApp = new ModalService({
  container: app.layout.modalRegion
});

app.tabsService = new TabsService();

/**
 * Attach app to window for third party plugins
 */
module.exports = window.POS = POS.create(app);