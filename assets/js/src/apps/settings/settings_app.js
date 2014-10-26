var POS = (function(App) {

    App.module('SettingsApp', function(SettingsApp, App, Backbone, Marionette, $, _){

        /**
         * Settings Module
         */
        SettingsApp.startWithParent = false;

        SettingsApp.onStart = function(){
            if( App.debug ) console.log('POS Settings Module started');
            var tab = App.getCurrentRoute() || 'general';
            new SettingsApp.Controller({ tab: tab });
        };

    });

    return App;

})(POS || {});