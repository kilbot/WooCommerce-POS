var Application = require('apps/admin/application');
var _ = require('lodash');

/**
 * Services
 */
var EntitiesService = require('entities/service');
var ModalService = require('lib/components/modal/service');
var TabsService = require('lib/components/tabs/service');
var ButtonsService = require('lib/components/buttons/service');
var PrintService = require('lib/components/print/service');

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
var app = new Application({
  modalService    : new ModalService(),
  tabsService     : new TabsService(),
  buttonsService  : new ButtonsService(),
  printService    : new PrintService()
});

/**
 * ... add Services which require layout and params
 */
app.on('before:start', function(options) {

  // attach services to global App
  _.extend(this, {
    entitiesService : new EntitiesService(options),
    settingsApp     : new SettingsRouter({
      container     : this.layout.getRegion('main')
    })
  });

  // start services
  this.printService.start();

});

/**
 * Attach app to window for third party plugins
 */
module.exports = app;