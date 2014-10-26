var POS = (function(App, Backbone, Marionette, $, _) {

    // init Marionette app
    var App = new Marionette.Application({ bootstrap: App.bootstrap });
    App.debug = false;
    App.Behaviors = {};

    // behaviors
    App.Behaviors = {};
    Marionette.Behaviors.getBehaviorClass = function(options, key) {
        return App.Behaviors[key];
    };

    // on start, set up and start modules
    App.on('start', function() {

        // debugging
        if( localStorage.getItem('wc_pos_debug') ) {
            App.debug = true;
            Backbone.Radio.DEBUG = true;
            console.info('Debugging is on, visit http://woopos.com.au/docs/debugging');
        } else {
            console.info('Debugging is off, visit http://woopos.com.au/docs/debugging');
        }

        if( App.debug ) console.log('POS Admin App started');

        /* global adminpage */
        if( adminpage === 'pos_page_wc_pos_settings' ) {
            App.module('SettingsApp').start();
        }

    });

    // start the app when DOM is ready
    $( function(){ App.start(); } );

    return App;

})(POS || {}, Backbone, Marionette, jQuery, _);