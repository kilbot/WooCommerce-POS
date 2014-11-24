// init Marionette app
var POS = new Marionette.Application();

// regions
POS.addRegions({
    headerRegion: '#header',
    menuRegion  : '#menu',
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

    // attach params
    var params = [ 'ajaxurl', 'denominations', 'nonce', 'wc_api', 'tax', 'tax_rates', 'worker' ];
    _( params ).each( function(key) {
        if( !_.isUndefined( options[key] ) ) {
            POS[key] = options[key];
        }
    });

    /* global accounting */
    accounting.settings = options.accounting;

});

// on start
POS.on('start', function() {
    POS.debugLog( 'log', 'POS App started' );
    POS.startHistory();

    // header app starts on all pages
    POS.HeaderApp.start();
});