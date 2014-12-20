// init Marionette app
var RootView = Marionette.LayoutView.extend({
    el: '#page',
    template: _.template( $('#page').html() ),
    regions: {
        headerRegion: '#header',
        menuRegion  : '#menu',
        tabsRegion  : '#tabs',
        mainRegion	: '#main',
        modalRegion	: '#modal'
    }
});

var POS = new Marionette.Application({
    initialize: function() {
        this.layout = new RootView();
        this.layout.render();
    }
});

// behaviors
Marionette.Behaviors.getBehaviorClass = function(options, key) {
    return POS.Components[key].Behavior;
};

// global channel
POS.channel.reply('default:region', function() {
    return POS.layout.mainRegion;
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

// on before start
POS.on('before:start', function(options) {
    // app settings
    this.options = options;

    /* global accounting */
    accounting.settings = this.options.accounting;
});

// on start
POS.on('start', function(options) {
    POS.startHistory();

    // header app starts on all pages
    POS.HeaderApp.start();
});