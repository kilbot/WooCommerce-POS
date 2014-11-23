// init Marionette app
var POS = new Marionette.Application();

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
    /* global ajaxurl */
    POS.ajaxurl = ajaxurl;

    // attach params
    var params = [ 'nonce' ];
    _( params ).each( function(key) {
        if( !_.isUndefined( options[key] ) ) {
            POS[key] = options[key];
        }
    });

    /* global adminpage */
    if( options.page === 'settings' ) {
        // regions
        POS.addRegions({
            modalRegion	: '#wc-pos-modal'
        });
    }
});

// on start
POS.on('start', function(options) {
    POS.debugLog( 'log', 'POS Admin App started' );
    POS.startHistory();

    /* global adminpage */
    if( options.page === 'settings' ) {
        POS.module('SettingsApp').start();
    }
});