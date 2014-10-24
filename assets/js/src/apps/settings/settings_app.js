var POS = (function(App) {

    App.module('SettingsApp', function(SettingsApp, App, Backbone, Marionette, $, _){

        /**
         * Settings Module
         */
        SettingsApp.startWithParent = false;

        SettingsApp.onStart = function(){
            if( App.debug ) console.log('POS Settings Module started');
            new SettingsApp.Controller();
        };

    });

    return App;

})(POS || {});