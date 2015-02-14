var POS = require('lib/utilities/global');
var Application = require('apps/app/application');

/**
 * Services
 */
var EntitiesService = require('entities/service');
var HeaderService = require('apps/header/service');
var ModalService = require('lib/components/modal/service');
var PopoverService = require('lib/components/popover/service');

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
app.entitiesService = new EntitiesService({
  app: app
});

app.headerService = new HeaderService({
  headerContainer : app.layout.headerRegion,
  menuContainer   : app.layout.menuRegion,
  tabsContainer   : app.layout.tabsRegion
});

app.posApp = new POSRouter({
  container: app.layout.mainRegion
});

app.supportApp = new SupportRouter({
  container: app.layout.mainRegion
});

app.modalService = new ModalService({
  container: app.layout.modalRegion
});

app.popoverService = new PopoverService();

/**
 * Attach app to window for third party plugins
 */
module.exports = window.POS = POS.create(app);