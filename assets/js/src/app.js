var Application = require('apps/app/application');
var _ = require('lodash');

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
app.on('before:start', function(options){

  // attach services to global App
  _.extend( this, {
    entitiesService   : new EntitiesService(options),
    headerService     : new HeaderService({
      headerContainer : this.layout.getRegion('header'),
      menuContainer   : this.layout.getRegion('menu')
    }),
    posApp            : new POSRouter({
      container       : this.layout.getRegion('main')
    }),
    supportApp        : new SupportRouter({
      container       : this.layout.getRegion('main')
    }),
    printApp          : new PrintRouter({
      container       : this.layout.getRegion('main')
    }),
    modalService      : new ModalService(),
    popoverService    : new PopoverService(),
    printService      : new PrintService(),
    tabsService       : new TabsService(),
    buttonsService    : new ButtonsService(),
    numpadService     : new NumpadService()
  } );

});

/**
 * Attach app to window for third party plugins
 */
module.exports = app;