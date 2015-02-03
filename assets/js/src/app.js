var POS = require('lib/utilities/global');
var Application = require('apps/app/application');

/**
 * Services
 */
var EntitiesService = require('entities/service');
var HeaderService = require('apps/header/service');
var ModalService = require('lib/components/modal/service');

/**
 * SubApps
 */
var POSRouter = require('apps/pos/router');
var SupportRouter = require('apps/support/router');

/**
 * bootstrap Handlebars Helpers
 */
require('lib/utilities/handlebars-helpers');

/**
 * Create the app ...
 */
var app = new Application();

/**
 * ... add SubApps and Services
 */
app.entities = new EntitiesService({
  app: app
});

app.headerApp = new HeaderService({
  container: app.layout.header
});

app.posApp = new POSRouter({
  container: app.layout.mainRegion
});

app.supportApp = new SupportRouter({
  container: app.layout.mainRegion
});

app.modalApp = new ModalService({
  container: app.layout.modalRegion
});

/**
 * Attach app to window for third party plugins
 */
module.exports = window.POS = POS.create(app);