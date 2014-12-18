// init Marionette app
var POS = new Marionette.Application();

// regions
POS.addRegions({
    headerRegion: '#header',
    menuRegion  : '#menu',
    tabsRegion  : '#tabs',
    mainRegion	: '#main',
    modalRegion	: '#modal'
});

// behaviors
Marionette.Behaviors.getBehaviorClass = function(options, key) {
    return POS.Components[key].Behavior;
};

// global channel
POS.channel.reply('default:region', function() {
    return POS.mainRegion;
});

POS.channel.comply('register:instance', function(instance, id) {
    return POS.register(instance, id);
});

POS.channel.comply('unregister:instance', function(instance, id) {
    return POS.unregister(instance, id);
});

// add Entities modules & channel
POS.module( 'Entities', function( Entities ) {
    Entities.channel = Backbone.Radio.channel('entities');
});

// app set up
POS.addInitializer(function(options) {

    // app settings
    this.options = options;

    /* global accounting */
    accounting.settings = options.accounting;

});

// on start
POS.on('start', function(options) {
    POS.debugLog( 'log', 'POS App started' );
    POS.startHistory();

    // header app starts on all pages
    POS.HeaderApp.start();
});