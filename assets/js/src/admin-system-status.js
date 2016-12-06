var Application = require('apps/admin/application');
var _ = require('lodash');

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
var StatusRouter = require('apps/status/router');

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
  buttonsService  : new ButtonsService()
});

/**
 * ... add SubApps and Services
 */
app.on('before:start', function(options) {

  // attach services to global App
  _.extend(this, {
    entitiesService : new EntitiesService(options),
    statusApp       : new StatusRouter({
      container     : this.layout.getRegion('main')
    })
  });

});

/**
 * Attach app to window for third party plugins
 */
module.exports = app;