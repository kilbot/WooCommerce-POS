var Application = require('apps/app/application');

// sync config
require('lib/config/sync');

/**
 * Services
 */
var EntitiesService = require('entities/service');
var HeaderService = require('apps/header/service');
var ModalService = require('lib/components/modal/service');
var PopoverService = require('lib/components/popover/service');
var PrintService = require('lib/components/print/service');
var TabsService = require('lib/components/tabs/service');
var ButtonsService = require('lib/components/buttons/service');
var NumpadService = require('lib/components/numpad/service');

/**
 * SubApps
 */
var POSRouter = require('apps/pos/router');
var SupportRouter = require('apps/support/router');
var PrintRouter = require('apps/print/router');

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
  headerContainer : app.layout.getRegion('header'),
  menuContainer   : app.layout.getRegion('menu')
});

app.posApp = new POSRouter({
  container: app.layout.getRegion('main')
});

app.supportApp = new SupportRouter({
  container: app.layout.getRegion('main')
});

app.printApp = new PrintRouter({
  container: app.layout.getRegion('main')
});

app.modalService = new ModalService();
app.popoverService = new PopoverService();
app.printService = new PrintService();
app.tabsService = new TabsService();
app.buttonsService = new ButtonsService();
app.numpadService = new NumpadService();

/**
 * Attach app to window for third party plugins
 */
module.exports = app;