var POS = (function(App, Backbone, Marionette, $, _) {

    // init Marionette app
    var App = new Marionette.Application({ bootstrap: App.bootstrap });
    App.debug = false;

    // entities
    App.Entities = {};
    App.Entities.channel = Backbone.Radio.channel('entities');

    // behaviors
    App.Behaviors = {};
    Marionette.Behaviors.getBehaviorClass = function(options, key) {
        return App.Behaviors[key];
    };

    // components
    App.Components = {};

    // helper functions
    App.navigate = function(route, options){
        options || (options = {});
        Backbone.history.navigate(route, options);
    };
    App.getCurrentRoute = function(){
        var frag = Backbone.history.fragment;
        return _.isEmpty(frag) ? null : frag ;
    };
    App.startHistory = function() {
        if( Backbone.history ) {
            return Backbone.history.start();
        }
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

        //
        App.startHistory();

        /* global adminpage */
        if( adminpage === 'pos_page_wc_pos_settings' ) {
            App.module('SettingsApp').start();
        }

    });

    return App;

})(POS || {}, Backbone, Marionette, jQuery, _);